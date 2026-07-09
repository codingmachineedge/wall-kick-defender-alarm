const els = {};
let state = null;
let stream = null;
let token = localStorage.getItem("wkd_dashboard_token") || "";

document.addEventListener("DOMContentLoaded", () => {
  for (const id of [
    "tierPill", "haPill", "tokenButton", "defenseTitle", "armedBadge", "signalDot", "signalText",
    "signalMeta", "confidenceValue", "waveform", "statTotal", "stat24", "statWeek", "statAvg",
    "armButton", "testButton", "simulateButton", "refreshButton", "runtimeText", "pollText",
    "configForm", "discoverButton", "sensorsInput", "playersInput", "sensorCap", "playerCap",
    "discoveryResults", "responseForm", "responseModePill", "volumeInput", "volumeValue",
    "thresholdInput", "cooldownInput", "pollInput", "activeStatesInput", "responseModeInput",
    "ttsServiceInput", "mediaUrlInput", "mediaTypeInput", "messageInput", "announceInput",
    "turnOnInput", "escalationLabel", "escalationInput", "sleepWindowGroup", "sleepEnabledInput",
    "sleepStartInput", "sleepEndInput", "tierTitle", "tierSummary", "tierCaps", "featureList",
    "entityStates", "logCount", "eventTable", "tokenDialog", "tokenInput", "saveTokenButton", "toast"
  ]) {
    els[id] = document.getElementById(id);
  }

  bindEvents();
  loadState();
});

function bindEvents() {
  els.tokenButton.addEventListener("click", () => showTokenDialog());
  els.saveTokenButton.addEventListener("click", () => {
    token = els.tokenInput.value.trim();
    localStorage.setItem("wkd_dashboard_token", token);
    els.tokenDialog.close();
    loadState();
  });

  els.armButton.addEventListener("click", async () => {
    if (!state) return;
    await api("/api/arm", {
      method: "POST",
      body: JSON.stringify({ armed: !state.config.armed }),
    });
    await loadState();
  });

  els.testButton.addEventListener("click", async () => {
    await api("/api/test-alert", { method: "POST" });
    toast("Test alert queued");
    await loadState();
  });

  els.simulateButton.addEventListener("click", async () => {
    await api("/api/simulate", {
      method: "POST",
      body: JSON.stringify({ strength: Number(els.thresholdInput.value || 1) + 0.7 }),
    });
    toast("Simulated impact recorded");
    await loadState();
  });

  els.refreshButton.addEventListener("click", async () => {
    await api("/api/refresh", { method: "POST" });
    toast("State refreshed");
    await loadState();
  });

  els.discoverButton.addEventListener("click", discoverEntities);
  els.configForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveConfig(collectEntityConfig());
  });
  els.responseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveConfig(collectResponseConfig());
  });
  els.volumeInput.addEventListener("input", () => {
    els.volumeValue.textContent = Number(els.volumeInput.value || 0).toFixed(2);
  });
  els.responseModeInput.addEventListener("change", updateResponseModeVisibility);
}
async function loadState() {
  try {
    state = await api("/api/state");
    render();
    connectStream();
  } catch (error) {
    if (error.statusCode !== 401) toast(error.message);
  }
}

async function api(path, options = {}) {
  const headers = {
    "content-type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["x-wkd-token"] = token;
  const response = await fetch(path, { ...options, headers });
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }
  if (response.status === 401) {
    showTokenDialog();
    throw Object.assign(new Error("Dashboard token required"), { statusCode: 401 });
  }
  if (!response.ok) {
    throw Object.assign(new Error(payload.error || `Request failed with ${response.status}`), {
      statusCode: response.status,
    });
  }
  return payload;
}

function connectStream() {
  if (stream || !state) return;
  const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
  stream = new EventSource(`/api/stream${suffix}`);
  stream.addEventListener("state", (event) => {
    state = JSON.parse(event.data);
    render();
  });
  stream.addEventListener("impact", (event) => {
    const impact = JSON.parse(event.data);
    toast(`${impact.id} recorded from ${impact.sensor}`);
  });
  stream.onerror = () => {
    stream.close();
    stream = null;
    setTimeout(loadState, 2500);
  };
}

