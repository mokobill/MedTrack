import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Check } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FoodItem } from '../../types';
import { getIconComponent } from '../../data/mediterraneanDiet';

interface FoodItemCardProps {
  item: FoodItem;
  servingsConsumed: number;
  maxServings: number;
  period: 'daily' | 'weekly';
  onIncrement: () => void;
  onDecrement: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  servingsConsumed,
  maxServings,
  period,
  onIncrement,
  onDecrement,
}) => {
  const isCompleted = servingsConsumed >= maxServings;
  const progress = Math.min(servingsConsumed / maxServings, 1) * 100;
  
  const IconComponent = getIconComponent(item.icon);
  
  return (
    <Card 
      className={`transition-all duration-300 ${
        isCompleted ? 'border-green-200 bg-green-50' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
          <IconComponent size={24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.servingSize}</p>
          
          <div className="mt-2 relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`absolute left-0 top-0 h-full ${
                isCompleted ? 'bg-green-500' : 'bg-primary-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="mt-1 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              {servingsConsumed} / {maxServings} servings {period === 'weekly' ? 'this week' : 'today'}
            </p>
            
            {isCompleted && (
              <div className="flex items-center text-sm text-green-600 font-medium">
                <Check size={14} className="mr-1" />
                {period === 'weekly' ? 'Weekly Goal' : 'Daily Goal'}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDecrement}
          disabled={servingsConsumed <= 0}
          icon={<Minus size={16} />}
          aria-label={`Decrease ${item.name} servings`}
        />
        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          size="sm"
          onClick={onIncrement}
          icon={<Plus size={16} />}
          aria-label={`Increase ${item.name} servings`}
        />
      </div>
    </Card>
  );
};

export default FoodItemCard;