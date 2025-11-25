#ifndef MQ2SENSOR_H
#define MQ2SENSOR_H

#include <Arduino.h>

class MQ2Sensor {
  public:
    MQ2Sensor(uint8_t analogPin, uint16_t threshold);

    void begin();                               // Gọi trong setup()
    void update();                              // Gọi trong loop() (non-blocking)
    bool isReady();                             // Đã warm-up và hiệu chỉnh xong chưa

    int readAnalog();                           // Đọc giá trị trung bình ADC
    float readSmooth(float alpha = 0.2);        // Đọc có trơn hóa tín hiệu
    bool isDanger();                            // Kiểm tra ngưỡng cảnh báo (debounce)
    int getBaseLevel();                         // Lấy mức nền môi trường
    int getRaw();                               // Lấy giá trị mới nhất
    bool isCalibrated();                        // Đã hiệu chỉnh chưa

  private:
    void calibrate(uint16_t samples = 50);      // Gọi nội bộ để hiệu chỉnh

    uint8_t pin;
    uint16_t threshold;
    int baseLevel = 0;
    bool calibrated = false;
    bool ready = false;

    unsigned long stableStart = 0;
    const unsigned long warmupTime = 5000;      // 5 giây làm nóng

    int lastValue = 0;                          // Lưu giá trị đọc cuối
    uint8_t dangerCount = 0;                    // Đếm số lần vượt ngưỡng liên tiếp
};

#endif