function render() {
  if (!state) return;
  renderHeader();
  renderLive();
  renderForms();
  renderTier();
  renderEntities();
  renderEvents();
}

function renderHeader() {
  els.tierPill.textContent = state.tier.label;
  els.haPill.textContent = state.status.haConnected ? "HA connected" : state.status.haConfigured ? "HA offline" : "HA not set";
  els.haPill.className = state.status.haConnected ? "pill" : "pill pill-bad";
}

function renderLive() {
  const armed = Boolean(state.config.armed);
  const latest = state.events[0];
  els.defenseTitle.textContent = armed ? "Defense Armed" : "Defense Disarmed";
  els.armedBadge.textContent = armed ? "ARMED" : "DISARMED";
  els.armedBadge.className = armed ? "state-badge" : "state-badge disarmed";
  els.signalDot.className = armed ? "signal-dot" : "signal-dot off";
  els.signalText.textContent = latest ? `${latest.severity.toUpperCase()} impact ${latest.id}` : "No impacts recorded";
  els.signalMeta.textContent = latest ? `${latest.sensor} at ${formatTime(latest.timestamp)}` : readableHaStatus();
  els.confidenceValue.textContent = latest ? formatConfidence(latest.confidence) : "--";
  els.armButton.textContent = armed ? "Disarm" : "Arm";
  els.simulateButton.disabled = !state.config.allowSimulation;

  renderWaveform(latest?.waveform);
  els.statTotal.textContent = state.stats.total ?? 0;
  els.stat24.textContent = state.stats.last24h ?? 0;
  els.statWeek.textContent = state.stats.last7d ?? 0;
  els.statAvg.textContent = state.stats.averageConfidence ? `${state.stats.averageConfidence}%` : "--";
  els.runtimeText.textContent = `Since ${formatTime(state.runtime.startedAt)}`;
  els.pollText.textContent = state.status.lastPollAt ? formatTime(state.status.lastPollAt) : "--";
}

function renderWaveform(values) {
  const bars = values?.length ? values : Array.from({ length: 28 }, (_, index) => 0.14 + (index % 6) * 0.04);
  els.waveform.replaceChildren(
    ...bars.map((value) => {
      const bar = document.createElement("span");
      bar.style.height = `${Math.max(6, Number(value) * 92)}px`;
      return bar;
    })
  );
}

function renderForms() {
  const config = state.config;
  els.sensorsInput.value = config.sensors.join("\n");
  els.playersInput.value = config.mediaPlayers.join("\n");
  els.sensorCap.textContent = `${state.tier.label} allows ${state.tier.maxSensors} vibration sensor entities.`;
  els.playerCap.textContent = `${state.tier.label} allows ${state.tier.maxMediaPlayers} media player entities.`;
  els.volumeInput.max = state.tier.maxVolume;
  els.volumeInput.value = config.volume;
  els.volumeValue.textContent = Number(config.volume).toFixed(2);
  els.thresholdInput.value = config.threshold;
  els.cooldownInput.value = config.cooldownSeconds;
  els.cooldownInput.min = state.tier.minCooldownSeconds;
  els.pollInput.value = config.pollMs;
  els.pollInput.min = state.tier.minPollMs;
  els.activeStatesInput.value = config.activeStates.join(", ");
  els.responseModeInput.value = config.responseMode;
  els.ttsServiceInput.value = config.ttsService;
  els.mediaUrlInput.value = config.alertMediaUrl;
  els.mediaTypeInput.value = config.mediaContentType;
  els.messageInput.value = config.alertMessage;
  els.announceInput.checked = config.announce;
  els.turnOnInput.checked = config.turnOnBeforeAlert;
  els.escalationInput.checked = config.escalationEnabled;
  els.escalationInput.disabled = !state.tier.features.escalation;
  els.escalationLabel.classList.toggle("muted", !state.tier.features.escalation);
  els.sleepEnabledInput.checked = config.sleepWindow.enabled;
  els.sleepStartInput.value = config.sleepWindow.start;
  els.sleepEndInput.value = config.sleepWindow.end;
  els.sleepWindowGroup.disabled = !state.tier.features.sleepSchedule;
  const customLocked = !state.tier.features.customAlerts;
  els.responseModeInput.disabled = customLocked;
  els.ttsServiceInput.disabled = customLocked;
  els.mediaUrlInput.disabled = customLocked;
  els.mediaTypeInput.disabled = customLocked;
  els.messageInput.disabled = customLocked;
  updateResponseModeVisibility();
}

