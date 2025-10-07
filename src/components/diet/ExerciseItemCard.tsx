import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ExerciseItem } from '../../types';
import { getIconComponent } from '../../data/mediterraneanDiet';

interface ExerciseItemCardProps {
  item: ExerciseItem;
  onComplete: () => void;
}

const ExerciseItemCard: React.FC<ExerciseItemCardProps> = ({
  item,
  onComplete,
}) => {
  const progress = Math.min(item.completed / item.frequency, 1) * 100;
  const isCompleted = item.completed >= item.frequency;
  
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
          <p className="text-sm text-gray-500">
            {item.frequency} {item.period === 'day' ? 'minutes per day' : 'sessions per week'}
          </p>
          
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
              {item.completed} / {item.frequency} {item.period === 'week' ? 'sessions' : 'minutes'}
            </p>
            
            {isCompleted && (
              <div className="flex items-center text-sm text-green-600 font-medium">
                <Check size={14} className="mr-1" />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-end">
        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          size="sm"
          onClick={onComplete}
          disabled={isCompleted}
          icon={<Plus size={16} />}
          aria-label={`Log ${item.name}`}
        >
          {isCompleted ? 'Completed' : 'Log Activity'}
        </Button>
      </div>
    </Card>
  );
};

export default ExerciseItemCard;