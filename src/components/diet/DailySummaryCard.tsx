import React from 'react';
import { motion } from 'framer-motion';
import { Award, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FoodItem, ExerciseItem, DietTracking } from '../../types';
import { Link } from 'react-router-dom';

interface DailySummaryCardProps {
  date: string;
  foodItems: FoodItem[];
  exerciseItems: ExerciseItem[];
  tracking: DietTracking | undefined;
  weeklyTracking: WeeklyTracking | undefined;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  date,
  foodItems,
  exerciseItems,
  tracking,
  weeklyTracking,
}) => {
  const dailyFoodItems = foodItems.filter(item => item.trackingPeriod === 'daily');
  const weeklyFoodItems = foodItems.filter(item => item.trackingPeriod === 'weekly');
  const totalFoodItems = dailyFoodItems.length + weeklyFoodItems.length;
  const totalExerciseItems = exerciseItems.length;
  
  // Calculate completed food items
  const completedDailyItems = dailyFoodItems.filter((item) => {
    const servingsConsumed = tracking?.items[item.id] || 0;
    return servingsConsumed >= (item.servingsPerDay || 0);
  }).length;
  
  const completedWeeklyItems = weeklyFoodItems.filter((item) => {
    const servingsConsumed = weeklyTracking?.items[item.id] || 0;
    return servingsConsumed >= (item.servingsPerWeek || 0);
  }).length;
  
  const completedFoodItems = completedDailyItems + completedWeeklyItems;
  
  // Calculate completed exercise items
  const completedExerciseItems = exerciseItems.filter((item) => {
    return item.completed >= item.frequency;
  }).length;
  
  // Calculate overall progress
  const totalItems = totalFoodItems + totalExerciseItems;
  const completedItems = completedFoodItems + completedExerciseItems;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
  // Determine status and message
  let statusColor = 'bg-gray-100 text-gray-700';
  let statusMessage = 'Not Started';
  
  if (progressPercentage === 100) {
    statusColor = 'bg-green-100 text-green-700';
    statusMessage = 'Perfect Day!';
  } else if (progressPercentage >= 75) {
    statusColor = 'bg-green-100 text-green-700';
    statusMessage = 'Great Progress!';
  } else if (progressPercentage >= 50) {
    statusColor = 'bg-primary-100 text-primary-700';
    statusMessage = 'Good Progress';
  } else if (progressPercentage > 0) {
    statusColor = 'bg-accent-100 text-accent-700';
    statusMessage = 'Started';
  }
  
  return (
    <Card className="border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Daily Summary</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {statusMessage}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-gray-500">Overall Progress</p>
          <p className="text-sm font-medium text-gray-700">
            {completedItems} of {totalItems} items
          </p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Nutrition Goals</p>
          <p className="mt-1 text-lg font-medium text-gray-900">
            {completedFoodItems} / {totalFoodItems}
          </p>
          <div className="mt-1 text-xs text-gray-500">
            <div>Daily: {completedDailyItems} / {dailyFoodItems.length}</div>
            <div>Weekly: {completedWeeklyItems} / {weeklyFoodItems.length}</div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500">Exercise Items</p>
          <p className="mt-1 text-lg font-medium text-gray-900">
            {completedExerciseItems} / {totalExerciseItems}
          </p>
        </div>
      </div>
      
      {progressPercentage === 100 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
          <Award className="text-green-500 mr-2" size={20} />
          <p className="text-sm text-green-700">
            Congratulations! You've completed all items for today.
          </p>
        </div>
      )}
      
      <div className="mt-4">
        <Link to="/progress">
          <Button 
            variant="outline" 
            fullWidth 
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            View Weekly Progress
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DailySummaryCard;