function updateResponseModeVisibility() {
  const mode = els.responseModeInput.value;
  document.querySelectorAll(".tts-field").forEach((field) => {
    field.hidden = mode !== "tts";
  });
  document.querySelectorAll(".media-field").forEach((field) => {
    field.hidden = mode !== "media";
  });
  els.responseModePill.textContent = mode === "media" ? "Media" : "TTS";
}

function renderTier() {
  els.tierTitle.textContent = state.tier.label;
  els.tierSummary.textContent = state.tier.summary;
  els.tierCaps.replaceChildren(
    capRow("Sensors", state.config.sensors.length, state.tier.maxSensors),
    capRow("Media players", state.config.mediaPlayers.length, state.tier.maxMediaPlayers),
    capRow("Max volume", Number(state.config.volume).toFixed(2), Number(state.tier.maxVolume).toFixed(2)),
    capRow("Min cooldown", `${state.tier.minCooldownSeconds}s`, `${state.config.cooldownSeconds}s`)
  );

  const labels = {
    customAlerts: "Custom alerts",
    exports: "Receipt exports",
    sleepSchedule: "Sleep scheduling",
    reports: "Weekly reports",
    escalation: "Escalating volume",
    sponsoredSilence: "Sponsored Silence",
    multiRoom: "Multi-room coverage",
    sourceLinks: "Paid source links",
    webhooks: "Webhook routing",
    courtPacket: "Court packet",
  };
  els.featureList.replaceChildren(
    ...Object.entries(labels).map(([key, label]) => featureRow(label, Boolean(state.tier.features[key]), key === "sponsoredSilence"))
  );
}

function capRow(label, value, limit) {
  const row = document.createElement("div");
  row.className = "cap-row";
  row.innerHTML = `<strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)} / ${escapeHtml(limit)}</span>`;
  return row;
}

function featureRow(label, enabled, isAnnoyance = false) {
  const row = document.createElement("div");
  const locked = !enabled && !isAnnoyance;
  row.className = `feature-row ${locked ? "locked" : ""}`;
  const status = isAnnoyance ? (enabled ? "ON" : "OFF") : enabled ? "ON" : "LOCKED";
  row.innerHTML = `<strong>${escapeHtml(label)}</strong><span class="feature-status">${status}</span>`;
  return row;
}

function renderEntities() {
  const sensors = state.sensors.map((entity) => entityRow("Sensor", entity));
  const players = state.mediaPlayers.map((entity) => entityRow("Player", entity));
  const empty = document.createElement("p");
  empty.className = "muted";
  empty.textContent = "No entity states loaded.";
  els.entityStates.replaceChildren(...(sensors.length || players.length ? [...sensors, ...players] : [empty]));
}

function entityRow(kind, entity) {
  const row = document.createElement("div");
  row.className = "entity-row";
  const active = entity.active === undefined ? entity.state : entity.active ? "active" : "idle";
  row.innerHTML = `<strong>${escapeHtml(entity.entityId)}</strong><span class="pill pill-muted">${escapeHtml(kind)}: ${escapeHtml(active)}</span>`;
  return row;
}

