import * as amplitude from '@amplitude/analytics-browser'
import mixpanel from 'mixpanel-browser'

let amplitudeInitialized = false
let mixpanelInitialized = false

export function initAmplitude(apiKey: string) {
  if (!apiKey || amplitudeInitialized) return
  amplitude.init(apiKey, {
    autocapture: {
      elementInteractions: false, // we track manually
      pageViews: false,
      sessions: false,
    },
    defaultTracking: false,
  })
  amplitudeInitialized = true
}

export function initMixpanel(token: string) {
  if (!token || mixpanelInitialized) return
  mixpanel.init(token, { persistence: 'localStorage' })
  mixpanelInitialized = true
}

export function identify(userId: string, userProps?: Record<string, string | boolean | number>) {
  if (amplitudeInitialized) {
    amplitude.setUserId(userId)
    if (userProps) {
      const identifyEvent = new amplitude.Identify()
      Object.entries(userProps).forEach(([key, value]) => {
        identifyEvent.set(key, value)
      })
      amplitude.identify(identifyEvent)
    }
  }

  if (mixpanelInitialized) {
    mixpanel.identify(userId)
    if (userProps) {
      mixpanel.people.set(userProps)
    }
  }
}

export function track(event: string, props?: Record<string, string | boolean | number | null>) {
  if (amplitudeInitialized) {
    amplitude.track(event, props ?? undefined)
  }
  if (mixpanelInitialized) {
    mixpanel.track(event, props ?? undefined)
  }
}

export function reset() {
  if (amplitudeInitialized) {
    const deviceId = amplitude.getDeviceId()
    amplitude.reset()
    if (deviceId) amplitude.setDeviceId(deviceId)
  }
  if (mixpanelInitialized) {
    mixpanel.reset()
  }
}
