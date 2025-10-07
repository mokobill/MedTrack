import React from 'react';
import { Play, TrendingUp, MoreHorizontal } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { WorkoutExercise } from '../../types';
import { getIconComponent } from '../../data/mediterraneanDiet';

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  stats: {
    totalSets: number;
    totalVolume: number;
    sessions: number;
  };
  onStart: () => void;
}

const WorkoutExerciseCard: React.FC<WorkoutExerciseCardProps> = ({
  exercise,
  stats,
  onStart,
}) => {
  const IconComponent = getIconComponent(exercise.icon);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
            <IconComponent size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{exercise.name}</h3>
            <p className="text-sm text-gray-500">
              {exercise.targetSets} sets × {exercise.targetReps} reps
            </p>
          </div>
        </div>
        <Button variant="text" size="sm" icon={<MoreHorizontal size={16} />} />
      </div>
      
      {/* Today's Stats */}
      {stats.sessions > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today:</span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-900">{stats.totalSets} sets</span>
              {stats.totalVolume > 0 && (
                <span className="text-gray-900">{Math.round(stats.totalVolume)} lbs</span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <TrendingUp size={14} className="mr-1" />
          <span>{stats.sessions} session{stats.sessions !== 1 ? 's' : ''} today</span>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={onStart}
          icon={<Play size={14} />}
        >
          Start
        </Button>
      </div>
    </Card>
  );
};

export default WorkoutExerciseCard;