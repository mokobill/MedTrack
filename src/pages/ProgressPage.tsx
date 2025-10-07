import React, { useState, useEffect } from 'react';
import { loadState } from '../utils/localStorage';
import { getCurrentDate, getDisplayDate, getWeekStart } from '../utils/dateUtils';
import WeeklyCalendar from '../components/progress/WeeklyCalendar';
import ProgressChart from '../components/progress/ProgressChart';
import FoodItemCard from '../components/diet/FoodItemCard';
import ExerciseItemCard from '../components/diet/ExerciseItemCard';
import DailySummaryCard from '../components/diet/DailySummaryCard';

const ProgressPage: React.FC = () => {
  const [appState, setAppState] = useState(loadState());
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [trackingDates, setTrackingDates] = useState<string[]>([]);
  
  useEffect(() => {
    // Get dates that have tracking data
    const dates = Object.keys(appState.tracking);
    setTrackingDates(dates);
  }, [appState]);
  
  const selectedTracking = appState.tracking[selectedDate];
  const selectedWeekStart = getWeekStart(new Date(selectedDate));
  const selectedWeeklyTracking = appState.weeklyTracking[selectedWeekStart];
  
  return (
    <div className="pb-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Progress</h1>
        <p className="text-gray-500 mt-1">Track your Mediterranean diet and fitness habits</p>
      </header>
      
      <WeeklyCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        trackingDates={trackingDates}
      />
      
      <ProgressChart 
        foodItems={appState.foodItems}
        exerciseItems={appState.exerciseItems}
        tracking={appState.tracking}
        weeklyTracking={appState.weeklyTracking}
      />
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          {getDisplayDate(selectedDate)}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="space-y-4 mb-8">
            <h3 className="text-md font-medium text-gray-700">Diet Items</h3>
            
            {appState.foodItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                servingsConsumed={
                  item.trackingPeriod === 'daily' 
                    ? (selectedTracking?.items[item.id] || 0)
                    : (selectedWeeklyTracking?.items[item.id] || 0)
                }
                maxServings={
                  item.trackingPeriod === 'daily' 
                    ? (item.servingsPerDay || 0)
                    : (item.servingsPerWeek || 0)
                }
                period={item.trackingPeriod}
                onIncrement={() => {}}
                onDecrement={() => {}}
              />
            ))}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700">Exercise</h3>
            
            {appState.exerciseItems.map((item) => (
              <ExerciseItemCard
                key={item.id}
                item={item}
                onComplete={() => {}}
              />
            ))}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <DailySummaryCard
            date={selectedDate}
            foodItems={appState.foodItems}
            exerciseItems={appState.exerciseItems}
            tracking={selectedTracking}
            weeklyTracking={selectedWeeklyTracking}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;