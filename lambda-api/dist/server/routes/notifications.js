import { getUserInfo } from "../lib/cognito-auth.js";
import { sendEmail, sendAlertNotification } from "../lib/ses-service.js";
// In-memory storage for notification preferences (in production, use DynamoDB)
const notificationPreferences = {};
/**
 * GET /api/notifications/preferences
 * Get user notification preferences
 */
export const handleGetPreferences = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization required" });
        }
        const accessToken = authHeader.substring(7);
        const userInfo = await getUserInfo(accessToken);
        const preferences = notificationPreferences[userInfo.sub] || {
            alerts: true,
            reports: true,
            weeklySummary: false,
            email: userInfo.email,
        };
        res.json({
            success: true,
            preferences,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || "Failed to get preferences",
        });
    }
};
/**
 * PUT /api/notifications/preferences
 * Update user notification preferences
 */
export const handleUpdatePreferences = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization required" });
        }
        const accessToken = authHeader.substring(7);
        const userInfo = await getUserInfo(accessToken);
        const { alerts, reports, weeklySummary } = req.body;
        notificationPreferences[userInfo.sub] = {
            alerts: alerts !== undefined ? alerts : true,
            reports: reports !== undefined ? reports : true,
            weeklySummary: weeklySummary !== undefined ? weeklySummary : false,
            email: userInfo.email,
        };
        res.json({
            success: true,
            preferences: notificationPreferences[userInfo.sub],
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message || "Failed to update preferences",
        });
    }
};
/**
 * POST /api/notifications/test
 * Send test notification email
 */
export const handleTestNotification = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization required" });
        }
        const accessToken = authHeader.substring(7);
        const userInfo = await getUserInfo(accessToken);
        await sendEmail(userInfo.email, "Test Notification - IoT Monitor", "<p>This is a test notification from IoT Secure Monitor.</p>");
        res.json({
            success: true,
            message: "Test notification sent successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send test notification",
        });
    }
};
/**
 * POST /api/notifications/alert
 * Send alert notification (internal use, called by Lambda)
 */
export const handleSendAlertNotification = async (req, res) => {
    try {
        const { email, alert } = req.body;
        if (!email || !alert) {
            return res.status(400).json({ error: "Email and alert are required" });
        }
        await sendAlertNotification(email, {
            deviceId: alert.deviceId,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            timestamp: new Date(alert.timestamp),
        });
        res.json({
            success: true,
            message: "Alert notification sent",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send alert notification",
        });
    }
};
