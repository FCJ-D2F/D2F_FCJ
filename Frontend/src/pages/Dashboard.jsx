import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/UI/Card.jsx";
import Stat from "../components/UI/Stat.jsx";
import Table from "../components/UI/Table.jsx";
import Badge from "../components/UI/Badge.jsx";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import useTelemetry from "../stores/useTelemetry.js";
import {
  connectMqtt,
  isMqttConnected,
  parseTopics,
} from "../realtime/mqttClient.js";
import { fetchLatestSensorData } from "../api/iot-api.js";

export default function Dashboard() {
  const byDevice = useTelemetry((s) => s.byDevice);
  const alerts = useTelemetry((s) => s.alerts);

  // State để lưu dữ liệu từ Lambda API
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isMqttConnected()) {
      const url = import.meta.env.VITE_MQTT_URL;
      const topics = parseTopics(import.meta.env.VITE_DEFAULT_TOPICS);
      if (url && topics.length) connectMqtt(url, topics);
    }
  }, []);

  // Lấy dữ liệu từ Lambda API
  useEffect(() => {
    const loadSensorData = async () => {
      try {
        const data = await fetchLatestSensorData("iot-device-001");
        setSensorData(data);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error loading sensor data:", error);
        setLoading(false);
      }
    };

    loadSensorData();

    // Auto refresh mỗi 5 giây
    const interval = setInterval(loadSensorData, 5000);

    return () => clearInterval(interval);
  }, []);

  const allTelemetry = useMemo(() => {
    const arr = Object.values(byDevice).flat();
    return arr.sort((a, b) => a.ts - b.ts).slice(-200);
  }, [byDevice]);

  // Sử dụng dữ liệu từ Lambda API thay vì MQTT
  const currentTemp = sensorData?.temperature || 0;
  const currentGas = sensorData?.gas || 0;
  const currentHumidity = sensorData?.humidity || 0;

  // Data cho charts (giữ lại MQTT data nếu có, hoặc dùng API data)
  const tempData =
    allTelemetry.length > 0
      ? allTelemetry.map((t) => ({ ts: t.ts, temp: t.sensors?.temp }))
      : [{ ts: Date.now(), temp: currentTemp }];

  const gasData =
    allTelemetry.length > 0
      ? allTelemetry.map((t) => ({ ts: t.ts, gas: t.sensors?.gas }))
      : [{ ts: Date.now(), gas: currentGas }];

  const humidityData =
    allTelemetry.length > 0
      ? allTelemetry.map((t) => ({ ts: t.ts, humidity: t.sensors?.humidity }))
      : [{ ts: Date.now(), humidity: currentHumidity }];

  const onlineDevices = Object.keys(byDevice).length;
  const lastAlert = alerts[0];

  const flameStatus = sensorData?.flame ? "🔥 YES" : "✅ NO";
  const flameColor = sensorData?.flame ? "text-red-500" : "text-green-500";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Stat label="Devices Online" value={onlineDevices} />
        <Stat
          label="Flame Detection"
          value={loading ? "..." : flameStatus}
          className={flameColor}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Temperature</div>
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-red-500">
                {currentTemp.toFixed(1)}°C
              </div>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                  hide
                />
                <YAxis domain={[0, "auto"]} />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#ef4444"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Gas</div>
            {loading ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-green-500">
                {currentGas.toFixed(1)} ppm
              </div>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gasData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="ts"
                  tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                  hide
                />
                <YAxis domain={[0, "auto"]} />
                <Tooltip
                  labelFormatter={(v) => new Date(v).toLocaleTimeString()}
                />
                <Line
                  type="monotone"
                  dataKey="gas"
                  stroke="#22c55e"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Humidity</div>
          {loading ? (
            <div className="text-xs text-muted-foreground">Loading...</div>
          ) : (
            <div className="text-2xl font-bold text-blue-500">
              {currentHumidity.toFixed(1)}%
            </div>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={humidityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                opacity={0.2}
              />
              <XAxis
                dataKey="ts"
                tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                hide
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleTimeString()}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
