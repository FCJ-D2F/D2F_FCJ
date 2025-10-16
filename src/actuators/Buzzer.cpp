// Buzzer.cpp
#include "Buzzer.h"

Buzzer::Buzzer(uint8_t p){
  pin = p;
  pinMode(pin, OUTPUT);
  off();
}

void Buzzer::on(){ digitalWrite(pin, LOW); }
void Buzzer::off(){ digitalWrite(pin, HIGH); }
void Buzzer::blink(bool blinkState){ digitalWrite(pin, blinkState ? LOW : HIGH); }
