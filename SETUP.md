# Setup Guide - ESP32 Smart Home Monitoring with AWS IoT

## Prerequisites

- **Hardware:**
  - ESP32 Development Board (esp32dev)
  - DHT11 Temperature & Humidity Sensor
  - MQ2 Gas Sensor (analog)
  - Flame Sensor (digital)
  - 3x LED (Red, Yellow, Green) with resistors
  - Buzzer
  - 128x64 OLED Display (I2C)
  - Micro-USB cable for programming

- **Software:**
  - Visual Studio Code
  - PlatformIO IDE extension
  - Python 3.x (for PlatformIO)

## Hardware Connections

### Pin Configuration (ESP32)

| Component | Pin | Notes |
|-----------|-----|-------|
| DHT11 | GPIO 4 | Data pin |
| MQ2 (Analog) | GPIO 34 | ADC pin, threshold: 400 |
| Flame Sensor | GPIO 33 | Digital input |
| LED Red | GPIO 14 | Active HIGH |
| LED Yellow | GPIO 27 | Active HIGH |
| LED Green | GPIO 26 | Active HIGH |
| Buzzer | GPIO 25 | Active HIGH |
| OLED SDA | GPIO 21 | I2C Data (Hardware I2C) |
| OLED SCL | GPIO 22 | I2C Clock (Hardware I2C) |
| GND | GND | Ground for all sensors |
| 3.3V/5V | VCC | Power for sensors |

**Note:** ESP32 pinout is built-in for I2C (SDA=GPIO21, SCL=GPIO22). Ensure pull-up resistors (4.7kΩ) are connected for I2C if needed.

## Software Setup

### 1. Install PlatformIO
```bash
# Install the PlatformIO extension in VS Code
# Search for "PlatformIO IDE" in Extensions tab and click Install
```

### 2. Clone/Open Project
```bash
# Open the project folder in VS Code
File > Open Folder > Select "Demo_02_Connect_AWS"
```

### 3. Configure AWS IoT Credentials

Edit `src/aws_config.h`:

```cpp
// Wi-Fi Configuration
#define WIFI_SSID "Your_WiFi_SSID"
#define WIFI_PASSWORD "Your_WiFi_Password"

// AWS IoT Core Endpoint
#define AWS_IOT_ENDPOINT "your-endpoint-ats.iot.ap-southeast-1.amazonaws.com"

// AWS Thing Name (must match AWS IoT Core)
#define AWS_IOT_CLIENT_ID "ESP32_01"

// MQTT Topics
#define AWS_IOT_PUBLISH_TOPIC "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/sub"
```

#### Obtaining AWS Credentials:

1. **Log in to AWS IoT Core Console:**
   - Go to AWS IoT Core → Manage → Things
   - Select your Thing (or create a new one named "ESP32_01")

2. **Get Endpoint:**
   - Go to Settings
   - Copy the Endpoint URL
   - Replace in `AWS_IOT_ENDPOINT`

3. **Download Certificates:**
   - Select your Thing → Security → Certificates
   - Download:
     - Amazon Root CA certificate
     - Device certificate
     - Device private key
   - Open each file and replace the corresponding sections in `aws_config.h`:
     - `AWS_CERT_CA[]` - Amazon Root CA
     - `AWS_CERT_CRT[]` - Device certificate
     - `AWS_CERT_PRIVATE_KEY[]` - Private key

4. **Attach IoT Policy:**
   - Ensure your certificate has an IoT Policy attached
   - Policy must allow `connect`, `subscribe`, `publish`, and `receive` actions on the topics

### 4. Install Dependencies

PlatformIO automatically downloads dependencies listed in `platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps =
    olikraus/U8g2 @ ^2.34.22
    adafruit/DHT sensor library @ ^1.4.3
    knolleary/PubSubClient @ ^2.8
    WiFiClientSecure
    bblanchon/ArduinoJson @ ^6.21.1
```

### 5. Build & Upload

```bash
# Build the project
PlatformIO: Build

# Upload to ESP32
PlatformIO: Upload

# Monitor Serial Output
PlatformIO: Monitor (115200 baud)
```

### 6. Monitor Serial Output

Open Serial Monitor at **115200 baud** to see:
- Startup messages
- WiFi connection status
- AWS IoT connection status
- Sensor readings
- Alert information

