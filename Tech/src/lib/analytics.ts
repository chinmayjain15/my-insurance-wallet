import * as amplitude from '@amplitude/analytics-browser'

let initialized = false

export function initAmplitude(apiKey: string) {
  if (!apiKey || initialized) return
  amplitude.init(apiKey, {
    autocapture: {
      elementInteractions: false, // we track manually
      pageViews: false,
      sessions: false,
    },
    defaultTracking: false,
  })
  initialized = true
}

export function identify(userId: string, userProps?: Record<string, string | boolean | number>) {
  if (!initialized) return
  amplitude.setUserId(userId)
  if (userProps) {
    const identifyEvent = new amplitude.Identify()
    Object.entries(userProps).forEach(([key, value]) => {
      identifyEvent.set(key, value)
    })
    amplitude.identify(identifyEvent)
  }
}

export function track(event: string, props?: Record<string, string | boolean | number | null>) {
  if (!initialized) return
  amplitude.track(event, props ?? undefined)
}

export function reset() {
  if (!initialized) return
  const deviceId = amplitude.getDeviceId()
  amplitude.reset()
  if (deviceId) amplitude.setDeviceId(deviceId)
}
