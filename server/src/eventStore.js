import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { csvEscape } from "./utils.js";

export class EventStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.eventsPath = path.join(dataDir, "events.json");
    this.events = [];
  }

  async load() {
    await mkdir(this.dataDir, { recursive: true });
    try {
      const parsed = JSON.parse(await readFile(this.eventsPath, "utf8"));
      this.events = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw new Error(`Unable to read event store: ${error.message}`);
      }
      this.events = [];
    }
  }

  async save() {
    await mkdir(this.dataDir, { recursive: true });
    await writeFile(this.eventsPath, `${JSON.stringify(this.events, null, 2)}\n`);
  }

  async add(event, historyLimit) {
    this.events.unshift(event);
    this.events = this.events.slice(0, historyLimit);
    await this.save();
    return event;
  }

  async update(eventId, patch) {
    const index = this.events.findIndex((event) => event.id === eventId);
    if (index === -1) return null;
    this.events[index] = {
      ...this.events[index],
      ...patch,
      response: patch.response
        ? {
            ...(this.events[index].response || {}),
            ...patch.response,
          }
        : this.events[index].response,
    };
    await this.save();
    return this.events[index];
  }

  list(limit = 100) {
    return this.events.slice(0, limit);
  }

  stats() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    return {
      total: this.events.length,
      last24h: this.events.filter((event) => now - Date.parse(event.timestamp) <= dayMs).length,
      last7d: this.events.filter((event) => now - Date.parse(event.timestamp) <= weekMs).length,
      lastEventAt: this.events[0]?.timestamp || null,
      averageConfidence: average(this.events.map((event) => Number(event.confidence)).filter(Number.isFinite)),
    };
  }

  toCsv({ tierId, watermark = false } = {}) {
    const rows = [
      [
        "id",
        "timestamp",
        "sensor",
        "state",
        "strength",
        "confidence",
        "severity",
        "tier",
        "response_status",
        "response_detail",
      ],
    ];

    for (const event of this.events) {
      rows.push([
        event.id,
        event.timestamp,
        event.sensor,
        event.rawState,
        event.strength,
        event.confidence,
        event.severity,
        event.tier,
        event.response?.status || "",
        event.response?.detail || "",
      ]);
    }

    if (watermark) {
      rows.push([]);
      rows.push(["UPGRADE?", "Free tier exports are watermarked. Plus removes this footer."]);
    }

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
  }
}
function average(values) {
  if (!values.length) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}
