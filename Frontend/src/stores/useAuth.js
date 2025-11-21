import { create } from 'zustand'
import { connectMqtt, parseTopics } from '../realtime/mqttClient.js'
import * as authAPI from '../api/auth-api.js'

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('auth')) || null } catch { return null }
})()

const useAuth = create((set, get) => ({
  user: saved?.user || null,
  accessToken: saved?.accessToken || null,
  idToken: saved?.idToken || null,
  refreshToken: saved?.refreshToken || null,
  expiresAt: saved?.expiresAt || null,
  
  // Get current access token (with auto-refresh if needed)
  getAccessToken: async () => {
    const state = get()
    if (!state.accessToken) return null
    
    // Check if token is expired (with 5 minute buffer)
    if (state.expiresAt && Date.now() >= state.expiresAt - 5 * 60 * 1000) {
      // Try to refresh
      if (state.refreshToken) {
        try {
          const result = await authAPI.refreshToken(state.refreshToken)
          set({
            accessToken: result.AccessToken,
            idToken: result.IdToken,
            expiresAt: result.ExpiresIn ? Date.now() + result.ExpiresIn * 1000 : null,
          })
          // Save to localStorage
          const saved = { ...get() }
          localStorage.setItem('auth', JSON.stringify(saved))
          return result.AccessToken
        } catch (error) {
          console.error('Token refresh failed:', error)
          get().logout()
          return null
        }
      }
    }
    
    return state.accessToken
  },
  
  login: async (email, password) => {
    try {
      const result = await authAPI.login(email, password)
      const user = { email, sub: result.IdToken ? parseJwt(result.IdToken).sub : email }
      const expiresAt = result.ExpiresIn ? Date.now() + result.ExpiresIn * 1000 : null
      
      set({
        user,
        accessToken: result.AccessToken,
        idToken: result.IdToken,
        refreshToken: result.RefreshToken,
        expiresAt,
      })
      
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        user,
        accessToken: result.AccessToken,
        idToken: result.IdToken,
        refreshToken: result.RefreshToken,
        expiresAt,
      }))
      
      // Connect MQTT
      const url = import.meta.env.VITE_MQTT_URL
      const topics = parseTopics(import.meta.env.VITE_DEFAULT_TOPICS)
      if (url && topics.length) connectMqtt(url, topics)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },
  
  register: async (email, password, attributes = {}) => {
    try {
      const result = await authAPI.register(email, password, attributes)
      return { success: true, userSub: result.userSub, message: result.message }
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },
  
  confirmSignUp: async (email, code) => {
    try {
      await authAPI.confirmSignUp(email, code)
      return { success: true }
    } catch (error) {
      console.error('Confirm sign up error:', error)
      throw error
    }
  },
  
  forgotPassword: async (email) => {
    try {
      await authAPI.forgotPassword(email)
      return { success: true }
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  },
  
  resetPassword: async (email, code, newPassword) => {
    try {
      await authAPI.resetPassword(email, code, newPassword)
      return { success: true }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  },
  
  // Backward compatibility - use Cognito login
  loginMock: async (email, password) => {
    return get().login(email, password)
  },
  
  logout: () => {
    set({ user: null, accessToken: null, idToken: null, refreshToken: null, expiresAt: null })
    localStorage.removeItem('auth')
    // Keep MQTT connection; user can clear in Settings
  },
  
  // Get token for API calls (backward compatibility)
  get token() {
    return get().accessToken
  },
}))

// Helper to parse JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (e) {
    return {}
  }
}

export default useAuth
