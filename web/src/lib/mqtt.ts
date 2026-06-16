import mqtt from "mqtt";
import { db } from "@/lib/db";

let client: mqtt.MqttClient | null = null;

export function getMqttClient(): mqtt.MqttClient {
  if (client && client.connected) return client;

  const host = process.env.MQTT_HOST;
  const port = process.env.MQTT_PORT ?? "8883";
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;

  if (!host || !username || !password) {
    throw new Error("MQTT environment variables are not configured.");
  }

  client = mqtt.connect(`mqtts://${host}:${port}`, {
    username,
    password,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  });

  client.on("connect", () => {
    const topic = process.env.MQTT_TOPIC_SENSOR_TELEMETRY ?? "maizai/sensors/+/telemetry";
    client!.subscribe(topic);
  });

  client.on("message", async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString()) as {
        nodeId: string;
        soilMoisture: number;
        ambientTemperature: number;
        relativeHumidity: number;
        recordedAt?: string;
      };

      await db.sensorReading.create({
        data: {
          nodeId: data.nodeId,
          soilMoisture: data.soilMoisture,
          ambientTemperature: data.ambientTemperature,
          relativeHumidity: data.relativeHumidity,
          recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
        },
      });
    } catch {
      // Malformed payloads are silently dropped
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT] Connection error:", err.message);
  });

  return client;
}
