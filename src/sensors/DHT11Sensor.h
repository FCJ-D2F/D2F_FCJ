#ifndef DHT11SENSOR_H
#define DHT11SENSOR_H

#include <DHT.h>

class DHT11Sensor {
  public:
    DHT11Sensor(uint8_t pin);
    void begin();
    void update();
    float readTemperature();
    float readHumidity();
  private:
    DHT dht;
    unsigned long lastReadTime;
    float cachedTemp;
    float cachedHum;
};

#endif
