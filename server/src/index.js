import { getTier } from "./tiers.js";
import { dataDirFromEnv, loadConfig } from "./config.js";
import { HomeAssistantClient } from "./homeAssistant.js";
import { EventStore } from "./eventStore.js";
import { WallKickDefender } from "./detector.js";
import { createHttpApp } from "./httpServer.js";

const env = process.env;
const rootDir = process.cwd();
const port = Number(env.PORT || 8080);
const tier = getTier(env.WKD_TIER || env.WKD_LICENSE_TIER || "free");
const dataDir = dataDirFromEnv(env);

const { config, capped } = await loadConfig(dataDir, tier, env);
const homeAssistant = new HomeAssistantClient({
  baseUrl: env.HA_URL,
  token: env.HA_TOKEN,
  timeoutMs: Number(env.HA_TIMEOUT_MS || 8000),
});
const eventStore = new EventStore(dataDir);
const defender = new WallKickDefender({
  config,
  tier,
  dataDir,
  homeAssistant,
  eventStore,
});

await defender.start();

const server = createHttpApp({
  defender,
  homeAssistant,
  dashboardToken: env.WKD_DASHBOARD_TOKEN,
  rootDir,
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Wall Kick Defender server listening on http://0.0.0.0:${port}`);
  console.log(`Tier: ${tier.label} (${tier.id})`);
  if (capped.length) console.log(`Tier caps applied: ${capped.join(", ")}`);
  if (!homeAssistant.configured) console.log("Home Assistant is not configured; dashboard simulation is available.");
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    defender.stop();
    server.close(() => process.exit(0));
  });
}
