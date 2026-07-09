import { applyTierCaps, serializeTier } from "./tiers.js";
import { publicConfig, saveConfig } from "./config.js";
import { hashString, isWithinTimeWindow, publicError, seededFloat } from "./utils.js";

const ATTRIBUTE_STRENGTH_KEYS = [
  "strength",
  "vibration_strength",
  "vibrationstrength",
  "impact_strength",
  "magnitude",
  "amplitude",
  "g_force",
  "voltage",
];

const EXCUSES = [
  "was stretching",
  "the wall moved first",
  "just adjusting the blanket",
  "controller slipped",
  "not even awake",
  "gravity did it",
  "bedframe made that sound",
];

export class WallKickDefender {
  constructor({ config, tier, dataDir, homeAssistant, eventStore }) {
    this.config = config;
    this.tier = tier;
    this.dataDir = dataDir;
    this.homeAssistant = homeAssistant;
    this.eventStore = eventStore;
    this.startedAt = new Date().toISOString();
    this.interval = null;
    this.sensorCache = new Map();
    this.mediaCache = new Map();
    this.lastTriggerBySensor = new Map();
    this.streams = new Set();
    this.status = {
      haConfigured: homeAssistant.configured,
      haConnected: false,
      haLastError: null,
      lastPollAt: null,
      lastTriggeredAt: null,
      lastResponseAt: null,
      running: false,
    };
  }

  async start() {
    await this.eventStore.load();
    this.status.running = true;
    await this.poll({ force: true });
    this.interval = setInterval(() => {
      this.poll().catch((error) => {
        this.status.haLastError = publicError(error);
        this.broadcast("state", this.publicState());
      });
    }, this.config.pollMs);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
    this.status.running = false;
    for (const stream of this.streams) {
      stream.end();
    }
    this.streams.clear();
  }

