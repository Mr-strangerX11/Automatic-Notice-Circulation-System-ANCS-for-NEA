// Firebase push notification bootstrap
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let messaging

export const initPush = async () => {
  if (!firebaseConfig.apiKey) return null
  const app = initializeApp(firebaseConfig)
  messaging = getMessaging(app)
  try {
    const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
    return token
  } catch (err) {
    console.error('FCM token error', err)
    return null
  }
}

export const onPush = (cb) => {
  if (!messaging) return
  onMessage(messaging, cb)
}
