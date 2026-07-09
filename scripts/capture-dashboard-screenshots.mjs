import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const targetUrl = process.env.WKD_SCREENSHOT_URL || "https://wall-kick-defender.dewhui.uk/";
const token = process.env.WKD_DASHBOARD_TOKEN || process.env.WKD_SCREENSHOT_TOKEN || "";
const chromePath = process.env.CHROME_PATH || findChromePath();
const outputDir = path.resolve(process.cwd(), "project", "screenshots");
const userDataDir = path.resolve(process.cwd(), ".tmp", "chrome-screenshot-profile");
const port = Number(process.env.CDP_PORT || 9229);

if (!token) {
  throw new Error("Set WKD_SCREENSHOT_TOKEN or WKD_DASHBOARD_TOKEN before capturing dashboard screenshots.");
}

if (!chromePath) {
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to the browser executable.");
}

await mkdir(outputDir, { recursive: true });
await rm(userDataDir, { recursive: true, force: true });
await mkdir(userDataDir, { recursive: true });

const browser = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  "about:blank",
], {
  stdio: ["ignore", "pipe", "pipe"],
});

browser.stderr.on("data", () => {});
browser.stdout.on("data", () => {});

try {
  await waitForJson(`http://127.0.0.1:${port}/json/version`, 15_000);
  const targets = await waitForJson(`http://127.0.0.1:${port}/json/list`, 15_000);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!pageTarget) {
    throw new Error("Chrome did not expose a page DevTools target.");
  }
  const cdp = await createCdpClient(pageTarget.webSocketDebuggerUrl);

  for (const shot of [
    { name: "dashboard-live-desktop.png", width: 1440, height: 1200, mobile: false },
    { name: "dashboard-live-mobile.png", width: 390, height: 1200, mobile: true },
  ]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: 1,
      mobile: shot.mobile,
    });
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `localStorage.setItem("wkd_dashboard_token", ${JSON.stringify(token)});`,
    });
    await cdp.send("Page.navigate", { url: `${targetUrl}?screenshot=${Date.now()}` });
    await cdp.waitFor("Page.loadEventFired", 20_000);
    await wait(2500);
    await cdp.send("Runtime.evaluate", {
      expression: "window.scrollTo(0, 0)",
      awaitPromise: true,
    });
    const screenshot = await cdp.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await BunWriteFile(path.join(outputDir, shot.name), Buffer.from(screenshot.data, "base64"));
    console.log(`wrote ${path.join("project", "screenshots", shot.name)}`);
  }
} finally {
  browser.kill();
  await Promise.race([once(browser, "exit"), wait(3000)]).catch(() => {});
  await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
}

function findChromePath() {
  const candidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      ]
    : [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ];
  return candidates.find((candidate) => {
    try {
      return requireFsExists(candidate);
    } catch {
      return false;
    }
  });
}

function requireFsExists(filePath) {
  return Boolean(process.getBuiltinModule("fs").existsSync(filePath));
}

async function waitForJson(url, timeoutMs) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message || "no response"}`);
}

function createCdpClient(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();

  socket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result || {});
      return;
    }

    const listeners = events.get(payload.method) || [];
    for (const listener of listeners) listener(payload.params || {});
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          const id = nextId++;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((sendResolve, sendReject) => {
            pending.set(id, { resolve: sendResolve, reject: sendReject });
          });
        },
        waitFor(method, timeoutMs) {
          return new Promise((waitResolve, waitReject) => {
            const timeout = setTimeout(() => {
              listeners.splice(listeners.indexOf(listener), 1);
              waitReject(new Error(`Timed out waiting for ${method}`));
            }, timeoutMs);
            const listener = (params) => {
              clearTimeout(timeout);
              listeners.splice(listeners.indexOf(listener), 1);
              waitResolve(params);
            };
            const listeners = events.get(method) || [];
            listeners.push(listener);
            events.set(method, listeners);
          });
        },
      });
    });
    socket.addEventListener("error", reject);
  });
}

async function BunWriteFile(filePath, data) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(filePath, data);
}