  async updateConfig(patch) {
    const merged = {
      ...this.config,
      ...patch,
      sleepWindow: {
        ...(this.config.sleepWindow || {}),
        ...(patch.sleepWindow || {}),
      },
    };
    const result = applyTierCaps(merged, this.tier);
    this.config = result.config;
    await saveConfig(this.dataDir, this.config);

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.poll().catch((error) => {
          this.status.haLastError = publicError(error);
          this.broadcast("state", this.publicState());
        });
      }, this.config.pollMs);
    }

    this.broadcast("state", this.publicState());
    return { config: publicConfig(this.config), capped: result.capped };
  }

  async setArmed(armed) {
    return this.updateConfig({ armed: Boolean(armed) });
  }

  async poll({ force = false } = {}) {
    this.status.haConfigured = this.homeAssistant.configured;
    this.status.lastPollAt = new Date().toISOString();

    if (!this.homeAssistant.configured) {
      this.status.haConnected = false;
      this.status.haLastError = { message: "Set HA_URL and HA_TOKEN to connect Home Assistant.", statusCode: null };
      this.broadcast("state", this.publicState());
      return;
    }

    try {
      const sensors = await Promise.all(
        this.config.sensors.map(async (entityId) => {
          const state = await this.homeAssistant.getState(entityId);
          return [entityId, state];
        })
      );

      const mediaPlayers = await Promise.allSettled(
        this.config.mediaPlayers.map(async (entityId) => {
          const state = await this.homeAssistant.getState(entityId);
          return [entityId, state];
        })
      );

      for (const result of mediaPlayers) {
        if (result.status === "fulfilled") {
          this.mediaCache.set(result.value[0], summarizeHaState(result.value[1]));
        }
      }

      this.status.haConnected = true;
      this.status.haLastError = null;

      for (const [entityId, state] of sensors) {
        const evaluated = evaluateSensorState(state, this.config);
        const previous = this.sensorCache.get(entityId);
        this.sensorCache.set(entityId, {
          ...summarizeHaState(state),
          active: evaluated.active,
          strength: evaluated.strength,
          numeric: evaluated.numeric,
        });

        const becameActive = evaluated.active && previous && !previous.active;
        if (becameActive && this.canTrigger(entityId)) {
          await this.recordImpact({
            sensor: entityId,
            rawState: state.state,
            attributes: state.attributes || {},
            strength: evaluated.strength,
            source: "home_assistant",
            simulated: false,
          });
        }
      }
    } catch (error) {
      this.status.haConnected = false;
      this.status.haLastError = publicError(error);
    }

    this.broadcast("state", this.publicState());
  }

  canTrigger(sensor) {
    const last = this.lastTriggerBySensor.get(sensor) || 0;
    const cooldownMs = this.config.cooldownSeconds * 1000;
    return Date.now() - last >= cooldownMs;
  }

  async testAlert() {
    const event = await this.recordImpact({
      sensor: "manual.test",
      rawState: "test",
      attributes: {},
      strength: Math.max(this.config.threshold, 1),
      source: "manual",
      simulated: true,
      forceResponse: true,
    });
    return event;
  }

  async simulateImpact({ sensor, strength, rawState } = {}) {
    if (!this.config.allowSimulation) {
      throw Object.assign(new Error("Simulation is disabled by server config"), { statusCode: 403 });
    }
    return this.recordImpact({
      sensor: sensor || this.config.sensors[0] || "binary_sensor.wall_vibration",
      rawState: rawState || "vibration",
      attributes: { simulated: true },
      strength: Number.isFinite(Number(strength)) ? Number(strength) : Math.max(this.config.threshold, 1),
      source: "simulator",
      simulated: true,
    });
  }

  async recordImpact({ sensor, rawState, attributes, strength, source, simulated, forceResponse = false }) {
    const timestamp = new Date().toISOString();
    this.lastTriggerBySensor.set(sensor, Date.now());
    this.status.lastTriggeredAt = timestamp;

    const sequence = this.eventStore.events.length + 1;
    const id = `WKD-${String(sequence).padStart(5, "0")}`;
    const confidence = calculateConfidence({ id, strength, rawState, simulated });
    const event = {
      id,
      timestamp,
      sensor,
      rawState: String(rawState ?? ""),
      strength: round(strength, 3),
      confidence,
      severity: severityForStrength(strength, this.config.threshold),
      source,
      simulated: Boolean(simulated),
      tier: this.tier.id,
      excuse: EXCUSES[hashString(id) % EXCUSES.length],
      waveform: buildWaveform(id, strength),
      response: {
        status: "pending",
        detail: "Queued",
        actions: [],
      },
    };

    await this.eventStore.add(event, this.tier.historyLimit);
    this.broadcast("impact", this.publicEvent(event, 0));

    const response = await this.dispatchResponse(event, { force: forceResponse });
    const updated = await this.eventStore.update(event.id, { response });
    this.status.lastResponseAt = new Date().toISOString();
    this.broadcast("impact", this.publicEvent(updated, 0));
    this.broadcast("state", this.publicState());
    return this.publicEvent(updated, 0);
  }

  async dispatchResponse(event, { force = false } = {}) {
    const actions = [];

    if (!this.config.armed && !force) {
      return { status: "skipped", detail: "Defender is disarmed", actions };
    }

    if (!isWithinTimeWindow(this.config.sleepWindow) && !force) {
      return { status: "skipped", detail: "Outside configured sleep window", actions };
    }

    if (this.tier.features.sponsoredSilence && this.eventStore.events.length % 4 === 0 && !force) {
      return { status: "sponsored_silence", detail: "Free tier Sponsored Silence skipped this retaliation", actions };
    }

    if (!this.config.mediaPlayers.length) {
      return { status: "skipped", detail: "No media_player entities configured", actions };
    }

    if (!this.homeAssistant.configured) {
      return { status: "offline", detail: "Home Assistant is not configured", actions };
    }

    let failures = 0;
    for (const entityId of this.config.mediaPlayers) {
      try {
        if (this.config.turnOnBeforeAlert) {
          await this.homeAssistant.callService("media_player", "turn_on", { entity_id: entityId });
          actions.push({ entityId, service: "media_player.turn_on", ok: true });
        }

        const volume = this.volumeForEvent(event);
        await this.homeAssistant.callService("media_player", "volume_set", {
          entity_id: entityId,
          volume_level: volume,
        });
        actions.push({ entityId, service: "media_player.volume_set", ok: true, volume });

        if (this.config.responseMode === "media" && this.config.alertMediaUrl) {
          await this.homeAssistant.callService("media_player", "play_media", {
            entity_id: entityId,
            media_content_id: this.config.alertMediaUrl,
            media_content_type: this.config.mediaContentType,
            announce: this.config.announce,
          });
          actions.push({ entityId, service: "media_player.play_media", ok: true });
        } else {
          const [domain, service] = this.config.ttsService.split(".");
          await this.homeAssistant.callService(domain, service, {
            entity_id: entityId,
            message: this.messageForEvent(event),
          });
          actions.push({ entityId, service: this.config.ttsService, ok: true });
        }
      } catch (error) {
        failures += 1;
        actions.push({
          entityId,
          service: this.config.responseMode === "media" ? "media_player.play_media" : this.config.ttsService,
          ok: false,
          error: error.message,
        });
      }
    }

    if (failures === this.config.mediaPlayers.length) {
      return { status: "failed", detail: "All media player calls failed", actions };
    }
    if (failures > 0) {
      return { status: "partial", detail: `${failures} media player call group failed`, actions };
    }
    return { status: "sent", detail: "Retaliation delivered through configured media players", actions };
  }

  volumeForEvent(event) {
    if (!this.config.escalationEnabled) return round(this.config.volume, 3);
    const recentWindowMs = 10 * 60 * 1000;
    const now = Date.parse(event.timestamp);
    const recentCount = this.eventStore.events.filter(
      (item) => now - Date.parse(item.timestamp) <= recentWindowMs
    ).length;
    return round(Math.min(this.tier.maxVolume, this.config.volume + recentCount * 0.05), 3);
  }

  messageForEvent(event) {
    return this.config.alertMessage
      .replaceAll("{id}", event.id)
      .replaceAll("{sensor}", event.sensor)
      .replaceAll("{confidence}", `${event.confidence}%`)
      .replaceAll("{strength}", String(event.strength));
  }

  addStream(res) {
    res.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    });
    res.write(`event: state\ndata: ${JSON.stringify(this.publicState())}\n\n`);
    this.streams.add(res);
    res.on("close", () => this.streams.delete(res));
  }

  broadcast(eventName, payload) {
    const frame = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const stream of this.streams) {
      stream.write(frame);
    }
  }

  publicState() {
    return {
      runtime: {
        startedAt: this.startedAt,
        now: new Date().toISOString(),
      },
      tier: serializeTier(this.tier),
      config: publicConfig(this.config),
      status: this.status,
      sensors: [...this.sensorCache.entries()].map(([entityId, state]) => ({ entityId, ...state })),
      mediaPlayers: [...this.mediaCache.entries()].map(([entityId, state]) => ({ entityId, ...state })),
      stats: this.eventStore.stats(),
      events: this.publicEvents(60),
    };
  }

  publicEvents(limit = 100) {
    return this.eventStore.list(limit).map((event, index) => this.publicEvent(event, index));
  }

  publicEvent(event, index = 0) {
    if (!event) return null;
    const redacted = this.tier.features.sponsoredSilence && (index + 1) % 4 === 0;
    if (!redacted) return event;
    return {
      ...event,
      rawState: "blurred",
      strength: "upgrade",
      confidence: "upgrade",
      excuse: "Free tier mystery incident",
      redacted: true,
      response: {
        ...(event.response || {}),
        detail: "Free tier blurred every fourth incident. Plus removes this.",
      },
    };
  }
}

