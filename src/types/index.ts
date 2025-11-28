export interface FoodItem {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable' | 'protein' | 'grain' | 'oil' | 'other';
  servingSize: string;
  servingsPerDay?: number;
  servingsPerWeek?: number;
  trackingPeriod: 'daily' | 'weekly';
  icon: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  frequency: number;
  period: 'day' | 'week';
  completed: number;
  icon: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  category: 'resistance' | 'home-workout' | 'cardio' | 'flexibility';
  targetSets?: number;
  targetReps?: string;
  icon: string;
}

export interface ExerciseSet {
  id: string;
  weight?: number;
  reps: number;
  notes?: string;
  completed: boolean;
  restTime?: number; // in seconds
}

export interface WorkoutSession {
  id: string;
  exerciseId: string;
  date: string;
  sets: ExerciseSet[];
  totalVolume?: number;
  duration?: number; // in minutes
}

export interface DietTracking {
  date: string;
  items: {
    [itemId: string]: number;
  };
}

export interface WeeklyTracking {
  weekStart: string; // Monday date in YYYY-MM-DD format
  items: {
    [itemId: string]: number;
  };
}

interface NotificationPreference {
  enabled: boolean;
  times: string[];
}

export interface UserSettings {
  notifications: NotificationPreference;
  theme: 'light' | 'dark' | 'system';
  name: string;
  username: string;
}

export interface AppState {
  foodItems: FoodItem[];
  exerciseItems: ExerciseItem[];
  workoutExercises: WorkoutExercise[];
  workoutSessions: WorkoutSession[];
  tracking: {
    [date: string]: DietTracking;
  };
  weeklyTracking: {
    [weekStart: string]: WeeklyTracking;
  };
  settings: UserSettings;
  isAuthenticated: boolean;
  currentUser: string | null;
}

export interface AuthCredentials {
  username: string;
  pin: string;
}