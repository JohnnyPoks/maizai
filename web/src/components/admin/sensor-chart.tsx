"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface SensorDataPoint {
  recordedAt: string | Date;
  soilMoisture: number;
  ambientTemperature: number;
  relativeHumidity: number;
}

interface SensorChartProps {
  data: SensorDataPoint[];
}

export function SensorChart({ data }: SensorChartProps) {
  const chartData = data.map((d) => ({
    time: format(new Date(d.recordedAt), "HH:mm"),
    "Soil Moisture (%)": Math.round(d.soilMoisture),
    "Temperature (°C)": Math.round(d.ambientTemperature * 10) / 10,
    "Humidity (%)": Math.round(d.relativeHumidity),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            border: "1px solid #bce0c6",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="Soil Moisture (%)"
          stroke="#3d8b5c"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="Temperature (°C)"
          stroke="#b78b56"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="Humidity (%)"
          stroke="#5ba87a"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
