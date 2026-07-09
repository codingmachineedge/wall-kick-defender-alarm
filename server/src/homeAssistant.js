export class HomeAssistantClient {
  constructor({ baseUrl, token, timeoutMs = 8000 } = {}) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.token = token || "";
    this.timeoutMs = timeoutMs;
  }

  get configured() {
    return Boolean(this.baseUrl && this.token);
  }

  async request(method, endpoint, body) {
    if (!this.configured) {
      throw Object.assign(new Error("Home Assistant is not configured"), { statusCode: 503 });
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        authorization: `Bearer ${this.token}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = text;
      }
    }

    if (!response.ok) {
      throw Object.assign(
        new Error(`Home Assistant ${method} ${endpoint} failed with ${response.status}`),
        { statusCode: response.status, payload }
      );
    }

    return payload;
  }

  getState(entityId) {
    return this.request("GET", `/api/states/${encodeURIComponent(entityId)}`);
  }

  getStates() {
    return this.request("GET", "/api/states");
  }

  callService(domain, service, data) {
    return this.request("POST", `/api/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`, data);
  }

  async ping() {
    const payload = await this.request("GET", "/api/");
    return payload?.message || "ok";
  }

  async discoverEntities() {
    const states = await this.getStates();
    const entities = Array.isArray(states) ? states : [];
    return {
      sensors: entities
        .filter((entity) => isPossibleVibrationSensor(entity))
        .map(summarizeEntity)
        .sort(compareEntity),
      mediaPlayers: entities
        .filter((entity) => String(entity.entity_id || "").startsWith("media_player."))
        .map(summarizeEntity)
        .sort(compareEntity),
    };
  }
}
function normalizeBaseUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.replace(/\/+$/, "");
}

function summarizeEntity(entity) {
  return {
    entityId: entity.entity_id,
    state: entity.state,
    name: entity.attributes?.friendly_name || entity.entity_id,
    deviceClass: entity.attributes?.device_class || "",
    lastChanged: entity.last_changed,
  };
}

function compareEntity(a, b) {
  return String(a.entityId).localeCompare(String(b.entityId));
}

function isPossibleVibrationSensor(entity) {
  const entityId = String(entity.entity_id || "");
  const deviceClass = String(entity.attributes?.device_class || "").toLowerCase();
  const friendlyName = String(entity.attributes?.friendly_name || "").toLowerCase();
  const domain = entityId.split(".")[0];
  if (!["binary_sensor", "sensor"].includes(domain)) return false;
  return (
    /vibration|vibrate|shock|impact|shake|tamper|motion/.test(entityId.toLowerCase()) ||
    /vibration|vibrate|shock|impact|shake|tamper|motion/.test(friendlyName) ||
    ["vibration", "motion", "moving", "problem", "safety"].includes(deviceClass)
  );
}
