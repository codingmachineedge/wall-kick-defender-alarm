import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
import { readJsonBody, sendJson, sendText } from "./utils.js";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

export function createHttpApp({ defender, homeAssistant, dashboardToken = "", rootDir = process.cwd() }) {
  const publicDir = path.join(rootDir, "server", "public");
  const projectDir = path.join(rootDir, "project");
  const token = String(dashboardToken || "");

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

      if (url.pathname === "/api/health" && req.method === "GET") {
        sendJson(res, 200, {
          ok: true,
          haConfigured: homeAssistant.configured,
          running: defender.status.running,
          tier: defender.tier.id,
        });
        return;
      }

      if (url.pathname.startsWith("/api/")) {
        if (!isAuthorized(req, url, token)) {
          sendJson(res, 401, { error: "Dashboard token required" });
          return;
        }
        await routeApi(req, res, url, defender, homeAssistant);
        return;
      }

      if (url.pathname === "/site") {
        redirect(res, "/site/");
        return;
      }
      if (url.pathname.startsWith("/site/")) {
        await serveStatic(req, res, projectDir, url.pathname.slice("/site/".length));
        return;
      }
      if (url.pathname === "/legacy") {
        redirect(res, "/legacy/");
        return;
      }
      if (url.pathname.startsWith("/legacy/")) {
        await serveStatic(req, res, rootDir, url.pathname.slice("/legacy/".length));
        return;
      }

      await serveStatic(req, res, publicDir, url.pathname === "/" ? "index.html" : url.pathname);
    } catch (error) {
      const statusCode = error.statusCode || 500;
      sendJson(res, statusCode, { error: error.message || "Server error" });
    }
  });
}

async function routeApi(req, res, url, defender, homeAssistant) {
  if (url.pathname === "/api/state" && req.method === "GET") {
    sendJson(res, 200, defender.publicState());
    return;
  }

  if (url.pathname === "/api/config" && req.method === "PUT") {
    const body = await readJsonBody(req);
    sendJson(res, 200, await defender.updateConfig(body));
    return;
  }

  if (url.pathname === "/api/arm" && req.method === "POST") {
    const body = await readJsonBody(req);
    sendJson(res, 200, await defender.setArmed(body.armed));
    return;
  }

  if (url.pathname === "/api/test-alert" && req.method === "POST") {
    sendJson(res, 201, { event: await defender.testAlert() });
    return;
  }

  if (url.pathname === "/api/simulate" && req.method === "POST") {
    const body = await readJsonBody(req);
    sendJson(res, 201, { event: await defender.simulateImpact(body) });
    return;
  }

  if (url.pathname === "/api/refresh" && req.method === "POST") {
    await defender.poll({ force: true });
    sendJson(res, 200, defender.publicState());
    return;
  }

  if (url.pathname === "/api/events" && req.method === "GET") {
    const limit = Number(url.searchParams.get("limit") || 100);
    sendJson(res, 200, { events: defender.publicEvents(limit) });
    return;
  }

  if (url.pathname === "/api/events.csv" && req.method === "GET") {
    const csv = defender.eventStore.toCsv({
      tierId: defender.tier.id,
      watermark: defender.tier.features.sponsoredSilence,
    });
    res.writeHead(200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="wall-kick-defender-events.csv"',
      "cache-control": "no-store",
    });
    res.end(csv);
    return;
  }

  if (url.pathname === "/api/entities" && req.method === "GET") {
    sendJson(res, 200, await homeAssistant.discoverEntities());
    return;
  }

  if (url.pathname === "/api/stream" && req.method === "GET") {
    defender.addStream(res);
    return;
  }

  sendJson(res, 404, { error: "Unknown API route" });
}

function isAuthorized(req, url, dashboardToken) {
  if (!dashboardToken) return true;
  const header = req.headers.authorization || req.headers["x-wkd-token"] || "";
  const bearer = String(header).replace(/^Bearer\s+/i, "");
  return bearer === dashboardToken || url.searchParams.get("token") === dashboardToken;
}

async function serveStatic(req, res, rootDir, requestedPath) {
  if (!["GET", "HEAD"].includes(req.method)) {
    sendText(res, 405, "Method not allowed");
    return;
  }

  const decoded = decodeURIComponent(String(requestedPath || "index.html").replace(/^\/+/, ""));
  const target = path.resolve(rootDir, decoded || "index.html");
  const root = path.resolve(rootDir);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  let filePath = target;
  let fileStat;
  try {
    fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileStat = await stat(filePath);
    }
  } catch {
    sendText(res, 404, "Not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "content-type": MIME_TYPES[extension] || "application/octet-stream",
    "content-length": fileStat.size,
    "cache-control": extension === ".html" ? "no-cache" : "public, max-age=3600",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

function redirect(res, location) {
  res.writeHead(308, { location });
  res.end();
}
