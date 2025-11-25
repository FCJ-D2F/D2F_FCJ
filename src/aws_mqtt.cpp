#include "aws_mqtt.h"
#include "aws_config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "time.h"
#include <ArduinoJson.h>

static unsigned long lastPublishTime = 0;
const unsigned long PUBLISH_INTERVAL = 1000; // 1s

// ================== HÀM ĐỒNG BỘ THỜI GIAN ==================
static void syncTimeIfNeeded() {
    time_t now = time(nullptr);
    if (now < 100000) {
        Serial.println("Syncing time with NTP...");
        configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");
        int retry = 0;
        while (time(nullptr) < 100000 && retry < 20) {
            delay(500);
            Serial.print(".");
            retry++;
        }
        Serial.println();
        if (time(nullptr) > 100000)
            Serial.println("✅ Time synced successfully!");
        else
            Serial.println("⚠️ Time sync failed, TLS may not work.");
    }
}
// ------------------ KHAI BÁO TOÀN CỤC ------------------
static WiFiClientSecure net;
static PubSubClient client(net);

static bool awsConnected = false;
static unsigned long lastConnectAttempt = 0;
static const unsigned long CONNECT_RETRY_MS = 500; // retry MQTT nhanh

static bool wifiConnecting = false;

// ------------------ BUFFER DỮ LIỆU ------------------
struct SensorData {
    float temp;
    float hum;
    int gas;
    bool flame;
    bool danger;
};

#define DATA_QUEUE_SIZE 10
static SensorData dataQueue[DATA_QUEUE_SIZE];
static int queueStart = 0;
static int queueEnd = 0;

// ------------------ HÀM XỬ LÝ QUEUE ------------------
bool queuePush(const SensorData& data) {
    int next = (queueEnd + 1) % DATA_QUEUE_SIZE;
    if (next == queueStart) return false; // full
    dataQueue[queueEnd] = data;
    queueEnd = next;
    return true;
}

bool queuePop(SensorData &data) {
    if (queueStart == queueEnd) return false; // empty
    data = dataQueue[queueStart];
    queueStart = (queueStart + 1) % DATA_QUEUE_SIZE;
    return true;
}

// ------------------ CALLBACK NHẬN DỮ LIỆU TỪ AWS ------------------
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("\n[AWS] Message arrived on topic: ");
    Serial.println(topic);

    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.print("Payload: ");
    Serial.println(message);

    // TODO: xử lý message nếu muốn điều khiển thiết bị
}

// ------------------ KẾT NỐI AWS ------------------
void connectAWS() {
    // Step 1: Kiểm tra Wi-Fi
if (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    delay(1000);
    return;
}


    // Step 2: MQTT connect
    if (!client.connected() && millis() - lastConnectAttempt >= CONNECT_RETRY_MS) {
        net.stop();  // reset TLS socket để tránh session stale
        syncTimeIfNeeded(); // ✅ đảm bảo đồng bộ thời gian trước khi TLS handshake
        net.setCACert(AWS_CERT_CA);
        net.setCertificate(AWS_CERT_CRT);
        net.setPrivateKey(AWS_CERT_PRIVATE);
        client.setServer(AWS_IOT_ENDPOINT, 8883);
        client.setCallback(mqttCallback);

        String clientId = String(AWS_IOT_CLIENT_ID);
        Serial.print("Connecting to AWS IoT...");
        if (client.connect(clientId.c_str())) {
            awsConnected = true;
            Serial.println(" connected ✅");
            #ifdef AWS_IOT_SUB_TOPIC
            client.subscribe(AWS_IOT_SUB_TOPIC);
            #endif
        } else {
            awsConnected = false;
            Serial.print(" failed, state=");
            Serial.println(client.state());
        }
        lastConnectAttempt = millis();
    }

    // Step 3: Duy trì loop
    if (client.connected()) client.loop();
}


// ------------------ GỬI DỮ LIỆU LÊN AWS (QUEUE) ------------------
void publishQueue() {
    if (!client.connected()) return;

    unsigned long now = millis();
    if (now - lastPublishTime < PUBLISH_INTERVAL) return;

    SensorData data;
    if (!queuePop(data)) return;

    StaticJsonDocument<300> doc;

    doc["deviceId"] = "ESP32_01";
    doc["timestamp"] = time(nullptr);

    //  Dùng số thật, không dùng String()
    doc["temperature"] = data.temp;
    doc["humidity"]    = data.hum;
    doc["gas"]         = data.gas;

    JsonObject alert = doc.createNestedObject("alert");
    alert["flame"]  = data.flame ? 1 : 0;
    alert["danger"] = data.danger ? 1 : 0;

    char payload[300];
    serializeJson(doc, payload);

    if (client.publish(AWS_IOT_PUBLISH_TOPIC, payload)) {
        Serial.println("[AWS] Published:");
        Serial.println(payload);
    } else {
        Serial.println("[AWS] Publish failed → retry later");
        queuePush(data);
    }

    lastPublishTime = now;
}



// ------------------ HÀM CHÍNH GỌI TRONG LOOP ------------------
void loopAWS() {
    connectAWS();
    publishQueue();
}

// ------------------ GỬI DỮ LIỆU MỚI VÀO QUEUE ------------------

void sendSensorData(float temp, float hum, int gas, bool flame, bool danger) {
    SensorData data = {temp, hum, gas, flame, danger};
    if (!queuePush(data)) {
        Serial.println("Queue full, dropping data!");
    }
}