Expected output:
```
Smart Home Monitor Starting...
[WiFi] Connecting to: Xom Tro
[WiFi] Connected! IP: 192.168.1.100
[AWS] Connecting to AWS IoT...
✅ AWS Connected!
System ready.

[Sensors] Temp: 28.5°C, Hum: 65%, Gas: 350, Flame: No
[AWS] Data published
```

## System Architecture

### Sensors Module
- **DHT11Sensor:** Reads temperature & humidity (updates every 3 seconds)
- **MQ2Sensor:** Detects LPG, smoke, alcohol (analog, threshold: 400)
- **FlameSensor:** Digital flame detection with debouncing (100ms)

### Actuators Module
- **LEDController:** RGB status indicators
  - Red: Gas danger
  - Yellow: Blinking when gas/flame detected
  - Green: System normal
- **Buzzer:** Audio alert synchronized with LED

### Display
- **OLEDDisplay:** 128x64 OLED showing real-time sensor data

### Alert System
- Monitors all sensors
- Triggers LED + Buzzer when danger detected
- Alert interval: 5 seconds (prevents continuous alerts)

### AWS IoT Integration
- Non-blocking WiFi & MQTT connection
- Publishes sensor data to `esp32/pub` topic
- Subscribes to `esp32/sub` for commands
- Data format: JSON with temperature, humidity, gas level, flame status
- Publish interval: 1 second

## Troubleshooting

### WiFi Connection Issues
- Verify SSID and password in `aws_config.h`
- Check WiFi signal strength
- Ensure 2.4GHz band is enabled on router (ESP32 doesn't support 5GHz)

### AWS IoT Connection Failed
- Verify endpoint URL is correct
- Check certificates are not expired
- Ensure IoT policy allows required actions
- Verify device has internet access

### Sensor Readings Are 0 or Incorrect
- Check pin assignments in `src/main.cpp`
- Verify hardware connections and power supply
- DHT11 requires 2-second warm-up time
- MQ2 requires 5-second warm-up time

### OLED Display Not Showing Data
- Check I2C connection (SDA=GPIO21, SCL=GPIO22)
- Verify pull-up resistors are connected
- Ensure U8g2 library is installed
- Default I2C address: 0x3C

### Serial Monitor Shows Garbage
- Verify baud rate is 115200
- Check USB cable connection
- Try a different USB port

## Configuration Parameters

| Parameter | Value | Location | Purpose |
|-----------|-------|----------|---------|
| DHT_INTERVAL | 3000 ms | main.cpp | Temperature/humidity read frequency |
| MQ2_INTERVAL | 800 ms | main.cpp | Gas sensor read frequency |
| OLED_INTERVAL | 1000 ms | main.cpp | Display update frequency |
| ALERT_INTERVAL | 5000 ms | main.cpp | Alert repetition interval |
| warmupTime | 5000 ms | MQ2Sensor.h | Gas sensor warm-up time |
| debounceDelay | 100 ms | FlameSensor.h | Flame sensor debounce |
| alpha | 0.2 | main.cpp | Exponential smoothing factor |

## Testing Checklist

- [ ] All sensors connected and powered
- [ ] PlatformIO installed and project opens without errors
- [ ] WiFi credentials configured in `aws_config.h`
- [ ] AWS IoT certificates installed in `aws_config.h`
- [ ] Project compiles without errors (PlatformIO: Build)
- [ ] Successfully uploads to ESP32
- [ ] Serial monitor shows "System ready"
- [ ] WiFi connection successful
- [ ] AWS IoT connection established
- [ ] Sensor data appears in serial monitor
- [ ] OLED display shows sensor readings
- [ ] LEDs respond to sensor changes
- [ ] Buzzer sounds on alert trigger
- [ ] Data publishes to AWS IoT Core

## Next Steps

1. Verify all connections and test each sensor independently
2. Configure AWS IoT policy for your use case
3. Set up AWS IoT Rules Engine to process messages
4. Create CloudWatch metrics to monitor sensor data
5. Set up SNS notifications for critical alerts

## Support & Resources

- [PlatformIO Documentation](https://docs.platformio.org/)
- [AWS IoT Core Guide](https://docs.aws.amazon.com/iot-core/)
- [ESP32 Pinout Reference](https://randomnerdtutorials.com/esp32-pinout-reference-which-gpio-pins-are-safe-to-use/)
- [U8g2 Library Documentation](https://github.com/olikraus/u8g2)
- [DHT Sensor Library](https://github.com/adafruit/DHT-sensor-library)
