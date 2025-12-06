// @ts-nocheck
const API_GATEWAY_URL = process.env.VITE_API_GATEWAY_URL ||
    process.env.API_GATEWAY_URL ||
    "https://7wgy47gj08.execute-api.ap-southeast-1.amazonaws.com/dev";
// Hiện tại API Gateway không yêu cầu API key hay Authorization,
// nên ta chỉ cần gửi Content-Type đơn giản như khi gọi trực tiếp từ browser.
function buildHeaders() {
    return {
        "Content-Type": "application/json",
    };
}
/**
 * GET /api/sensor/latest
 * Proxy tới API Gateway để lấy bản ghi sensor mới nhất cho thiết bị
 */
export const handleGetLatestSensor = async (req, res) => {
    try {
        const deviceId = req.query.deviceId || "ESP32_01";
        // ⚠️ Không dùng "/sensor" vì sẽ làm mất path "/dev" trong API_GATEWAY_URL
        const url = new URL("sensor", API_GATEWAY_URL);
        url.searchParams.set("deviceId", deviceId);
        const response = await fetch(url, {
            headers: buildHeaders(),
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch sensor data",
        });
    }
};
