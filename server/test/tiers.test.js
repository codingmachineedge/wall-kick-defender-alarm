import assert from "node:assert/strict";
import test from "node:test";
import { applyTierCaps, getTier } from "../src/tiers.js";
import { evaluateSensorState } from "../src/detector.js";

test("free tier caps entities, volume, polling, and paid-only controls", () => {
  const tier = getTier("free");
  const { config, capped } = applyTierCaps(
    {
      sensors: ["binary_sensor.one", "binary_sensor.two"],
      mediaPlayers: ["media_player.one", "media_player.two"],
      activeStates: ["on"],
      volume: 0.95,
      cooldownSeconds: 5,
      pollMs: 250,
      responseMode: "media",
      alertMessage: "custom",
      alertMediaUrl: "https://example.invalid/alert.mp3",
      mediaContentType: "music",
      escalationEnabled: true,
      sleepWindow: { enabled: true, start: "22:00", end: "07:00" },
      webhooks: ["https://example.invalid"],
      armed: true,
    },
    tier
  );

  assert.deepEqual(config.sensors, ["binary_sensor.one"]);
  assert.deepEqual(config.mediaPlayers, ["media_player.one"]);
  assert.equal(config.volume, 0.35);
  assert.equal(config.cooldownSeconds, 60);
  assert.equal(config.pollMs, 2000);
  assert.equal(config.responseMode, "tts");
  assert.equal(config.escalationEnabled, false);
  assert.equal(config.sleepWindow.enabled, false);
  assert.deepEqual(config.webhooks, []);
  assert.ok(capped.includes("sensors"));
  assert.ok(capped.includes("customAlerts"));
});
test("overlord tier allows broad entity sets and escalation", () => {
  const tier = getTier("overlord");
  const sensors = Array.from({ length: 10 }, (_, index) => `binary_sensor.vibration_${index}`);
  const mediaPlayers = Array.from({ length: 8 }, (_, index) => `media_player.speaker_${index}`);
  const { config, capped } = applyTierCaps(
    {
      sensors,
      mediaPlayers,
      activeStates: ["on", "vibration"],
      volume: 1,
      cooldownSeconds: 3,
      pollMs: 500,
      escalationEnabled: true,
      sleepWindow: { enabled: true, start: "23:00", end: "06:30" },
      webhooks: ["https://example.invalid/hook"],
      armed: true,
    },
    tier
  );

  assert.equal(config.sensors.length, 10);
  assert.equal(config.mediaPlayers.length, 8);
  assert.equal(config.volume, 1);
  assert.equal(config.escalationEnabled, true);
  assert.equal(config.sleepWindow.enabled, true);
  assert.deepEqual(config.webhooks, ["https://example.invalid/hook"]);
  assert.deepEqual(capped, []);
});

test("sensor state detects binary active values", () => {
  const result = evaluateSensorState(
    { state: "vibration", attributes: {} },
    { activeStates: ["on", "vibration"], threshold: 0.5 }
  );

  assert.equal(result.active, true);
  assert.equal(result.strength, 1);
});

test("sensor state detects numeric threshold crossings", () => {
  const low = evaluateSensorState(
    { state: "0.2", attributes: {} },
    { activeStates: ["on"], threshold: 0.5 }
  );
  const high = evaluateSensorState(
    { state: "0.9", attributes: {} },
    { activeStates: ["on"], threshold: 0.5 }
  );

  assert.equal(low.active, false);
  assert.equal(high.active, true);
  assert.equal(high.strength, 0.9);
});

test("sensor state reads common vibration strength attributes", () => {
  const result = evaluateSensorState(
    { state: "idle", attributes: { vibration_strength: 7 } },
    { activeStates: ["on"], threshold: 5 }
  );

  assert.equal(result.active, true);
  assert.equal(result.numeric, 7);
});
