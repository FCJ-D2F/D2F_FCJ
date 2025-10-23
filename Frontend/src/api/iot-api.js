/**
 * API Client cho IoT Sensor System
 *
 * File này chứa tất cả các hàm gọi API tới AWS Lambda qua API Gateway
 *
 * ⚠️ LƯU Ý: Chỉ làm việc trong folder SRC
 * - Tất cả code frontend nằm trong src/
 * - Không động vào folder client/ (đó là Fusion Starter template)
 */

// ============================================
// CONFIG - Cấu hình API Gateway URL
// ============================================

/**
 * Lấy URL của API Gateway từ environment variable
 *
 * ✅ URL thật từ AWS API Gateway:
 * https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod
 *
 * Endpoints:
 * - GET  /sensor  - Lấy dữ liệu sensor (gas, nhiệt độ, độ ẩm)
 * - POST /control - Điều khiển thiết bị IoT
 */
const API_BASE_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  "https://wx3vckwog1.execute-api.us-east-1.amazonaws.com/prod";

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /sensor - Lấy dữ liệu sensor realtime + lịch sử
 *
 * @param {string} deviceId - ID của thiết bị IoT (mặc định: 'iot-device-001')
 * @param {number} limit - Số lượng records lịch sử (mặc định: 24)
 *
 * @returns {Promise<Object>} Response format:
 * {
 *   deviceId: string,
 *   current: {
 *     deviceId: string,
 *     timestamp: number,
 *     gas: number,        // ppm
 *     temperature: number, // °C
 *     humidity: number     // %
 *   },
 *   history: Array<SensorData>
 * }
 *
 * @example
 * const data = await fetchSensorData('iot-device-001', 24);
 * console.log(data.current.gas); // 87.3
 */
export async function fetchSensorData(deviceId = "iot-device-001", limit = 24) {
  try {
    const url = `${API_BASE_URL}/sensor?deviceId=${deviceId}&limit=${limit}`;

    console.log("🔄 Fetching sensor data from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Sensor data loaded:", data);

    return data;
  } catch (error) {
    console.error("❌ Error fetching sensor data:", error);
    throw error;
  }
}

/**
 * POST /control - Điều khiển thiết bị IoT từ xa
 *
 * @param {Object} request - Control request object
 * @param {string} request.deviceId - ID của thiết bị
 * @param {string} request.command - Lệnh điều khiển ('on', 'off', 'reset')
 * @param {*} request.value - Giá trị bổ sung (optional, ví dụ: tốc độ quạt)
 *
 * @returns {Promise<Object>} Response format:
 * {
 *   success: boolean,
 *   message: string,
 *   timestamp: number
 * }
 *
 * @example
 * // Bật thiết bị
 * await controlDevice({
 *   deviceId: 'iot-device-001',
 *   command: 'on'
 * });
 *
 * // Điều chỉnh tốc độ
 * await controlDevice({
 *   deviceId: 'iot-device-001',
 *   command: 'set_speed',
 *   value: 75
 * });
 */
export async function controlDevice(request) {
  try {
    const url = `${API_BASE_URL}/control`;

    console.log("🔄 Sending control command:", request);

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
    console.log("✅ Control command sent:", data);

    return data;
  } catch (error) {
    console.error("❌ Error controlling device:", error);
    throw error;
  }
}

/**
 * Lấy dữ liệu sensor mới nhất (chỉ current, không lấy history)
 *
 * @param {string} deviceId - ID của thiết bị
 * @returns {Promise<Object>} Current sensor data only
 *
 * @example
 * const current = await fetchLatestSensorData('iot-device-001');
 * console.log(`Gas: ${current.gas} ppm`);
 */
export async function fetchLatestSensorData(deviceId = "iot-device-001") {
  try {
    const data = await fetchSensorData(deviceId, 1);
    return data.current;
  } catch (error) {
    console.error("❌ Error fetching latest sensor data:", error);
    throw error;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra kết nối API Gateway
 *
 * @returns {Promise<boolean>} true nếu API Gateway hoạt động
 *
 * @example
 * const isOnline = await checkAPIConnection();
 * if (!isOnline) {
 *   alert('Không thể kết nối tới server!');
 * }
 */
export async function checkAPIConnection() {
  try {
    await fetchSensorData("iot-device-001", 1);
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
 *    VITE_API_GATEWAY_URL=https://your-api-id.execute-api.ap-southeast-1.amazonaws.com
 *
 * 2. Import vào component:
 *    import { fetchSensorData, controlDevice } from '@/api/iot-api';
 *
 * 3. Sử dụng trong component:
 *    const data = await fetchSensorData();
 *    await controlDevice({ deviceId: 'iot-device-001', command: 'on' });
 *
 * 4. Xử lý lỗi:
 *    try {
 *      const data = await fetchSensorData();
 *    } catch (error) {
 *      console.error('Lỗi khi tải dữ liệu:', error);
 *    }
 *
 * ⚠️ LƯU Ý QUAN TRỌNG:
 * - Chỉ làm việc trong folder src/ (KHÔNG động vào client/)
 * - File này nằm tại: src/api/iot-api.js
 * - Tất cả API calls đều đi qua file này
 * - Sau này khi có DynamoDB/IoT Core, chỉ cần sửa Lambda functions
 */
