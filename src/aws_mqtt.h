#ifndef AWS_MQTT_H
#define AWS_MQTT_H

#include <Arduino.h>

void connectAWS(); // non-blocking connect attempt (returns quickly or handles internal reconnect)
void loopAWS();    // must be called frequently from loop()
void sendSensorData(float temp, float hum, int gas, bool flame, bool danger);

#endif
