import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey: "AIzaSyD36hy0PyToVnsYDKmeBpxN1qF3n3KjncM",
  authDomain: "medtrack-18de1.firebaseapp.com",
  projectId: "medtrack-18de1",
  storageBucket: "medtrack-18de1.firebasestorage.app",
  messagingSenderId: "229553504196",
  appId: "1:229553504196:web:1848e4d9f6fd6fb4b5ae91",
  measurementId: "G-MB8C5L9H99"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const saveDeviceToken = async (userIdentifier: string, token: string) => {
  try {
    await supabase
      .from('device_tokens')
      .upsert({
        user_identifier: userIdentifier,
        device_token: token,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_identifier,device_token'
      });
  } catch (error) {
    console.error('Error saving device token:', error);
  }
};

export const requestPushPermission = async (userIdentifier?: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BDBXzGOdIrybsxzYNeYr1nFhoocu-cdNqKUKWKQSUQQ8W_vurDzaR8EuG4idiE-mBWY1Whr9_zp3yHtq0KKAfFs"
      });
      console.log('FCM Token:', token);

      if (userIdentifier) {
        await saveDeviceToken(userIdentifier, token);
      }

      return token;
    }
  } catch (error) {
    console.error('Error requesting push permission:', error);
  }
  return null;
};

export const setupPushNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    const notificationTitle = payload.notification?.title || 'MedTrack';
    const notificationOptions = {
      body: payload.notification?.body || 'New notification',
      icon: '/MedTrack/icons/icon-192x192.png',
      badge: '/MedTrack/icons/icon-96x96.png',
    };

    if (Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  });
};

export default messaging;