function renderEvents() {
  els.logCount.textContent = `${state.events.length} events`;
  if (!state.events.length) {
    els.eventTable.innerHTML = `<tr><td colspan="6" class="muted">No incidents recorded yet.</td></tr>`;
    return;
  }

  els.eventTable.replaceChildren(
    ...state.events.map((event) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(event.id)}</td>
        <td>${escapeHtml(formatTime(event.timestamp))}</td>
        <td>${escapeHtml(event.sensor)}</td>
        <td class="${event.redacted ? "redacted" : ""}">${escapeHtml(event.strength)}</td>
        <td class="${event.redacted ? "redacted" : ""}">${escapeHtml(formatConfidence(event.confidence))}</td>
        <td><span class="status ${escapeHtml(event.response?.status || "pending")}">${escapeHtml(event.response?.status || "pending")}</span></td>
      `;
      row.title = event.response?.detail || "";
      return row;
    })
  );
}

async function saveConfig(patch) {
  const result = await api("/api/config", {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  if (result.capped?.length) {
    toast(`Saved with tier caps: ${result.capped.join(", ")}`);
  } else {
    toast("Settings saved");
  }
  await loadState();
}

function collectEntityConfig() {
  return {
    sensors: splitLines(els.sensorsInput.value),
    mediaPlayers: splitLines(els.playersInput.value),
  };
}

function collectResponseConfig() {
  return {
    threshold: Number(els.thresholdInput.value),
    cooldownSeconds: Number(els.cooldownInput.value),
    pollMs: Number(els.pollInput.value),
    activeStates: splitLines(els.activeStatesInput.value),
    responseMode: els.responseModeInput.value,
    ttsService: els.ttsServiceInput.value,
    alertMediaUrl: els.mediaUrlInput.value,
    mediaContentType: els.mediaTypeInput.value,
    alertMessage: els.messageInput.value,
    volume: Number(els.volumeInput.value),
    announce: els.announceInput.checked,
    turnOnBeforeAlert: els.turnOnInput.checked,
    escalationEnabled: els.escalationInput.checked,
    sleepWindow: {
      enabled: els.sleepEnabledInput.checked,
      start: els.sleepStartInput.value,
      end: els.sleepEndInput.value,
    },
  };
}

async function discoverEntities() {
  try {
    const data = await api("/api/entities");
    renderDiscovery(data);
  } catch (error) {
    toast(error.message);
  }
}

function renderDiscovery(data) {
  els.discoveryResults.hidden = false;
  els.discoveryResults.replaceChildren(
    discoveryGroup("Vibration candidates", data.sensors || [], "sensorsInput"),
    discoveryGroup("Media players", data.mediaPlayers || [], "playersInput")
  );
}

function discoveryGroup(title, entities, targetId) {
  const group = document.createElement("div");
  group.className = "discovery-group";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const row = document.createElement("div");
  row.className = "chip-row";
  if (!entities.length) {
    const empty = document.createElement("span");
    empty.className = "muted";
    empty.textContent = "No matches found";
    row.append(empty);
  }
  for (const entity of entities.slice(0, 24)) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<span>${escapeHtml(entity.entityId)}</span>`;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "+";
    button.addEventListener("click", () => appendEntity(targetId, entity.entityId));
    chip.append(button);
    row.append(chip);
  }
  group.append(heading, row);
  return group;
}

function appendEntity(targetId, entityId) {
  const target = els[targetId];
  const values = splitLines(target.value);
  if (!values.includes(entityId)) values.push(entityId);
  target.value = values.join("\n");
}

function splitLines(value) {
  return String(value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function showTokenDialog() {
  els.tokenInput.value = token;
  els.tokenDialog.showModal();
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => els.toast.classList.remove("show"), 3600);
}

function formatTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatConfidence(value) {
  if (typeof value === "number") return `${value}%`;
  return value || "--";
}

function readableHaStatus() {
  if (state.status.haConnected) return "Home Assistant connected";
  if (state.status.haConfigured) return state.status.haLastError?.message || "Home Assistant offline";
  return "Home Assistant credentials not configured";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
