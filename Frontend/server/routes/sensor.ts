// @ts-nocheck

import { RequestHandler } from "express";

const API_GATEWAY_URL =
  process.env.VITE_API_GATEWAY_URL ||
  process.env.API_GATEWAY_URL ||
  "https://8s59xcgrw9.execute-api.ap-southeast-1.amazonaws.com/dev";
const API_GATEWAY_API_KEY =
  process.env.VITE_API_GATEWAY_API_KEY || process.env.API_GATEWAY_API_KEY;
const API_GATEWAY_AUTH =
  process.env.VITE_API_GATEWAY_AUTHORIZATION ||
  process.env.API_GATEWAY_AUTHORIZATION;

function buildHeaders(forwardAuth?: string | string[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_GATEWAY_API_KEY) headers["x-api-key"] = API_GATEWAY_API_KEY;
  if (forwardAuth && typeof forwardAuth === "string") {
    headers["Authorization"] = forwardAuth;
  } else if (API_GATEWAY_AUTH) {
    headers["Authorization"] = API_GATEWAY_AUTH;
  }
  return headers;
}

/**
 * GET /api/sensor/latest
 * Proxy tới API Gateway để lấy bản ghi sensor mới nhất cho thiết bị
 */
export const handleGetLatestSensor: RequestHandler = async (req, res) => {
  try {
    const deviceId = (req.query.deviceId as string) || "ESP32_01";
    const url = new URL("/sensor", API_GATEWAY_URL);
    url.searchParams.set("deviceId", deviceId);

    const response = await fetch(url, {
      headers: buildHeaders(req.headers.authorization),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        success: false,
        error: text || response.statusText || "Upstream error",
      });
    }

    const data = await response.json();
    res.json({
      success: true,
      deviceId,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch sensor data",
    });
  }
};


