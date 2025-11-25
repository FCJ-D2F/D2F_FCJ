# ESP32 Smart Home Monitoring System with AWS IoT

A comprehensive IoT monitoring system built on ESP32 that continuously monitors temperature, humidity, gas levels, and flame detection. Data is transmitted to AWS IoT Core in real-time for remote monitoring and alerting.

## 🌟 Features

### Sensor Monitoring
- **Temperature & Humidity:** DHT11 sensor with real-time readings
- **Gas Detection:** MQ2 sensor for LPG and smoke detection with configurable threshold
- **Flame Detection:** Digital flame sensor with anti-noise filtering
- **Data Smoothing:** Exponential averaging filter (α = 0.2) for stable readings

### Alert System
- **LED Indicators:**
  - 🔴 Red LED: Gas danger alert
  - 🟡 Yellow LED: Blinking when danger detected
  - 🟢 Green LED: System normal/safe status
- **Audio Alert:** Buzzer synchronized with LED status
- **Smart Alerting:** 5-second alert interval to prevent alarm fatigue

### Display & Visualization
- **128x64 OLED Display:** Real-time sensor data display
- **Information Shown:**
  - Current temperature (°C)
  - Current humidity (%)
  - Gas level (analog value)
  - Gas danger status
  - Flame detection status

### AWS IoT Integration
- **Cloud Connectivity:** Secure connection to AWS IoT Core with TLS
- **MQTT Messaging:** Publish sensor data every 1 second
- **Data Queue:** Local buffer for offline data handling
- **JSON Format:** Structured data transmission for cloud processing
- **Non-blocking:** Asynchronous WiFi & MQTT for responsive system

### System Features
- **Modular Design:** Well-organized code with separate sensor and actuator classes
- **Non-blocking Operation:** All time-sensitive operations use millis() timing
- **Automatic Reconnection:** Smart WiFi and AWS reconnection logic
- **NTP Time Sync:** Automatic clock synchronization for TLS handshake

## 📋 Hardware Requirements

### Microcontroller
- **ESP32 Development Board** (with WiFi & Bluetooth capability)

### Sensors
- **DHT11** - Temperature & Humidity Sensor
- **MQ2** - Gas Sensor (analog output, sensitivity for LPG/Smoke)
- **KY-026** - Flame Sensor (digital IR detection)

### Actuators
- **3× LED** with current-limiting resistors (220Ω-470Ω)
- **Buzzer** (passive or active)

### Display
- **SSD1306 OLED Display** (128×64 pixels, I2C interface)

### Power Supply
- 5V USB power for development
- Consider additional 3.3V regulator if running many sensors

## 📦 Project Structure

```
Demo_02_Connect_AWS/
├── src/
│   ├── main.cpp                    # Main program loop
│   ├── aws_config.h               # AWS IoT credentials & WiFi config
│   ├── aws_mqtt.h/cpp            # AWS IoT connection & MQTT functions
│   ├── Alerts.h/cpp              # Alert system management
│   ├── sensors/
│   │   ├── DHT11Sensor.h/cpp     # Temperature & humidity sensor
│   │   ├── MQ2Sensor.h/cpp       # Gas detection sensor
│   │   └── FlameSensor.h/cpp     # Flame detection sensor
│   ├── actuators/
│   │   ├── LEDController.h/cpp   # RGB LED control
│   │   └── Buzzer.h/cpp          # Buzzer control
│   └── display/
│       └── OLEDDisplay.h/cpp     # OLED display management
├── platformio.ini                 # Build configuration
├── include/                       # Header files (if needed)
├── lib/                          # External libraries
└── test/                         # Test files
```

## 🔧 Building & Deployment

### Quick Start

1. **Install Dependencies:**
   ```bash
   # Ensure PlatformIO is installed in VS Code
   # Dependencies auto-download on first build
   ```

2. **Configure Credentials:**
   ```bash
   # Edit src/aws_config.h
   # Add WiFi SSID/Password
   # Add AWS IoT Endpoint & Certificates
   ```

