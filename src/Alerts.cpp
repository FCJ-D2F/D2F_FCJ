#include "Alerts.h"

// Khởi tạo con trỏ toàn cục
LEDController* g_leds = nullptr;
Buzzer* g_buzzer = nullptr;
MQ2Sensor* g_mq2 = nullptr;
FlameSensor* g_flame = nullptr;

// Thời gian debounce Buzzer (ms)
static unsigned long lastBuzzerTime = 0;
const unsigned long BUZZER_MIN_INTERVAL = 500; // Buzzer chỉ kích hoạt ≥ 0.5s/lần

void initAlerts(LEDController* leds, Buzzer* buzzer, MQ2Sensor* mq2, FlameSensor* flame) {
    g_leds = leds;
    g_buzzer = buzzer;
    g_mq2 = mq2;
    g_flame = flame;
}

void updateAlerts() {
    if (!g_leds || !g_buzzer || !g_mq2 || !g_flame) return;

    // Kiểm tra trạng thái nguy hiểm
    bool flame = g_flame->isStableFlame();
    bool gasDanger = g_mq2->isDanger();
    bool danger = flame || gasDanger;

    // Điều khiển Buzzer với debounce
    if (danger) {
        unsigned long now = millis();
        if (now - lastBuzzerTime >= BUZZER_MIN_INTERVAL) {
            g_buzzer->on();
            lastBuzzerTime = now;
        }
    } else {
        g_buzzer->off();
    }

    // ---- Điều khiển LED ----
    if (flame) {
        g_leds->setRed(true);
        g_leds->setYellow(false);
        g_leds->setGreen(false);
        //Serial.println("ALERT: Flame detected!");
    } 
    else if (gasDanger) {
        g_leds->setRed(false);
        g_leds->setYellow(true);
        g_leds->setGreen(false);
        //Serial.println("ALERT: Gas level high!");
    } 
    else {
        // ✅ Môi trường bình thường → LED xanh sáng ổn định
        g_leds->setRed(false);
        g_leds->setYellow(false);
        g_leds->setGreen(true);
    }
}
