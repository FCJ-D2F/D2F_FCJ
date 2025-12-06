const API_GATEWAY_URL = process.env.VITE_API_GATEWAY_URL ||
    "https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod";
/**
 * GET /api/alerts
 * Get alerts from DynamoDB via Lambda
 */
export const handleGetAlerts = async (req, res) => {
    try {
        const { deviceId, severity, limit = "50" } = req.query;
        // Call Lambda API to get alerts from DynamoDB
        const params = new URLSearchParams();
        if (deviceId)
            params.append("deviceId", deviceId);
        if (severity)
            params.append("severity", severity);
        params.append("limit", limit);
        const response = await fetch(`${API_GATEWAY_URL}/alerts?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            alerts: data.alerts || [],
            total: data.total || 0,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch alerts",
            alerts: [], // Fallback to empty array
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
        const response = await fetch(`${API_GATEWAY_URL}/alerts/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: "Alert not found",
                });
            }
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            alert: data,
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
        const response = await fetch(`${API_GATEWAY_URL}/alerts/${id}/read`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({ read: true }),
        });
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            alert: data,
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
        const response = await fetch(`${API_GATEWAY_URL}/alerts/stats`);
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            stats: data.stats || {
                total: 0,
                bySeverity: {},
                byDevice: {},
            },
        });
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
