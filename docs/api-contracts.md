# API Contracts

## REST API endpoints

| Method | Path                             | Auth         | Description                                                         |
| ------ | -------------------------------- | ------------ | ------------------------------------------------------------------- |
| GET    | `/api/health`                    | None         | Health check — returns `{ status, timestamp, version }`             |
| GET    | `/api/thresholds`                | None         | Active rule thresholds (used by mobile rule engine)                 |
| PUT    | `/api/thresholds`                | Admin        | Update a rule threshold                                             |
| POST   | `/api/auth/[...nextauth]`        | —            | NextAuth sign-in / sign-out / session endpoints                     |
| POST   | `/api/auth/register`             | None         | Register a new farmer user                                          |
| POST   | `/api/sync/images`               | Farmer       | Upload a leaf image (base64), returns `{ imageId, cloudinaryUrl }`  |
| POST   | `/api/sync/classifications`      | Farmer       | Submit an on-device classification result                           |
| POST   | `/api/sync/readings`             | Farmer       | Submit a sensor reading from mobile                                 |
| GET    | `/api/sensor/latest`             | Farmer       | Latest sensor reading (`?nodeId=` optional)                         |
| POST   | `/api/sensor/ingest`             | Sensor token | Direct ingest from ESP32 node (`x-sensor-token` header)             |
| POST   | `/api/recommendations/generate`  | Farmer       | Run rule engine for a `{ classificationId, readingId? }` pair       |
| GET    | `/api/recommendations/list`      | Farmer       | List recommendations for the authenticated user                     |

All error responses: `{ "error": { "code": "STRING", "message": "Human message." } }`

## MQTT topics

| Topic                                | Direction      | Payload format                                                                      |
| ------------------------------------ | -------------- | ----------------------------------------------------------------------------------- |
| `maizai/sensors/{nodeId}/telemetry`  | Sensor → Cloud | `{ nodeId, soilMoisture, ambientTemperature, relativeHumidity, recordedAt? }`       |

The web back-end subscribes via `src/lib/mqtt.ts` using the HiveMQ Cloud broker (TLS, port 8883).

## Local network protocol (mDNS)

When the farmer is on the plot with no internet, the mobile app discovers the ESP32 sensor node via mDNS. The node advertises the service `_maizai._tcp.local` on port 80. The mobile app polls `http://maizai-node.local/telemetry` (HTTP GET) to retrieve the latest `{ soilMoisture, ambientTemperature, relativeHumidity }` reading and uses it in the on-device rule engine alongside the disease classification.
