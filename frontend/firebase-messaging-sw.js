/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.VITE_FIREBASE_API_KEY,
  authDomain: self.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: self.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: self.VITE_FIREBASE_APP_ID,
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  })
})
