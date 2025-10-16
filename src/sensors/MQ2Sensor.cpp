#include "MQ2Sensor.h"

MQ2Sensor::MQ2Sensor(uint8_t analogPin, uint16_t th) {
  pin = analogPin;
  threshold = th;
}

void MQ2Sensor::begin() {
  pinMode(pin, INPUT);
  stableStart = millis();
  calibrated = false;
  ready = false;
  Serial.println(F("MQ2 Sensor initialized, warming up..."));
}

void MQ2Sensor::update() {
  // Chờ cảm biến làm nóng
  if (!ready && millis() - stableStart >= warmupTime) {
    ready = true;
    calibrate(); // hiệu chỉnh sau khi warm-up
  }
}

bool MQ2Sensor::isReady() {
  return ready && calibrated;
}

void MQ2Sensor::calibrate(uint16_t samples) {
  uint32_t sum = 0;
  for (uint16_t i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10);  // chỉ delay ngắn, không gây block lớn
  }
  baseLevel = sum / samples;
  calibrated = true;
  Serial.printf("MQ2 Calibrated: base=%d | threshold=%d\n", baseLevel, baseLevel + threshold);
}

int MQ2Sensor::readAnalog() {
  uint32_t total = 0;
  const uint8_t n = 5; // đọc 5 mẫu để giảm nhiễu
  for (uint8_t i = 0; i < n; i++) {
    total += analogRead(pin);
    delayMicroseconds(200);
  }
  lastValue = total / n;
  return lastValue;
}

float MQ2Sensor::readSmooth(float alpha) {
  static float filtered = analogRead(pin);
  filtered = alpha * analogRead(pin) + (1 - alpha) * filtered;
  lastValue = (int)filtered;
  return filtered;
}

bool MQ2Sensor::isDanger() {
  if (!calibrated) return false;

  int value = readAnalog();
  int dangerLevel = baseLevel + threshold;

  if (value >= dangerLevel) {
    dangerCount++;
  } else if (dangerCount > 0) {
    dangerCount--;
  }

  // Nếu vượt ngưỡng 3 lần liên tiếp → báo nguy hiểm
  return dangerCount >= 3;
}

int MQ2Sensor::getBaseLevel() {
  return baseLevel;
}

bool MQ2Sensor::isCalibrated() {
  return calibrated;
}

int MQ2Sensor::getRaw() {
  return lastValue;
}
