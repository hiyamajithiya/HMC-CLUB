import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { api } from '../api/client'

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // Show banner even in foreground
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

/**
 * Request notification permission and register the Expo push token with the backend.
 * Returns the token string (or null if denied / not supported).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications don't work on simulators
    return null
  }

  // Create a notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'HMC Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#d69e2e',
      sound: 'default',
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '383030e8-7e3f-4d18-a76b-30601f555c10', // from app.json EAS projectId
  })

  return tokenData.data
}

/**
 * Hook that:
 * 1. Registers the device for push notifications after the user is authenticated
 * 2. Listens for incoming notifications while the app is foregrounded
 * 3. Removes the listener on cleanup
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    // Register token and send to backend
    registerForPushNotifications().then(async (token) => {
      if (!token) return
      try {
        await api.post('/user/push-token', {
          token,
          platform: Platform.OS,
        })
      } catch {
        // Non-blocking — best effort
      }
    })

    // Listen for notifications received while app is open (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // expo-notifications handles showing the banner via setNotificationHandler above
      // No additional action needed here, but can be extended (e.g., badge update)
      console.log('Notification received:', notification.request.content.title)
    })

    // Listen for user tapping on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any
      console.log('Notification tapped:', data)
      // Navigation based on notification type can be added here
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [isAuthenticated])
}
