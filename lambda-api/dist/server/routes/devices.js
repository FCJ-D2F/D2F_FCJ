const API_GATEWAY_URL = process.env.VITE_API_GATEWAY_URL ||
    "https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod";
/**
 * GET /api/devices
 * Get list of devices from DynamoDB via Lambda
 */
export const handleGetDevices = async (req, res) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/devices`);
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            devices: data.devices || [],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch devices",
            devices: [], // Fallback to empty array
        });
    }
};
/**
 * GET /api/devices/:id
 * Get device details
 */
export const handleGetDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await fetch(`${API_GATEWAY_URL}/devices/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: "Device not found",
                });
            }
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            device: data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch device",
        });
    }
};
/**
 * GET /api/devices/:id/history
 * Get device telemetry history
 */
export const handleGetDeviceHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, limit = "100" } = req.query;
        const params = new URLSearchParams();
        if (startTime)
            params.append("startTime", startTime);
        if (endTime)
            params.append("endTime", endTime);
        params.append("limit", limit);
        const response = await fetch(`${API_GATEWAY_URL}/devices/${id}/history?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            history: data.history || [],
            total: data.total || 0,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch device history",
            history: [],
        });
    }
};
/**
 * POST /api/devices/:id/command
 * Send command to device via Lambda
 */
export const handleDeviceCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const { command, value } = req.body;
        const authHeader = req.headers.authorization;
        if (!command) {
            return res.status(400).json({
                success: false,
                error: "Command is required",
            });
        }
        const response = await fetch(`${API_GATEWAY_URL}/control`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({
                deviceId: id,
                command,
                value,
            }),
        });
        if (!response.ok) {
            throw new Error(`API Gateway error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json({
            success: true,
            result: data,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send command",
        });
    }
};
