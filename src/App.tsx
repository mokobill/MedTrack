import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './components/auth/LoginScreen';
import Layout from './components/layout/Layout';
import TodayPage from './pages/TodayPage';
import ExercisePage from './pages/ExercisePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import { loadState } from './utils/localStorage';
import { checkAuthStatus } from './utils/authService';
import notificationService from './utils/notificationService';
import { requestPushPermission, setupPushNotifications } from './utils/firebaseConfig';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Check authentication status on app load
    const authState = checkAuthStatus();
    setIsAuthenticated(authState.isAuthenticated);
    setIsLoading(false);

    // Initialize notification permission
    const checkNotifications = async () => {
      const state = loadState();
      if (state.settings.notifications.enabled) {
        const hasPermission = await notificationService.requestPermission();
        if (hasPermission) {
          notificationService.scheduleNotifications(state.settings, state.foodItems);
        }
      }
    };

    checkNotifications();

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/MedTrack/firebase-messaging-sw.js', {
        scope: '/MedTrack/'
      }).catch(error => console.error('Service Worker registration failed:', error));
    }

    // Setup Firebase push notifications
    setupPushNotifications();
    requestPushPermission();

    return () => {
      // Cleanup notification timers
      notificationService.clearScheduledNotifications();
    };
  }, []);

  const handleLogin = (username: string, pin: string) => {
    setIsAuthenticated(true);
    // Force a re-render to load the new user's data
    window.location.reload();
  };

  const handleLoginAttempt = (username: string) => {
    // This is called from LoginScreen after successful validation
    handleLogin(username, '');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLoginAttempt} />;
  }

  return (
    <Router basename="/MedTrack">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="/exercise" element={<ExercisePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;