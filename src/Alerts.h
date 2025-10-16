#ifndef ALERTS_H
#define ALERTS_H

#include "actuators/LEDController.h"
#include "actuators/Buzzer.h"
#include "sensors/MQ2Sensor.h"
#include "sensors/FlameSensor.h"

// Khai báo con trỏ toàn cục
extern LEDController* g_leds;
extern Buzzer* g_buzzer;
extern MQ2Sensor* g_mq2;
extern FlameSensor* g_flame;

// Khởi tạo Alerts với LED, Buzzer, MQ2 và Flame
void initAlerts(LEDController* leds, Buzzer* buzzer, MQ2Sensor* mq2, FlameSensor* flame);

// Cập nhật trạng thái LED & Buzzer theo sensor
void updateAlerts();

#endif
