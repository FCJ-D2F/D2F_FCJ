#ifndef FLAMESENSOR_H
#define FLAMESENSOR_H

#include <Arduino.h>

class FlameSensor {
  public:
    FlameSensor(uint8_t pin);
    void begin();
    bool isStableFlame(unsigned long debounceDelay = 100); // chống nhiễu 100ms mặc định

  private:
    uint8_t pin;
    bool lastReading = false;
    bool stableState = false;
    unsigned long lastChangeTime = 0;
};

#endif