export function evaluateSensorState(state, config) {
  const rawState = String(state?.state ?? "").trim();
  const normalized = rawState.toLowerCase();
  const activeStates = new Set((config.activeStates || []).map((item) => String(item).toLowerCase()));
  const numeric = extractNumericStrength(state);
  const threshold = Number(config.threshold) || 0;
  const activeByState = activeStates.has(normalized);
  const activeByNumber = numeric !== null && numeric >= threshold;
  return {
    active: activeByState || activeByNumber,
    numeric,
    strength: numeric ?? (activeByState ? Math.max(threshold, 1) : 0),
  };
}

function extractNumericStrength(state) {
  const direct = Number(state?.state);
  if (Number.isFinite(direct)) return direct;
  const attributes = state?.attributes || {};
  for (const key of ATTRIBUTE_STRENGTH_KEYS) {
    const value = Number(attributes[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function summarizeHaState(state) {
  return {
    state: state?.state ?? "unknown",
    name: state?.attributes?.friendly_name || state?.entity_id || "unknown",
    deviceClass: state?.attributes?.device_class || "",
    lastChanged: state?.last_changed || null,
    lastUpdated: state?.last_updated || null,
  };
}

function calculateConfidence({ id, strength, rawState, simulated }) {
  const baseline = String(rawState).toLowerCase() === "off" ? 82 : 93;
  const strengthBoost = Math.min(5.5, Math.max(0, Number(strength) || 0));
  const jitter = seededFloat(id, simulated ? 17 : 3) * 2.2;
  return round(Math.min(99.9, baseline + strengthBoost + jitter), 1);
}

function severityForStrength(strength, threshold) {
  const value = Number(strength) || 0;
  const base = Number(threshold) || 0.5;
  if (value >= base * 4) return "severe";
  if (value >= base * 2) return "high";
  if (value >= base) return "confirmed";
  return "low";
}

function buildWaveform(id, strength) {
  const base = Math.max(0.18, Math.min(1, Number(strength) || 0.5));
  return Array.from({ length: 28 }, (_, index) => {
    const noise = seededFloat(id, index) * 0.55;
    const peak = index > 9 && index < 17 ? 0.36 : 0;
    return round(Math.min(1, 0.12 + base * 0.38 + noise + peak), 3);
  });
}

function round(value, precision = 2) {
  const factor = 10 ** precision;
  return Math.round((Number(value) || 0) * factor) / factor;
}