3. **Build:**
   ```bash
   pio run -e esp32dev
   ```

4. **Upload:**
   ```bash
   pio run -e esp32dev -t upload
   ```

5. **Monitor:**
   ```bash
   pio device monitor -b 115200
   ```

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🔌 Pin Configuration

| Component | ESP32 Pin | Notes |
|-----------|-----------|-------|
| DHT11 Data | GPIO 4 | Single wire protocol |
| MQ2 Analog | GPIO 34 | ADC input, threshold: 400 |
| Flame Sensor | GPIO 33 | Digital input |
| LED Red | GPIO 14 | Active HIGH |
| LED Yellow | GPIO 27 | Active HIGH |
| LED Green | GPIO 26 | Active HIGH |
| Buzzer | GPIO 25 | Active HIGH |
| OLED SDA | GPIO 21 | I2C Data |
| OLED SCL | GPIO 22 | I2C Clock |

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Main Loop (main.cpp)                 │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼─────┐      ┌──────▼──────┐
    │ Sensors │         │ Actuators │      │ AWS IoT    │
    └────┬────┘         └────┬─────┘      └──────┬──────┘
         │                   │                    │
    ┌────▼──────────┐    ┌────▼─────────┐  ┌─────▼──────┐
    │ DHT11 Temp    │    │ LEDController │  │ MQTT Pub/Sub │
    │ MQ2 Gas       │    │ Buzzer        │  │ WiFi Connect │
    │ Flame Detect  │    │ OLED Display  │  │ Time Sync    │
    └───────────────┘    └───────────────┘  └──────────────┘
         │                      │                    │
         └──────────────────────┼────────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │ Alert System (Alerts.h) │
                    │ - Monitor danger state  │
                    │ - Trigger LED & Buzzer │
                    │ - 5s alert interval   │
                    └────────────────────────┘
```

## 📡 Data Flow

### Local Processing
1. **Sensor Reading** (100-3000ms intervals)
   - DHT11: Temperature & Humidity
   - MQ2: Gas level with debouncing
   - FlameSensor: Flame detection

2. **Data Smoothing**
   - Exponential averaging to reduce noise
   - Output stable readings to display & alerts

3. **Alert Evaluation**
   - Compare against thresholds
   - Trigger LED/Buzzer if danger detected
   - Update OLED display

### Cloud Transmission
```json
{
  "timestamp": "2025-11-25T10:30:45Z",
  "temperature": 28.5,
  "humidity": 65.2,
  "gas_level": 350,
  "flame_detected": false,
  "danger_state": false,
  "device_id": "ESP32_01"
}
```

## 🚀 AWS IoT Integration

### Topics
- **Publish:** `esp32/pub` - Sensor data (1 second interval)
- **Subscribe:** `esp32/sub` - Command reception

### Workflow
1. WiFi connects to network
2. Time syncs via NTP (required for TLS)
3. Establishes secure connection to AWS IoT Core
4. Publishes sensor data in JSON format
5. Listens for incoming commands
6. Auto-reconnects on connection loss

### Offline Handling
- Local queue stores up to 10 messages when offline
- Messages sent when connection restored

## ⚙️ Configuration Reference

### Sensor Intervals
```cpp
#define DHT_INTERVAL 3000      // Read DHT every 3 seconds
#define MQ2_INTERVAL 800       // Read MQ2 every 800ms
#define OLED_INTERVAL 1000     // Update display every 1 second
#define DEBUG_INTERVAL 10000   // Debug output every 10 seconds
```

### Alert Behavior
```cpp
const unsigned long ALERT_INTERVAL = 5000;  // 5 seconds between alerts
const float alpha = 0.2;                     // Smoothing factor
```

### Gas Threshold
```cpp
MQ2Sensor mq2(34, 400);  // Pin 34, danger threshold: 400
```

### Sensor Initialization
```cpp
DHT11Sensor dht(4);              // Temperature/humidity
MQ2Sensor mq2(34, 400);          // Gas sensor
FlameSensor flame(33);            // Flame detection
LEDController leds(14, 27, 26);  // Red, Yellow, Green
Buzzer buzzer(25);               // Audio alert
OLEDDisplay oled;                // Display
```

## 📈 Performance Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| WiFi Connection Time | ~5-10s | Includes NTP sync |
| AWS IoT Connection Time | ~2-5s | After WiFi ready |
| Data Publish Rate | 1/second | To AWS IoT Core |
| Display Update Rate | 1/second | OLED refresh |
| Sensor Read Rate | 100-3000ms | Varies per sensor |
| Alert Frequency | 5 seconds | When danger detected |
| Memory Usage | ~200KB | Stack + Heap + WiFi buffers |
| Power Consumption | ~100-150mA | Average (WiFi active) |

## 🐛 Troubleshooting

### Common Issues

**WiFi Connection Fails**
- Verify SSID and password in `aws_config.h`
- Ensure 2.4GHz band is available
- Check router is not blocking ESP32 MAC address

**AWS IoT Connection Fails**
- Verify endpoint URL and certificates
- Ensure device time is synchronized
- Check IoT policy permissions
- Validate certificates not expired

**Sensor Readings Incorrect**
- Check pin assignments and hardware connections
- Verify power supply to sensors
- Allow warm-up time (DHT11: 2s, MQ2: 5s)
- Check I2C pull-up resistors for OLED

**OLED Not Displaying**
- Verify I2C address (default: 0x3C)
- Check SDA/SCL connections
- Add 4.7kΩ pull-up resistors if needed

See [SETUP.md](SETUP.md) for detailed troubleshooting guide.

## 📝 Code Examples

### Reading Sensor Data
```cpp
// Temperature & Humidity
float temp = dht.readTemperature();
float hum = dht.readHumidity();

