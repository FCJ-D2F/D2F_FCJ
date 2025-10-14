import { create } from 'zustand'
import { connectMqtt, parseTopics } from '../realtime/mqttClient.js'

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('auth')) || null } catch { return null }
})()

const useAuth = create((set, get) => ({
  user: saved?.user || null,
  token: saved?.token || null,
  loginMock: async (email, password) => {
    const user = { email }
    const token = 'mock-token'
    set({ user, token })
    localStorage.setItem('auth', JSON.stringify({ user, token }))
    const url = import.meta.env.VITE_MQTT_URL
    const topics = parseTopics(import.meta.env.VITE_DEFAULT_TOPICS)
    if (url && topics.length) connectMqtt(url, topics)
  },
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('auth')
    // Keep MQTT connection; user can clear in Settings
  },
}))

export default useAuth
