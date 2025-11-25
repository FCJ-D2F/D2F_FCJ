#ifndef OLEDDISPLAY_H
#define OLEDDISPLAY_H

#include <U8g2lib.h>

class OLEDDisplay {
public:
    OLEDDisplay();
    void begin();
    void updateData(float temp, float hum, int gas, bool gasDanger, bool fireDanger);

private:
    U8G2_SSD1306_128X64_NONAME_F_HW_I2C display;

    float lastTemp;
    float lastHum;
    int lastGas;
    bool lastGasDanger;
    bool lastFireDanger;
};

#endif
