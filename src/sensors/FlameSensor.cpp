#include "FlameSensor.h"

FlameSensor::FlameSensor(uint8_t p) : pin(p) {}

void FlameSensor::begin() {
  pinMode(pin, INPUT);
}

bool FlameSensor::isStableFlame(unsigned long debounceDelay) {
  bool reading = (digitalRead(pin) == LOW);  // LOW = có lửa

  // Nếu giá trị đọc khác lần trước, reset bộ đếm thời gian
  if (reading != lastReading) {
    lastChangeTime = millis();
    lastReading = reading;
  }

  // Nếu tín hiệu giữ nguyên > debounceDelay => xác nhận là ổn định
  if (millis() - lastChangeTime > debounceDelay) {
    stableState = reading;
  }

  return stableState;
}
