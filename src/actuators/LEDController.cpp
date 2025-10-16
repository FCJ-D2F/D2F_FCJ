#include "LEDController.h"

LEDController::LEDController(uint8_t r, uint8_t y, uint8_t g){
  red = r;
  yellow = y;
  green = g;
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  pinMode(green, OUTPUT);
}

void LEDController::setRed(bool state){ digitalWrite(red, state); }
void LEDController::setYellow(bool state){ digitalWrite(yellow, state); }
void LEDController::setGreen(bool state){ digitalWrite(green, state); }
void LEDController::setAll(bool state){
  setRed(state);
  setYellow(state);
  setGreen(state);
}
void LEDController::resetAll(){ setAll(false); }  // ← thêm dòng này

void LEDController::blinkRed(bool blinkState){ digitalWrite(red, blinkState ? HIGH : LOW); }
void LEDController::blinkYellow(bool blinkState){ digitalWrite(yellow, blinkState ? HIGH : LOW); }
