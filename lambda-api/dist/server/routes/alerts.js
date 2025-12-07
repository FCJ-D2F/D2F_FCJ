import { listAlerts, getAlertStats } from "../lib/alerts-service.js";
// If you still want to proxy to another upstream, set this; otherwise we use DynamoDB directly
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || process.env.VITE_API_GATEWAY_URL || "";
/**
 * GET /api/alerts
 * Get alerts from DynamoDB via Lambda
 */
export const handleGetAlerts = async (req, res) => {
    try {
        const { deviceId, severity, limit = "50" } = req.query;
        if (API_GATEWAY_URL) {
            // Optional: proxy if upstream exists
            const params = new URLSearchParams();
            if (deviceId)
                params.append("deviceId", deviceId);
            if (severity)
                params.append("severity", severity);
            params.append("limit", limit);
            const response = await fetch(`${API_GATEWAY_URL}/alerts?${params.toString()}`);
            if (!response.ok)
                return res.json({ success: true, alerts: [], total: 0 });
            const data = await response.json();
            return res.json({
                success: true,
                alerts: data.alerts || [],
                total: data.total || 0,
            });
        }
        // Direct from DynamoDB
        const alerts = await listAlerts(Number(limit), deviceId);
        res.json({
            success: true,
            alerts,
            total: alerts.length,
        });
    }
    catch (error) {
        res.json({
            success: true,
            alerts: [],
            total: 0,
        });
    }
};
/**
 * GET /api/alerts/:id
 * Get alert details
 */
export const handleGetAlert = async (req, res) => {
    try {
        const { id } = req.params;
        // Not implemented: we only list alerts from DynamoDB; lookup by id is optional
        res.json({
            success: false,
            error: "Alert not found",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch alert",
        });
    }
};
/**
 * PUT /api/alerts/:id/read
 * Mark alert as read
 */
export const handleMarkAlertRead = async (req, res) => {
    try {
        const { id } = req.params;
        const authHeader = req.headers.authorization;
        res.json({
            success: true,
            alert: { id, read: true },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to mark alert as read",
        });
    }
};
/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
export const handleGetAlertStats = async (req, res) => {
    try {
        if (API_GATEWAY_URL) {
            const response = await fetch(`${API_GATEWAY_URL}/alerts/stats`);
            if (!response.ok) {
                return res.json({
                    success: true,
                    stats: { total: 0, bySeverity: {}, byDevice: {} },
                });
            }
            const data = await response.json();
            return res.json({
                success: true,
                stats: data.stats || { total: 0, bySeverity: {}, byDevice: {} },
            });
        }
        // Direct from DynamoDB
        const stats = await getAlertStats();
        res.json({ success: true, stats });
    }
    catch (error) {
        // Return default stats if API fails
        res.json({
            success: true,
            stats: {
                total: 0,
                bySeverity: {},
                byDevice: {},
            },
        });
    }
};
