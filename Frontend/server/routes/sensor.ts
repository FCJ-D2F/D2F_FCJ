// @ts-nocheck

import { RequestHandler } from "express";

const API_GATEWAY_URL =
  process.env.VITE_API_GATEWAY_URL ||
  process.env.API_GATEWAY_URL ||
  "https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod";

/**
 * GET /api/sensor/latest
 * Proxy tới API Gateway để lấy bản ghi sensor mới nhất cho thiết bị
 */
export const handleGetLatestSensor: RequestHandler = async (req, res) => {
  try {
    const deviceId = (req.query.deviceId as string) || "iot-device-001";
    const url = new URL("/sensor", API_GATEWAY_URL);
    url.searchParams.set("deviceId", deviceId);

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
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


