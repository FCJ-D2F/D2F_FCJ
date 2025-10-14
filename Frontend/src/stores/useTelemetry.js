import { create } from 'zustand'

const MAX_POINTS = 200

const useTelemetry = create((set, get) => ({
  byDevice: {},
  alerts: [],
  pushTelemetry: (t) => {
    if (!t || !t.deviceId) return
    set((state) => {
      const list = state.byDevice[t.deviceId] ? [...state.byDevice[t.deviceId], t] : [t]
      const sliced = list.length > MAX_POINTS ? list.slice(list.length - MAX_POINTS) : list
      return { byDevice: { ...state.byDevice, [t.deviceId]: sliced } }
    })
  },
  pushAlert: (a) => {
    if (!a || !a.deviceId) return
    set((state) => ({ alerts: [a, ...state.alerts].slice(0, 500) }))
  },
  clear: () => set({ byDevice: {}, alerts: [] }),
}))

export default useTelemetry
