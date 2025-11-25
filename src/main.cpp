#include <Arduino.h>
#include "sensors/DHT11Sensor.h"
#include "sensors/MQ2Sensor.h"
#include "sensors/FlameSensor.h"
#include "actuators/LEDController.h"
#include "actuators/Buzzer.h"
#include "display/OLEDDisplay.h"
#include "Alerts.h"
#include "aws_mqtt.h" 

// ------------------ MODULE KHAI BÁO ------------------
DHT11Sensor dht(4);
MQ2Sensor mq2(34, 400); // analog pin 34, threshold 400
FlameSensor flame(33);
LEDController leds(14, 27, 26); // Red, Yellow, Green
Buzzer buzzer(25);
OLEDDisplay oled;

// ------------------ THỜI GIAN & BIẾN ------------------
static bool lastDangerState = false;       // mới
static unsigned long lastAlertTime = 0;    // mới
const unsigned long ALERT_INTERVAL = 5000; // 5 giây giữa các cảnh báo khi vẫn nguy hiểm
#define DHT_INTERVAL 3000
#define MQ2_INTERVAL 800
#define OLED_INTERVAL 1000
#define DEBUG_INTERVAL 10000

unsigned long lastDHT = 0, lastMQ2 = 0, lastOLED = 0, lastDebug = 0;

float temp = 0, hum = 0;
int gas = 0;
bool flameDetected = false;

// --- smoothing ---
float tempSmooth = 0, humSmooth = 0, gasSmooth = 0;
const float alpha = 0.2; // hệ số lọc trung bình động

// =====================================================
void setup()
{
  Serial.begin(115200);
  Serial.println("Smart Home Monitor Starting...");

  connectAWS();

  dht.begin();
  delay(2000); // chờ DHT11 ổn định 2 giây
  oled.begin();
  flame.begin();
  flame.isStableFlame(); // đọc 1 lần đầu để khởi động trạng thái ổn định
  mq2.begin();

  // --- Cảnh báo ---
  initAlerts(&leds, &buzzer, &mq2, &flame);

  // --- Đọc giá trị ban đầu ---
  temp = dht.readTemperature();
  hum = dht.readHumidity();
  gas = mq2.readAnalog();
  flameDetected = flame.isStableFlame();

  tempSmooth = temp;
  humSmooth = hum;
  gasSmooth = gas;

  oled.updateData(tempSmooth, humSmooth, (int)gasSmooth, mq2.isDanger(), flameDetected);

  Serial.println("System ready.\n");
}

// =====================================================
void loop()
{
  unsigned long now = millis();

  loopAWS();

  mq2.update(); // cập nhật trạng thái MQ2 (non-blocking)


  // --- đọc cảm biến DHT11 ---
  dht.update();
   // đọc lại nếu cần (2s)
  temp = dht.readTemperature();
  hum = dht.readHumidity();

  // --- đọc MQ2 và Flame ---
  if (now - lastMQ2 >= MQ2_INTERVAL)
  {
    gas = mq2.readAnalog();
    flameDetected = flame.isStableFlame(); // lọc nhiễu
    lastMQ2 = now;
  }

  // --- smoothing ---
  tempSmooth = alpha * temp + (1 - alpha) * tempSmooth;
  humSmooth = alpha * hum + (1 - alpha) * humSmooth;
  gasSmooth = alpha * gas + (1 - alpha) * gasSmooth;

  // --- cập nhật OLED mỗi 1 giây ---
  if (now - lastOLED >= OLED_INTERVAL)
  {
    oled.updateData(tempSmooth, humSmooth, (int)gasSmooth, mq2.isDanger(), flameDetected);
    lastOLED = now;
  }

  // --- cập nhật LED & Buzzer ---
  updateAlerts();

  // --- GỬI THÔNG TIN ĐỊNH KỲ HOẶC KHI PHÁT HIỆN NGUY HIỂM ---
  bool dangerNow = mq2.isDanger() || flameDetected; // mới

  if ((dangerNow && !lastDangerState) ||                      // mới phát hiện nguy hiểm
      (dangerNow && now - lastAlertTime >= ALERT_INTERVAL) || // vẫn nguy hiểm → log mỗi 5s
      (!dangerNow && now - lastAlertTime >= DEBUG_INTERVAL))
  {
    if (mq2.isDanger() || flameDetected)
    {
      Serial.println("  ALERT! Danger detected!");
    }

    Serial.print("Temp: ");
    Serial.print(tempSmooth);
    Serial.print(" C | Hum: ");
    Serial.print(humSmooth);
    Serial.print(" % | Gas: ");
    Serial.print(gasSmooth);
    Serial.print(" | Flame: ");
    Serial.println(flameDetected ? "YES" : "NO");

    // **PUBLISH ĐẾN AWS CHỈ KHI ĐÃ ĐƯỢC GIỚI HẠN**
    sendSensorData(tempSmooth, humSmooth, (int)gasSmooth, flameDetected, dangerNow);


    // 🔧 Quan trọng: cập nhật 2 biến trạng thái
    lastAlertTime = now;         // ghi lại thời gian log gần nhất
    lastDangerState = dangerNow; // cập nhật trạng thái nguy hiểm hiện tại

    lastDebug = now; // reset thời gian để không bị spam
  }

  // --- Không delay() để CPU luôn rảnh rỗi ---
}
