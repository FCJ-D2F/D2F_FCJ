// LEDController.h
#ifndef LEDCONTROLLER_H
#define LEDCONTROLLER_H
#include <Arduino.h>

class LEDController {
  public:
    LEDController(uint8_t redPin, uint8_t yellowPin, uint8_t greenPin);

    // Bật/tắt LED cố định
    void setRed(bool state);
    void setYellow(bool state);
    void setGreen(bool state);
    void setAll(bool state);
    void resetAll();

    // Nhấp nháy LED theo nhịp (blinkState = true/false)
    void blinkRed(bool blinkState);
    void blinkYellow(bool blinkState);

  private:
    uint8_t red, yellow, green;
};

#endif
