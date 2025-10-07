import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDisplayDate, getCurrentDate, getCurrentWeekStart, isNewWeek, isNewDay } from '../utils/dateUtils';
import { loadState, saveState } from '../utils/localStorage';
import { FoodItem, ExerciseItem, DietTracking, WeeklyTracking } from '../types';
import FoodItemCard from '../components/diet/FoodItemCard';
import ExerciseItemCard from '../components/diet/ExerciseItemCard';
import DailySummaryCard from '../components/diet/DailySummaryCard';
import notificationService from '../utils/notificationService';

const TodayPage: React.FC = () => {
  const [appState, setAppState] = useState(loadState());
  const currentDate = getCurrentDate();
  const currentWeekStart = getCurrentWeekStart();
  const [todayTracking, setTodayTracking] = useState<DietTracking>(
    appState.tracking[currentDate] || { date: currentDate, items: {} }
  );
  const [weeklyTracking, setWeeklyTracking] = useState<WeeklyTracking>(
    appState.weeklyTracking[currentWeekStart] || { weekStart: currentWeekStart, items: {} }
  );
  
  useEffect(() => {
    // Check for week reset (Monday 00:00)
    const lastWeekStart = Object.keys(appState.weeklyTracking).sort().pop();
    if (lastWeekStart && isNewWeek(lastWeekStart)) {
      // Reset weekly tracking and exercise progress
      const newState = { ...appState };
      newState.weeklyTracking[currentWeekStart] = { weekStart: currentWeekStart, items: {} };
      newState.exerciseItems = newState.exerciseItems.map(item => ({ ...item, completed: 0 }));
      setAppState(newState);
      setWeeklyTracking({ weekStart: currentWeekStart, items: {} });
      saveState(newState);
    }
    
    // Initialize tracking for today if it doesn't exist
    if (!appState.tracking[currentDate]) {
      const newState = { ...appState };
      newState.tracking[currentDate] = { date: currentDate, items: {} };
      if (!newState.weeklyTracking[currentWeekStart]) {
        newState.weeklyTracking[currentWeekStart] = { weekStart: currentWeekStart, items: {} };
      }
      setAppState(newState);
      saveState(newState);
    }
    
    // Set up notifications
    if (appState.settings.notifications.enabled) {
      notificationService.requestPermission().then((granted) => {
        if (granted) {
          notificationService.scheduleNotifications(appState.settings, appState.foodItems);
        }
      });
    }
  }, [appState, currentDate, currentWeekStart]);
  
  const handleFoodIncrement = (item: FoodItem) => {
    const newState = { ...appState };
    
    if (item.trackingPeriod === 'daily') {
      const newTracking = { ...todayTracking };
      newTracking.items[item.id] = (newTracking.items[item.id] || 0) + 1;
      setTodayTracking(newTracking);
      newState.tracking[currentDate] = newTracking;
      
      // Check if daily goal completed
      const newServings = newTracking.items[item.id];
      if (newServings === item.servingsPerDay) {
        notificationService.showCompletionNotification(`${item.name} daily goal`);
      }
    } else {
      const newWeeklyTracking = { ...weeklyTracking };
      newWeeklyTracking.items[item.id] = (newWeeklyTracking.items[item.id] || 0) + 1;
      setWeeklyTracking(newWeeklyTracking);
      newState.weeklyTracking[currentWeekStart] = newWeeklyTracking;
      
      // Check if weekly goal completed
      const newServings = newWeeklyTracking.items[item.id];
      if (newServings === item.servingsPerWeek) {
        notificationService.showCompletionNotification(`${item.name} weekly goal`);
      }
    }
    
    setAppState(newState);
    saveState(newState);
  };
  
  const handleFoodDecrement = (item: FoodItem) => {
    const newState = { ...appState };
    
    if (item.trackingPeriod === 'daily') {
      if (!todayTracking.items[item.id] || todayTracking.items[item.id] <= 0) {
        return;
      }
      const newTracking = { ...todayTracking };
      newTracking.items[item.id] = newTracking.items[item.id] - 1;
      setTodayTracking(newTracking);
      newState.tracking[currentDate] = newTracking;
    } else {
      if (!weeklyTracking.items[item.id] || weeklyTracking.items[item.id] <= 0) {
        return;
      }
      const newWeeklyTracking = { ...weeklyTracking };
      newWeeklyTracking.items[item.id] = newWeeklyTracking.items[item.id] - 1;
      setWeeklyTracking(newWeeklyTracking);
      newState.weeklyTracking[currentWeekStart] = newWeeklyTracking;
    }
    
    setAppState(newState);
    saveState(newState);
  };
  
  const handleExerciseComplete = (item: ExerciseItem) => {
    const index = appState.exerciseItems.findIndex(i => i.id === item.id);
    if (index === -1 || appState.exerciseItems[index].completed >= item.frequency) {
      return;
    }
    
    const newState = { ...appState };
    newState.exerciseItems[index] = {
      ...item,
      completed: item.completed + 1,
    };
    
    setAppState(newState);
    saveState(newState);
    
    // Check if completed
    const newCompleted = newState.exerciseItems[index].completed;
    if (newCompleted === item.frequency) {
      notificationService.showCompletionNotification(item.name);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };
  
  return (
    <div className="pb-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Today</h1>
        <p className="text-gray-500 mt-1">{getDisplayDate(currentDate)}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h2 className="text-lg font-medium text-gray-900">Mediterranean Diet</h2>
            
            {appState.foodItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <FoodItemCard
                  item={item}
                  servingsConsumed={
                    item.trackingPeriod === 'daily' 
                      ? (todayTracking.items[item.id] || 0)
                      : (weeklyTracking.items[item.id] || 0)
                  }
                  maxServings={
                    item.trackingPeriod === 'daily' 
                      ? (item.servingsPerDay || 0)
                      : (item.servingsPerWeek || 0)
                  }
                  period={item.trackingPeriod}
                  onIncrement={() => handleFoodIncrement(item)}
                  onDecrement={() => handleFoodDecrement(item)}
                />
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 mt-8"
          >
            <h2 className="text-lg font-medium text-gray-900">Exercise</h2>
            
            {appState.exerciseItems.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <ExerciseItemCard
                  item={item}
                  onComplete={() => handleExerciseComplete(item)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="md:col-span-1">
          <DailySummaryCard
            date={currentDate}
            foodItems={appState.foodItems}
            exerciseItems={appState.exerciseItems}
            tracking={todayTracking}
            weeklyTracking={weeklyTracking}
          />
        </div>
      </div>
    </div>
  );
};

export default TodayPage;