// Buzzer.h
#ifndef BUZZER_H
#define BUZZER_H
#include <Arduino.h>

class Buzzer {
  public:
    Buzzer(uint8_t pin);

    void on();
    void off();
    void blink(bool blinkState); // nhấp nháy đồng bộ với LED

  private:
    uint8_t pin;
};

#endif
