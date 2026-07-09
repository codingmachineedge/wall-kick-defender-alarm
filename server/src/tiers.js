import { clampInteger, clampNumber, parseBoolean, parseList, parseServiceName, safeEntityList } from "./utils.js";

export const TIERS = {
  free: {
    id: "free",
    label: "Free",
    summary: "Core local detection after hardware purchase, with Sponsored Silence and tight caps.",
    maxSensors: 1,
    maxMediaPlayers: 1,
    historyLimit: 80,
    minCooldownSeconds: 60,
    minPollMs: 2000,
    maxVolume: 0.35,
    features: {
      customAlerts: false,
      exports: true,
      sleepSchedule: false,
      reports: false,
      escalation: false,
      sponsoredSilence: true,
      multiRoom: false,
      sourceLinks: false,
      webhooks: false,
      courtPacket: false,
    },
  },
  plus: {
    id: "plus",
    label: "Plus",
    summary: "No ad breaks, custom alerts, sleep scheduling, exports, and three-sensor coverage.",
    maxSensors: 3,
    maxMediaPlayers: 3,
    historyLimit: 750,
    minCooldownSeconds: 20,
    minPollMs: 1000,
    maxVolume: 0.7,
    features: {
      customAlerts: true,
      exports: true,
      sleepSchedule: true,
      reports: true,
      escalation: false,
      sponsoredSilence: false,
      multiRoom: true,
      sourceLinks: true,
      webhooks: false,
      courtPacket: false,
    },
  },
  mad: {
    id: "mad",
    label: "MAD",
    summary: "Mutually Assured Disruption hardware profile with surround sensors and escalating volume.",
    maxSensors: 6,
    maxMediaPlayers: 5,
    historyLimit: 1500,
    minCooldownSeconds: 10,
    minPollMs: 750,
    maxVolume: 0.85,
    features: {
      customAlerts: true,
      exports: true,
      sleepSchedule: true,
      reports: true,
      escalation: true,
      sponsoredSilence: false,
      multiRoom: true,
      sourceLinks: true,
      webhooks: false,
      courtPacket: true,
    },
  },
  overlord: {
    id: "overlord",
    label: "Overlord",
    summary: "Full retaliation stack with broad entity caps, escalation, exports, and webhook routing.",
    maxSensors: 24,
    maxMediaPlayers: 12,
    historyLimit: 5000,
    minCooldownSeconds: 3,
    minPollMs: 500,
    maxVolume: 1,
    features: {
      customAlerts: true,
      exports: true,
      sleepSchedule: true,
      reports: true,
      escalation: true,
      sponsoredSilence: false,
      multiRoom: true,
      sourceLinks: true,
      webhooks: true,
      courtPacket: true,
    },
  },
};

const ALIASES = {
  basic: "free",
  ceasefire: "free",
  starter: "free",
  deterrent: "plus",
  pro: "plus",
  paid: "plus",
  "mutually-assured-disruption": "mad",
  mutually_assured_disruption: "mad",
  nuclear: "mad",
  max: "overlord",
  enterprise: "overlord",
};

export function resolveTierId(value) {
  const normalized = String(value || "free").trim().toLowerCase();
  return TIERS[normalized] ? normalized : ALIASES[normalized] || "free";
}
export function getTier(value) {
  return TIERS[resolveTierId(value)];
}

export function serializeTier(tier) {
  return {
    id: tier.id,
    label: tier.label,
    summary: tier.summary,
    maxSensors: tier.maxSensors,
    maxMediaPlayers: tier.maxMediaPlayers,
    historyLimit: tier.historyLimit,
    minCooldownSeconds: tier.minCooldownSeconds,
    minPollMs: tier.minPollMs,
    maxVolume: tier.maxVolume,
    features: { ...tier.features },
  };
}

export function applyTierCaps(rawConfig, tier) {
  const capped = [];
  const config = {
    ...rawConfig,
    activeStates: parseList(rawConfig.activeStates).map((state) => state.toLowerCase()),
    sensors: safeEntityList(rawConfig.sensors).slice(0, tier.maxSensors),
    mediaPlayers: safeEntityList(rawConfig.mediaPlayers).slice(0, tier.maxMediaPlayers),
    volume: clampNumber(rawConfig.volume, 0, tier.maxVolume, Math.min(0.55, tier.maxVolume)),
    threshold: clampNumber(rawConfig.threshold, 0, 1000, 0.5),
    cooldownSeconds: clampInteger(rawConfig.cooldownSeconds, tier.minCooldownSeconds, 3600, tier.minCooldownSeconds),
    pollMs: clampInteger(rawConfig.pollMs, tier.minPollMs, 60_000, Math.max(tier.minPollMs, 1000)),
    armed: parseBoolean(rawConfig.armed, true),
    allowSimulation: parseBoolean(rawConfig.allowSimulation, true),
    responseMode: String(rawConfig.responseMode || "tts").toLowerCase() === "media" ? "media" : "tts",
    ttsService: parseServiceName(rawConfig.ttsService),
    alertMessage: String(rawConfig.alertMessage || "Wall impact detected. Please stop kicking the wall.").slice(0, 240),
    alertMediaUrl: String(rawConfig.alertMediaUrl || "").slice(0, 1000),
    mediaContentType: String(rawConfig.mediaContentType || "music").slice(0, 80),
    announce: parseBoolean(rawConfig.announce, true),
    turnOnBeforeAlert: parseBoolean(rawConfig.turnOnBeforeAlert, true),
    escalationEnabled: parseBoolean(rawConfig.escalationEnabled, false) && tier.features.escalation,
    sleepWindow: {
      enabled: parseBoolean(rawConfig.sleepWindow?.enabled, false) && tier.features.sleepSchedule,
      start: String(rawConfig.sleepWindow?.start || "23:00"),
      end: String(rawConfig.sleepWindow?.end || "07:00"),
    },
    webhooks: tier.features.webhooks ? parseList(rawConfig.webhooks).slice(0, 5) : [],
  };

  if (safeEntityList(rawConfig.sensors).length > config.sensors.length) capped.push("sensors");
  if (safeEntityList(rawConfig.mediaPlayers).length > config.mediaPlayers.length) capped.push("mediaPlayers");
  if (Number(rawConfig.volume) > config.volume) capped.push("volume");
  if (Number(rawConfig.cooldownSeconds) < config.cooldownSeconds) capped.push("cooldownSeconds");
  if (Number(rawConfig.pollMs) < config.pollMs) capped.push("pollMs");
  if (rawConfig.sleepWindow?.enabled && !config.sleepWindow.enabled) capped.push("sleepWindow");
  if (rawConfig.escalationEnabled && !config.escalationEnabled) capped.push("escalation");
  if (rawConfig.webhooks?.length && !config.webhooks.length) capped.push("webhooks");

  if (!tier.features.customAlerts) {
    config.responseMode = "tts";
    config.alertMessage = "Wall impact detected. Upgrade to Plus to customize this warning.";
    config.alertMediaUrl = "";
    capped.push("customAlerts");
  }

  if (!config.activeStates.length) {
    config.activeStates = ["on", "vibration", "tilt", "drop", "detected", "active", "motion", "true"];
  }

  return { config, capped: [...new Set(capped)] };
}
