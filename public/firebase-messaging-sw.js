importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD36hy0PyToVnsYDKmeBpxN1qF3n3KjncM",
  authDomain: "medtrack-18de1.firebaseapp.com",
  projectId: "medtrack-18de1",
  storageBucket: "medtrack-18de1.firebasestorage.app",
  messagingSenderId: "229553504196",
  appId: "1:229553504196:web:1848e4d9f6fd6fb4b5ae91",
  measurementId: "G-MB8C5L9H99"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/MedTrack/icons/icon-192x192.png',
    badge: '/MedTrack/icons/icon-96x96.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
