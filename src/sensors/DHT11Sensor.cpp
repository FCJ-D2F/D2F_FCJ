#include "DHT11Sensor.h"

DHT11Sensor::DHT11Sensor(uint8_t pin) : dht(pin, DHT11), lastReadTime(0), cachedTemp(0), cachedHum(0) {}

void DHT11Sensor::begin() { dht.begin(); }

void DHT11Sensor::update() {
  unsigned long now = millis();
  if (now - lastReadTime >= 2000) { // DHT11 cần tối thiểu 2s giữa hai lần đọc
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) {
      cachedTemp = t;
      cachedHum = h;
    }
    lastReadTime = now;
  }
}

float DHT11Sensor::readTemperature() { return cachedTemp; }
float DHT11Sensor::readHumidity() { return cachedHum; }
