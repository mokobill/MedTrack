import React from 'react';
import { motion } from 'framer-motion';
import { getCurrentWeekDates, getWeekStart } from '../../utils/dateUtils';
import { FoodItem, ExerciseItem, DietTracking, WeeklyTracking } from '../../types';

interface ProgressChartProps {
  foodItems: FoodItem[];
  exerciseItems: ExerciseItem[];
  tracking: Record<string, DietTracking>;
  weeklyTracking?: Record<string, WeeklyTracking>;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  foodItems,
  exerciseItems,
  tracking,
  weeklyTracking = {},
}) => {
  const weekDates = getCurrentWeekDates();
  const currentWeekStart = getWeekStart();
  const currentWeeklyTracking = weeklyTracking[currentWeekStart];
  
  // Calculate daily compliance percentages
  const dailyComplianceData = weekDates.map(date => {
    const dailyTracking = tracking[date];
    const weekStart = getWeekStart(new Date(date));
    const weeklyTrackingForDate = weeklyTracking[weekStart];
    
    // Count completed daily food items
    const dailyFoodItems = foodItems.filter(item => item.trackingPeriod === 'daily');
    const weeklyFoodItems = foodItems.filter(item => item.trackingPeriod === 'weekly');
    
    const completedDailyItems = dailyFoodItems.filter(item => {
      const servings = dailyTracking?.items[item.id] || 0;
      return servings >= (item.servingsPerDay || 0);
    }).length;
    
    const completedWeeklyItems = weeklyFoodItems.filter(item => {
      const servings = weeklyTrackingForDate?.items[item.id] || 0;
      return servings >= (item.servingsPerWeek || 0);
    }).length;
    
    const completedFoodItems = completedDailyItems + completedWeeklyItems;
    
    // Count completed exercise items
    const completedExerciseItems = exerciseItems.filter(item => {
      return item.completed >= item.frequency;
    }).length;
    
    const totalItems = foodItems.length + exerciseItems.length;
    const completedItems = completedFoodItems + completedExerciseItems;
    
    return {
      date,
      percentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
    };
  });
  
  // Calculate overall compliance for the week
  const totalPercentage = dailyComplianceData.reduce((sum, day) => sum + day.percentage, 0);
  const weeklyCompliance = dailyComplianceData.length > 0 
    ? totalPercentage / dailyComplianceData.length 
    : 0;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Compliance</h2>
      
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">Overall</span>
        <span className="text-sm font-medium text-gray-900">{weeklyCompliance.toFixed(0)}%</span>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute left-0 top-0 h-full bg-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${weeklyCompliance}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <div className="space-y-4">
        {dailyComplianceData.map(({ date, percentage }) => (
          <div key={date}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{date.slice(5)}</span>
              <span className="text-xs font-medium text-gray-900">{percentage.toFixed(0)}%</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-primary-500"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;