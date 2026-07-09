import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applyTierCaps } from "./tiers.js";
import { parseBoolean, parseList } from "./utils.js";

export function dataDirFromEnv(env = process.env) {
  return path.resolve(env.WKD_DATA_DIR || path.join(process.cwd(), "server", "data"));
}
export function defaultConfigFromEnv(env = process.env) {
  return {
    armed: parseBoolean(env.WKD_ARMED, true),
    sensors: parseList(env.WKD_SENSOR_ENTITIES || "binary_sensor.wall_vibration"),
    mediaPlayers: parseList(env.WKD_MEDIA_PLAYER_ENTITIES || "media_player.bedroom_speaker"),
    activeStates: parseList(
      env.WKD_ACTIVE_STATES || "on,vibration,tilt,drop,detected,active,motion,true"
    ),
    threshold: env.WKD_SENSOR_THRESHOLD || 0.5,
    cooldownSeconds: env.WKD_COOLDOWN_SECONDS || 20,
    pollMs: env.WKD_POLL_MS || 1000,
    responseMode: env.WKD_RESPONSE_MODE || "tts",
    ttsService: env.WKD_TTS_SERVICE || "tts.cloud_say",
    alertMessage: env.WKD_ALERT_MESSAGE || "Wall impact detected. Please stop kicking the wall.",
    alertMediaUrl: env.WKD_ALERT_MEDIA_URL || "",
    mediaContentType: env.WKD_MEDIA_CONTENT_TYPE || "music",
    volume: env.WKD_ALERT_VOLUME || 0.55,
    announce: parseBoolean(env.WKD_ANNOUNCE, true),
    turnOnBeforeAlert: parseBoolean(env.WKD_TURN_ON_BEFORE_ALERT, true),
    escalationEnabled: parseBoolean(env.WKD_ESCALATION_ENABLED, false),
    allowSimulation: parseBoolean(env.WKD_ALLOW_SIMULATION, true),
    sleepWindow: {
      enabled: parseBoolean(env.WKD_SLEEP_WINDOW_ENABLED, false),
      start: env.WKD_SLEEP_WINDOW_START || "23:00",
      end: env.WKD_SLEEP_WINDOW_END || "07:00",
    },
    webhooks: parseList(env.WKD_WEBHOOKS || ""),
  };
}

export async function loadConfig(dataDir, tier, env = process.env) {
  await mkdir(dataDir, { recursive: true });
  const configPath = path.join(dataDir, "config.json");
  let stored = {};
  try {
    stored = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Unable to read config file: ${error.message}`);
    }
  }

  const defaults = defaultConfigFromEnv(env);
  const merged = {
    ...defaults,
    ...stored,
    sleepWindow: {
      ...defaults.sleepWindow,
      ...(stored.sleepWindow || {}),
    },
  };
  const result = applyTierCaps(merged, tier);
  await saveConfig(dataDir, result.config);
  return result;
}

export async function saveConfig(dataDir, config) {
  await mkdir(dataDir, { recursive: true });
  const configPath = path.join(dataDir, "config.json");
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

export function publicConfig(config) {
  return {
    armed: config.armed,
    sensors: config.sensors,
    mediaPlayers: config.mediaPlayers,
    activeStates: config.activeStates,
    threshold: config.threshold,
    cooldownSeconds: config.cooldownSeconds,
    pollMs: config.pollMs,
    responseMode: config.responseMode,
    ttsService: config.ttsService,
    alertMessage: config.alertMessage,
    alertMediaUrl: config.alertMediaUrl,
    mediaContentType: config.mediaContentType,
    volume: config.volume,
    announce: config.announce,
    turnOnBeforeAlert: config.turnOnBeforeAlert,
    escalationEnabled: config.escalationEnabled,
    allowSimulation: config.allowSimulation,
    sleepWindow: config.sleepWindow,
    webhooks: config.webhooks,
  };
}
