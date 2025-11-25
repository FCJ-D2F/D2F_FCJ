/**
 * API Client cho IoT Sensor System
 *
 * ✅ Kết nối với AWS Lambda + DynamoDB
 * Lambda function đọc data thật từ DynamoDB table: IoTSensorData
 *
 * ⚠️ LƯU Ý: Chỉ làm việc trong folder SRC
 * - Tất cả code frontend nằm trong src/
 * - Không động vào folder client/ (đó là Fusion Starter template)
 */

// ============================================
// CONFIG - Cấu hình API Gateway URL
// ============================================

/**
 * URL của API Gateway từ environment variable
 *
 * ✅ URL thật từ AWS API Gateway:
 * https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod
 *
 * Endpoints:
 * - GET  /sensor  - Lấy dữ liệu sensor mới nhất từ DynamoDB
 * - POST /control - Điều khiển thiết bị IoT
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const API_GATEWAY_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  "https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod";

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /sensor - Lấy dữ liệu sensor mới nhất từ DynamoDB
 *
 * Lambda trả về 1 record mới nhất, không có history
 *
 * @param {string} deviceId - ID của thiết bị IoT (mặc định: 'iot-device-001')
 * @returns {Promise<Object>} Response:
 * {
 *   deviceId: string,
 *   timestamp: number,
 *   flame: boolean,      // true/false
 *   gas: number,         // ppm
 *   temperature: number, // °C
 *   humidity: number     // %
 * }
 *
 * @example
 * const data = await fetchSensorData('iot-device-001');
 * console.log(data.gas); // 142
 */
function buildAuthHeaders() {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    if (auth?.accessToken) {
      return { Authorization: `Bearer ${auth.accessToken}` };
    }
  } catch {
    // ignore
  }
  return {};
}

async function fetchInternalSensorData(deviceId) {
  const response = await fetch(
    `${API_BASE_URL}/sensor/latest?deviceId=${encodeURIComponent(deviceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text || `HTTP Error ${response.status}: ${response.statusText}`
    );
  }

  const payload = await response.json();
  if (!payload?.success) {
    throw new Error(payload?.error || "Unknown sensor response");
  }
  return payload.data;
}

export async function fetchSensorData(deviceId = "iot-device-001") {
  try {
    return await fetchInternalSensorData(deviceId);
  } catch (error) {
    console.error("❌ Unable to fetch sensor data:", error);
    throw error;
  }
}

/**
 * POST /control - Điều khiển thiết bị IoT từ xa
 *
 * @param {Object} request - Control request object
 * @param {string} request.deviceId - ID của thiết bị
 * @param {string} request.command - Lệnh điều khiển ('on', 'off', 'reset')
 * @param {*} request.value - Giá trị bổ sung (optional)
 *
 * @returns {Promise<Object>} Response format:
 * {
 *   success: boolean,
 *   message: string,
 *   timestamp: number
 * }
 *
 * @example
 * await controlDevice({
 *   deviceId: 'iot-device-001',
 *   command: 'on'
 * });
 */
export async function controlDevice(request) {
  try {
    const url = `${API_GATEWAY_URL}/control`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error controlling device:", error);
    throw error;
  }
}

/**
 * Alias cho fetchSensorData (giữ backward compatibility)
 *
 * @param {string} deviceId - ID của thiết bị
 * @returns {Promise<Object>} Sensor data
 */
export async function fetchLatestSensorData(deviceId = "iot-device-001") {
  return fetchSensorData(deviceId);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra kết nối API Gateway
 *
 * @returns {Promise<boolean>} true nếu API Gateway hoạt động
 */
export async function checkAPIConnection() {
  try {
    await fetchSensorData("iot-device-001");
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Kiểm tra nếu giá trị gas vượt ngưỡng nguy hiểm
 *
 * @param {number} gasValue - Giá trị khí gas (ppm)
 * @param {number} threshold - Ngưỡng cảnh báo (mặc định: 100 ppm)
 * @returns {boolean} true nếu vượt ngưỡng
 *
 * @example
 * if (isGasDangerous(sensorData.gas)) {
 *   alert('⚠️ Cảnh báo: Nồng độ khí gas cao!');
 * }
 */
export function isGasDangerous(gasValue, threshold = 100) {
  return gasValue > threshold;
}

// ============================================
// EXPORT CONFIG (dành cho các component khác)
// ============================================

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  endpoints: {
    sensor: "/sensor",
    control: "/control",
  },
};

/**
 * ============================================
 * HƯỚNG DẪN SỬ DỤNG
 * ============================================
 *
 * 1. Tạo file .env ở root project:
 *    VITE_API_GATEWAY_URL=https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod
 *
 * 2. Import vào component:
 *    import { fetchSensorData, controlDevice } from '@/api/iot-api';
 *
 * 3. Sử dụng trong component:
 *    const data = await fetchSensorData();
 *    // data = { deviceId, timestamp, flame, gas, temperature, humidity }
 *
 * 4. Xử lý lỗi:
 *    try {
 *      const data = await fetchSensorData();
 *    } catch (error) {
 *      console.error('Lỗi khi tải dữ liệu:', error);
 *    }
 *
 * ⚠️ LƯU Ý:
 * - Lambda function đã kết nối DynamoDB table: IoTSensorData
 * - Chỉ trả về 1 record mới nhất (không có history)
 * - Chỉ làm việc trong folder src/ (KHÔNG động vào client/)
 */