// Gas level with debouncing
int gas = mq2.readAnalog();
bool gasAlert = mq2.isDanger();

// Flame detection with noise filtering
bool flame = flame.isStableFlame();
```

### Publishing to AWS IoT
```cpp
// Automatic in main loop
// Called every 1 second
sendSensorData(temp, hum, gas, flame, dangerState);
```

### Controlling Actuators
```cpp
// LED Control
leds.setRed(true);      // Turn on red LED
leds.blinkYellow(true); // Blink yellow LED
leds.resetAll();        // Turn off all LEDs

// Buzzer Control
buzzer.on();            // Turn on buzzer
buzzer.blink(true);     // Sync with LED blink
buzzer.off();           // Turn off buzzer
```

## 📚 Dependencies

- **Arduino Framework** - ESP32 core libraries
- **PubSubClient** - MQTT client for AWS IoT
- **DHT sensor library** - Temperature/humidity sensor
- **U8g2** - OLED display driver
- **WiFiClientSecure** - TLS/SSL for secure connection
- **ArduinoJson** - JSON handling
- **Adafruit Unified Sensor** - Sensor abstraction layer

## 🔐 Security Considerations

- **TLS 1.2:** Encrypted communication with AWS IoT
- **Certificate-based Authentication:** X.509 device certificates
- **Policy-based Access Control:** AWS IoT policies restrict operations
- **No Hardcoded Secrets:** Credentials in separate config file
- **Time Validation:** NTP sync ensures certificate validity

⚠️ **Important:** Keep AWS certificates private and never commit them to public repositories.

## 📄 License

This project is provided as-is for educational and development purposes.

## 👨‍💻 Developer Notes

- All sensor readings are non-blocking
- Use millis() timing to avoid blocking delays
- MQTT queue handles offline periods
- Exponential smoothing improves display stability
- LED/Buzzer patterns synchronized for user feedback

## 🔄 Version History

- **v1.0** (Current) - Initial release with WiFi, AWS IoT, sensors, and alerting

## 📞 Support

For setup assistance, see [SETUP.md](SETUP.md)
For hardware questions, refer to datasheets:
- ESP32: https://www.espressif.com/
- DHT11: Adafruit DHT sensor library documentation
- MQ2: Gas sensor datasheet
- SSD1306: OLED datasheet

---

**Happy Monitoring! 🎉**
