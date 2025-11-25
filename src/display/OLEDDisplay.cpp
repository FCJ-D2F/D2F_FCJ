#include "OLEDDisplay.h"

OLEDDisplay::OLEDDisplay()
    : display(U8G2_R0, U8X8_PIN_NONE),
      lastTemp(-100), lastHum(-1), lastGas(-1), lastGasDanger(false), lastFireDanger(false) {}

void OLEDDisplay::begin() {
    display.begin();
    display.setFont(u8g2_font_6x12_tf);
    display.clearBuffer();

    display.drawStr(20, 10, "Smart Home Monitor");
    display.sendBuffer();
    delay(800);
    display.clearBuffer();
}

void OLEDDisplay::updateData(float temp, float hum, int gas, bool gasDanger, bool fireDanger) {
    // Nếu đang từ cháy -> hết cháy => reset lại toàn bộ trạng thái OLED
    if (lastFireDanger && !fireDanger) {
        display.setDrawColor(1);      // reset chế độ vẽ về bình thường
        display.clearDisplay();       // xóa thật toàn bộ (không chỉ buffer)
        display.clearBuffer();
        display.sendBuffer();
        delay(50); // cho màn hình refresh ổn định một chút
    }

    display.setDrawColor(1); // đảm bảo luôn vẽ ở chế độ bình thường
    display.clearBuffer();


    // 🔥 Ưu tiên hiển thị cảnh báo cháy
    if (fireDanger) {
        display.setFont(u8g2_font_7x13B_tf);  // font đậm
        display.setDrawColor(1);
        display.drawBox(0, 0, 128, 64);      // toàn màn hình sáng
        display.setDrawColor(0);
        display.setCursor(20, 30);
        display.print("FIRE ALERT");
        display.setCursor(22, 48);
        display.print("Evacuate Now!");
        display.sendBuffer();
        lastFireDanger = fireDanger;
        return;  // Không hiển thị gì khác
    }

    // Nếu không có cháy, hiển thị bình thường
    display.setFont(u8g2_font_6x12_tf);

    int startX = 8;
    int startY = 15;

    display.drawStr(startX, startY, "Temp:");
    display.setCursor(startX + 45, startY);
    display.printf("%.1f C", temp);

    display.drawStr(startX, startY + 14, "Hum:");
    display.setCursor(startX + 45, startY + 14);
    display.printf("%.1f %%", hum);

    display.drawStr(startX, startY + 28, "Gas:");
    display.setCursor(startX + 45, startY + 28);
    display.printf("%d", gas);

    if (gasDanger) {
        display.setDrawColor(1);
        display.drawBox(8, startY + 34, 110, 10);
        display.setDrawColor(0);
        display.setCursor(38, startY + 42);
        display.print("!! GAS ALERT !!");
        display.setDrawColor(1);
    } else {
        display.setCursor(38, startY + 42);
        display.print("All normal");
    }

    display.sendBuffer();

    // Lưu lại trạng thái cũ
    lastTemp = temp;
    lastHum = hum;
    lastGas = gas;
    lastGasDanger = gasDanger;
    lastFireDanger = fireDanger;
}
