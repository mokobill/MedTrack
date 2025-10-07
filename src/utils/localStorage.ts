import { AppState } from '../types';
import { foodItems, exerciseItems } from '../data/mediterraneanDiet';
import { workoutExercises } from '../data/workoutExercises';
import { getCurrentUser } from './authService';

const getStorageKey = (username: string): string => {
  return `med-diet-tracker-data-${username}`;
};

const defaultState: AppState = {
  foodItems,
  exerciseItems,
  workoutExercises,
  workoutSessions: [],
  tracking: {},
  weeklyTracking: {},
  settings: {
    notifications: {
      enabled: true,
      times: [], // No longer used - times are generated randomly
    },
    theme: 'light',
    name: '',
    username: '',
  },
  isAuthenticated: false,
  currentUser: null,
};

export const loadState = (): AppState => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return defaultState;
    }
    
    const storageKey = getStorageKey(currentUser);
    const serializedState = localStorage.getItem(storageKey);
    if (!serializedState) {
      return defaultState;
    }
    
    const savedState = JSON.parse(serializedState) as AppState;
    
    // Merge with default state to ensure we have all the latest properties
    return {
      ...defaultState,
      ...savedState,
      // Ensure we always have the latest food and exercise items
      foodItems: defaultState.foodItems,
      exerciseItems: defaultState.exerciseItems,
      workoutExercises: defaultState.workoutExercises,
      settings: {
        ...defaultState.settings,
        ...savedState.settings,
      },
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return defaultState;
  }
};

export const saveState = (state: AppState): void => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error('Cannot save state: no authenticated user');
      return;
    }
    
    const storageKey = getStorageKey(currentUser);
    const serializedState = JSON.stringify(state);
    localStorage.setItem(storageKey, serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

export const clearState = (username?: string): void => {
  try {
    const user = username || getCurrentUser();
    if (!user) {
      console.error('Cannot clear state: no user specified');
      return;
    }
    
    const storageKey = getStorageKey(user);
    localStorage.removeItem(storageKey);
  } catch (err) {
    console.error('Error clearing state from localStorage:', err);
  }
};

export const loadStateForUser = (username: string): AppState => {
  try {
    const storageKey = getStorageKey(username);
    const serializedState = localStorage.getItem(storageKey);
    if (!serializedState) {
      return defaultState;
    }
    
    const savedState = JSON.parse(serializedState) as AppState;
    
    // Merge with default state to ensure we have all the latest properties
    return {
      ...defaultState,
      ...savedState,
      // Ensure we always have the latest food and exercise items
      foodItems: defaultState.foodItems,
      exerciseItems: defaultState.exerciseItems,
      workoutExercises: defaultState.workoutExercises,
      settings: {
        ...defaultState.settings,
        ...savedState.settings,
      },
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return defaultState;
  }
};