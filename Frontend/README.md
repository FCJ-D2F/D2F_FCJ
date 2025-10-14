# IoT Secure Monitor

Production-ready React + Vite dashboard for IoT security monitoring.

## Quick start

1. Install deps

npm i

2. Configure Mosquitto (first time only)

mkdir -p infra/mosquitto
echo "listener 1883
protocol mqtt
listener 9001
protocol websockets
allow_anonymous true" > infra/mosquitto/mosquitto.conf

3. Start broker

npm run docker:up

4. Environment

cp .env.example .env

5. Run dev server

npm run dev

Open http://localhost:5173, sign in (mock), then publish messages (see src/realtime/mockPublisher.md). Realtime updates will appear on the dashboard.
