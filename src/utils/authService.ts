import { loadState, saveState } from './localStorage';
import { validateCredentials, getUserDisplayName } from '../data/authCredentials';
import { AppState } from '../types';
import { foodItems, exerciseItems } from '../data/mediterraneanDiet';

const AUTH_STORAGE_KEY = 'med-diet-tracker-auth';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  currentUser?: string | null;
  loginTime: number;
}

export const login = (username: string, pin: string): boolean => {
  if (validateCredentials(username, pin)) {
    const authState: AuthState = {
      isAuthenticated: true,
      username,
      loginTime: Date.now(),
    };
    
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    
    // Initialize user-specific app state if it doesn't exist
    const userStorageKey = `med-diet-tracker-data-${username}`;
    const existingData = localStorage.getItem(userStorageKey);
    
    if (!existingData) {
      // Create new user data
      const newUserState: AppState = {
        foodItems,
        exerciseItems,
        tracking: {},
        settings: {
          notifications: {
            enabled: true,
            times: ['09:00', '13:00', '19:00'],
          },
          theme: 'light',
          name: getUserDisplayName(username),
          username: username,
        },
        isAuthenticated: true,
        currentUser: username,
      };
      localStorage.setItem(userStorageKey, JSON.stringify(newUserState));
    }
    
    // Load and update the user's app state
    const appState = loadState();
    appState.isAuthenticated = true;
    appState.currentUser = username;
    appState.settings.username = username;
    if (!appState.settings.name) {
      appState.settings.name = getUserDisplayName(username);
    }
    saveState(appState);
    
    return true;
  }
  
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const checkAuthStatus = (): AuthState => {
  try {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) {
      return { isAuthenticated: false, username: null, currentUser: null, loginTime: 0 };
    }

    const authState: AuthState = JSON.parse(authData);

    // Check if login is still valid (24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - authState.loginTime > twentyFourHours;

    if (isExpired) {
      logout();
      return { isAuthenticated: false, username: null, currentUser: null, loginTime: 0 };
    }

    return {
      ...authState,
      currentUser: authState.username
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false, username: null, currentUser: null, loginTime: 0 };
  }
};

export const getCurrentUser = (): string | null => {
  const authState = checkAuthStatus();
  return authState.isAuthenticated ? authState.username : null;
};