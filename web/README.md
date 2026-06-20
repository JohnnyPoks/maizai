# MaizAI — Web Application

Next.js 15 full-stack application serving three roles: public landing page, admin dashboard, and REST API back-end for the MaizAI mobile app and sensor node.

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict mode |
| Database | PostgreSQL (Neon in production, local for dev) |
| ORM | Prisma 5 |
| Authentication | NextAuth.js v5 (Auth.js) — Credentials + JWT |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Image storage | Cloudinary free tier |
| MQTT broker | HiveMQ Cloud free tier |
| Deployment | Vercel |

## Local development

### Prerequisites

- Node.js ≥ 18
- pnpm (`npm install -g pnpm`)
- A local PostgreSQL instance (e.g. via `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres:16`)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file and fill in values
cp .env.example .env.local

# 3. Run database migrations
pnpm db:migrate        # creates tables in your local PostgreSQL

# 4. Seed default admin user and rule thresholds
pnpm db:seed

# 5. Start the development server
pnpm dev
```

The app is available at `http://localhost:3000`.

The seed creates a super-admin from the `SUPER_ADMIN_EMAIL` and
`SUPER_ADMIN_PASSWORD` values in your `.env.local`. Set them before running
`pnpm db:seed`, then sign in at `http://localhost:3000/sign-in`. Credentials are
never committed — keep them in your local environment only.

## Environment variables

See [.env.example](.env.example) for all required variables. Key values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string (`openssl rand -base64 32`) |
| `CLOUDINARY_*` | Cloudinary project credentials |
| `MQTT_*` | HiveMQ Cloud credentials |
| `SENSOR_INGEST_TOKEN` | Shared secret for the ESP32 sensor node |

## API contracts

All endpoints return `application/json`. Non-public endpoints require a valid session cookie (dashboard) or Bearer token.

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/thresholds` | Read active rule thresholds (used by mobile) |

### Farmer-authenticated (session cookie or JWT Bearer)

| Method | Path | Description |
|---|---|---|
| POST | `/api/sync/images` | Upload a captured leaf image, returns `imageId` and Cloudinary URL |
| POST | `/api/sync/classifications` | Submit an on-device classification result |
| POST | `/api/sync/readings` | Submit a sensor reading |
| GET | `/api/sensor/latest` | Return the latest sensor reading (`?nodeId=` optional) |
| POST | `/api/recommendations/generate` | Run rule engine for a classification + reading pair |
| GET | `/api/recommendations/list` | List recommendations for the authenticated user |

### Sensor node (x-sensor-token header)

| Method | Path | Description |
|---|---|---|
| POST | `/api/sensor/ingest` | Direct ingest from ESP32 — set `x-sensor-token` header |

### Admin-only

| Method | Path | Description |
|---|---|---|
| PUT | `/api/thresholds` | Update a rule threshold |

### Error format

All errors return:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message."
  }
}
```

## Prisma migrations

```bash
# Create and apply a new migration during development
pnpm db:migrate

# Apply pending migrations to production (run once against production DATABASE_URL)
pnpm exec prisma migrate deploy

# Re-generate the Prisma client after schema changes
pnpm exec prisma generate
```

## Deployment to Vercel

1. Push this directory to GitHub (root of the project, import `web/` as root).
2. In Vercel project settings, add all environment variables from `.env.example`.
3. Set **Build Command** to `pnpm prisma generate && pnpm build`.
4. Set **Framework preset** to Next.js.
5. Before the first deployment, run `pnpm exec prisma migrate deploy` once against the production `DATABASE_URL`.
6. Deploy and verify at `<deployment-url>/api/health`.

## MQTT sensor subscription

The file [src/lib/mqtt.ts](src/lib/mqtt.ts) exports `getMqttClient()`, which connects to HiveMQ Cloud and subscribes to `MQTT_TOPIC_SENSOR_TELEMETRY`. To activate it in production, call `getMqttClient()` inside a long-running Next.js route or Vercel Cron handler. The sensor node is expected to publish JSON matching `SensorIngestRequest`.

## Rule engine

The rule engine ([src/lib/rule-engine.ts](src/lib/rule-engine.ts)) loads active `RuleThreshold` records from PostgreSQL, filters by disease class, and matches sensor parameters. The same threshold data structure (`GET /api/thresholds`) is consumed by the mobile app to run an equivalent rule engine on-device using live mDNS sensor data.
