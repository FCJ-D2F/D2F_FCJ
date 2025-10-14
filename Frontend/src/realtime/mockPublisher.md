# MQTT mock publisher examples

Publish telemetry:

mosquitto_pub -h localhost -p 1883 -t devices/dev-001/telemetry -m '{"deviceId":"dev-001","ts":1732949554123,"sensors":{"temp":27.4,"gas":410,"motion":false}}'

Publish alert:

mosquitto_pub -h localhost -p 1883 -t devices/dev-001/alerts -m '{"deviceId":"dev-001","ts":1732949555001,"type":"AUTH_FAILURE","severity":"HIGH","message":"Bad signature"}'
