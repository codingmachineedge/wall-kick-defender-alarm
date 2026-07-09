export function parseList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
export function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampNumber(value, min, max, fallback = min) {
  const parsed = toNumber(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

export function clampInteger(value, min, max, fallback = min) {
  return Math.round(clampNumber(value, min, max, fallback));
}

export function safeEntityList(value) {
  return parseList(value)
    .map((entityId) => entityId.trim())
    .filter((entityId) => /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/.test(entityId));
}

export function parseServiceName(value, fallback = "tts.cloud_say") {
  const normalized = String(value || fallback).trim();
  const [domain, service] = normalized.split(".");
  if (!domain || !service || normalized.split(".").length !== 2) return fallback;
  return `${domain}.${service}`;
}

export function readJsonBody(req, limitBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > limitBytes) {
        reject(Object.assign(new Error("Request body is too large"), { statusCode: 413 }));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400, cause: error }));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

export function sendText(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "content-type": "text/plain; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

export function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function hashString(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededFloat(seed, offset = 0) {
  const hash = hashString(`${seed}:${offset}`);
  return (hash % 10_000) / 10_000;
}

export function toLocalTimeMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function isWithinTimeWindow(windowConfig, date = new Date()) {
  if (!windowConfig?.enabled) return true;
  const start = toLocalTimeMinutes(windowConfig.start);
  const end = toLocalTimeMinutes(windowConfig.end);
  if (start === null || end === null || start === end) return true;

  const now = date.getHours() * 60 + date.getMinutes();
  if (start < end) {
    return now >= start && now < end;
  }
  return now >= start || now < end;
}

export function publicError(error) {
  if (!error) return null;
  return {
    message: error.message || String(error),
    statusCode: error.statusCode || error.status || null,
  };
}
