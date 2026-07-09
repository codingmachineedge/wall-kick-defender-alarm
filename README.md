# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read `wall-kick-defender-alarm/project/Search.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `wall-kick-defender-alarm/README.md` — this file
- `wall-kick-defender-alarm/project/` — the `Wall kick defender alarm` project files (HTML prototypes, assets, components)

## Actual Wall Kick Defender Server

This repo now includes a deployable local server and dashboard in `server/`.
It connects to Home Assistant, watches configured vibration sensor entities,
and retaliates through configured `media_player` entities when an impact is
confirmed.

### What it does

- Polls Home Assistant vibration sensors with a configurable threshold.
- Detects binary states like `on`, `vibration`, `tilt`, `drop`, or numeric
  threshold crossings from sensor states/attributes.
- Calls Home Assistant media player services:
  - `media_player.turn_on`
  - `media_player.volume_set`
  - `media_player.play_media` for media mode
  - a configurable TTS service such as `tts.cloud_say` for TTS mode
- Stores local event receipts in JSON under `WKD_DATA_DIR`.
- Streams live state to the web dashboard with Server-Sent Events.
- Enforces the purchased tier server-side from `WKD_TIER`.
- Hosts the dashboard at `/` and the original exported prototype at `/site/`.

### Run Locally

```powershell
Copy-Item .env.example .env
# Edit .env with HA_URL, HA_TOKEN, sensor entities, media player entities, and WKD_TIER.
npm start
```

Open `http://localhost:8080`.

### Run With Docker

```powershell
Copy-Item .env.example .env
# Edit .env first.
docker compose up --build
```

The dashboard is available at `http://localhost:8080`, and persistent config
and receipts are stored in the `wall-kick-defender-data` Docker volume.

### Required Home Assistant Settings

Create a Home Assistant long-lived access token, then set:

```env
HA_URL=http://homeassistant.local:8123
HA_TOKEN=your-long-lived-access-token
WKD_SENSOR_ENTITIES=binary_sensor.wall_vibration
WKD_MEDIA_PLAYER_ENTITIES=media_player.bedroom_speaker
```

Use TTS mode:

```env
WKD_RESPONSE_MODE=tts
WKD_TTS_SERVICE=tts.cloud_say
WKD_ALERT_MESSAGE=Wall impact detected. Please stop kicking the wall.
```

Or media mode:

```env
WKD_RESPONSE_MODE=media
WKD_ALERT_MEDIA_URL=media-source://media_source/local/wall-kick-defender/alert.mp3
WKD_MEDIA_CONTENT_TYPE=music
```

### Purchased Tiers

Set `WKD_TIER` to one of:

- `free`: 1 sensor, 1 media player, lower volume cap, Sponsored Silence, no
  custom alerts or sleep scheduling.
- `plus`: 3 sensors, 3 media players, custom alerts, sleep scheduling, exports,
  and no Sponsored Silence.
- `mad`: 6 sensors, 5 media players, escalating volume, court packet support.
- `overlord`: 24 sensors, 12 media players, webhook routing, full escalation,
  broad history retention.

The dashboard can request settings, but the server always caps them to the
configured tier.

### API Surface

- `GET /api/health`
- `GET /api/state`
- `PUT /api/config`
- `POST /api/arm`
- `POST /api/test-alert`
- `POST /api/simulate`
- `POST /api/refresh`
- `GET /api/entities`
- `GET /api/events`
- `GET /api/events.csv`
- `GET /api/stream`

Set `WKD_DASHBOARD_TOKEN` to require a bearer token or `x-wkd-token` header for
dashboard API calls.
