import mqtt from 'mqtt'
import useTelemetry from '../stores/useTelemetry.js'

let client = null
let connecting = false
let connected = false
let backoff = 1000
const MAX_BACKOFF = 15000

export function parseTopics(input) {
  if (!input) return []
  return input.split(',').map((s) => s.trim()).filter(Boolean)
}

export function isMqttConnected() { return connected }

export function connectMqtt(url, topics = []) {
  if (client || connecting) return client
  connecting = true
  try {
    client = mqtt.connect(url, { clean: true, keepalive: 60, reconnectPeriod: 0 })
  } catch (e) {
    console.warn('MQTT connect error:', e)
    scheduleReconnect(url, topics)
    connecting = false
    return null
  }

  client.on('connect', () => {
    connected = true
    connecting = false
    backoff = 1000
    if (topics.length) {
      client.subscribe(topics, (err) => {
        if (err) console.warn('MQTT subscribe error', err)
      })
    }
  })

  client.on('reconnect', () => {
    // mqtt lib might trigger; we manage backoff manually
  })

  client.on('close', () => {
    connected = false
    scheduleReconnect(url, topics)
  })

  client.on('error', (err) => {
    console.warn('MQTT error', err?.message || err)
  })

  client.on('message', (topic, payload) => {
    const text = payload?.toString?.() || ''
    try {
      const obj = JSON.parse(text)
      if (topic.endsWith('/telemetry')) {
        useTelemetry.getState().pushTelemetry(obj)
      } else if (topic.endsWith('/alerts')) {
        useTelemetry.getState().pushAlert(obj)
      }
    } catch (e) {
      console.warn('MQTT JSON parse error for topic', topic, 'payload', text)
    }
  })

  return client
}

function scheduleReconnect(url, topics) {
  if (!url) return
  if (client) {
    try { client.end(true) } catch {}
    client = null
  }
  if (connecting) return
  connecting = true
  setTimeout(() => {
    connecting = false
    backoff = Math.min(backoff * 2, MAX_BACKOFF)
    connectMqtt(url, topics)
  }, backoff)
}
