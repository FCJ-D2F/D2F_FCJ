import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Auth routes
import {
  handleLogin,
  handleRegister,
  handleConfirmSignUp,
  handleRefreshToken,
  handleGetUser,
  handleForgotPassword,
  handleResetPassword,
} from "./routes/auth.js";

// Alerts routes
import {
  handleGetAlerts,
  handleGetAlert,
  handleMarkAlertRead,
  handleGetAlertStats,
} from "./routes/alerts.js";

// Devices routes
import {
  handleGetDevices,
  handleGetDevice,
  handleGetDeviceHistory,
  handleDeviceCommand,
} from "./routes/devices.js";

// Reports routes
import {
  handleListReports,
  handleDownloadReport,
  handleGenerateReport,
  handleDeleteReport,
} from "./routes/reports.js";

// Notifications routes
import {
  handleGetPreferences,
  handleUpdatePreferences,
  handleTestNotification,
  handleSendAlertNotification,
} from "./routes/notifications.js";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/confirm", handleConfirmSignUp);
  app.post("/api/auth/refresh", handleRefreshToken);
  app.get("/api/auth/me", handleGetUser);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/reset-password", handleResetPassword);

  // Alerts routes
  app.get("/api/alerts", handleGetAlerts);
  app.get("/api/alerts/stats", handleGetAlertStats);
  app.get("/api/alerts/:id", handleGetAlert);
  app.put("/api/alerts/:id/read", handleMarkAlertRead);

  // Devices routes
  app.get("/api/devices", handleGetDevices);
  app.get("/api/devices/:id", handleGetDevice);
  app.get("/api/devices/:id/history", handleGetDeviceHistory);
  app.post("/api/devices/:id/command", handleDeviceCommand);

  // Reports routes
  app.get("/api/reports", handleListReports);
  app.get("/api/reports/:id/download", handleDownloadReport);
  app.post("/api/reports/generate", handleGenerateReport);
  app.delete("/api/reports/:id", handleDeleteReport);

  // Notifications routes
  app.get("/api/notifications/preferences", handleGetPreferences);
  app.put("/api/notifications/preferences", handleUpdatePreferences);
  app.post("/api/notifications/test", handleTestNotification);
  app.post("/api/notifications/alert", handleSendAlertNotification);

  return app;
}
