import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Check, Clock, Weight, Hash, MessageSquare, RotateCcw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { WorkoutExercise, WorkoutSession, ExerciseSet } from '../../types';
import { getIconComponent } from '../../data/mediterraneanDiet';

interface ActiveWorkoutPanelProps {
  exercise: WorkoutExercise;
  session: WorkoutSession;
  onAddSet: (set: Omit<ExerciseSet, 'id'>) => void;
  onCompleteSet: (setId: string) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
}

const ActiveWorkoutPanel: React.FC<ActiveWorkoutPanelProps> = ({
  exercise,
  session,
  onAddSet,
  onCompleteSet,
  onFinishWorkout,
  onCancelWorkout,
}) => {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  
  const IconComponent = getIconComponent(exercise.icon);
  
  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);
  
  const handleAddSet = () => {
    const newSet: Omit<ExerciseSet, 'id'> = {
      weight: exercise.category === 'resistance' ? weight : undefined,
      reps,
      notes: notes.trim() || undefined,
      completed: false,
    };
    
    onAddSet(newSet);
    
    // Start rest timer (default 90 seconds for strength, 30 for cardio)
    const restTime = exercise.category === 'strength' ? 90 : 30;
    setRestTimer(restTime);
    setIsResting(true);
    
    // Clear notes for next set
    setNotes('');
  };
  
  const handleCompleteSet = (setId: string) => {
    onCompleteSet(setId);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const completedSets = session.sets.filter(set => set.completed).length;
  const totalVolume = session.sets.reduce((total, set) => {
    return total + ((set.weight || 0) * set.reps);
  }, 0);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="text"
          onClick={onCancelWorkout}
          icon={<X size={20} />}
          className="text-blue-400 hover:text-blue-300"
        />
        
        <div className="text-center">
          <h1 className="text-lg font-medium">{exercise.name}</h1>
          <p className="text-sm text-gray-400">{exercise.targetReps}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="text"
            icon={<Clock size={16} />}
            className="text-blue-400"
          />
          <Button
            variant="text"
            icon={<RotateCcw size={16} />}
            className="text-blue-400"
          />
        </div>
      </div>
      
      {/* Rest Timer */}
      {isResting && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 rounded-lg p-4 mb-6 text-center"
        >
          <div className="text-2xl font-bold">{formatTime(restTimer)}</div>
          <div className="text-sm">Rest Time</div>
        </motion.div>
      )}
      
      {/* Exercise Sets */}
      <div className="space-y-4 mb-6">
        {session.sets.map((set, index) => (
          <motion.div
            key={set.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    set.completed ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {exercise.category === 'strength' && (
                      <div>
                        <div className="text-xs text-gray-400">Weight</div>
                        <div className="text-lg font-medium">{set.weight || 0}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs text-gray-400">Reps</div>
                      <div className="text-lg font-medium">{set.reps}</div>
                    </div>
                    
                    {set.notes && (
                      <div>
                        <div className="text-xs text-gray-400">Notes</div>
                        <div className="text-sm">{set.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {!set.completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompleteSet(set.id)}
                    icon={<Check size={16} />}
                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                  />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Add Set Form */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center">
          <Plus className="mr-2" size={16} />
          Add Set
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {exercise.category === 'strength' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  <Weight size={14} className="inline mr-1" />
                  Weight
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  min="0"
                  step="5"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                <Hash size={14} className="inline mr-1" />
                Reps
              </label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                min="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              <MessageSquare size={14} className="inline mr-1" />
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="RIR 3, felt good"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500"
            />
          </div>
          
          <Button
            variant="primary"
            fullWidth
            onClick={handleAddSet}
            icon={<Plus size={16} />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Set
          </Button>
        </div>
      </Card>
      
      {/* Workout Summary */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{session.sets.length}</div>
            <div className="text-xs text-gray-400">Total Sets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{completedSets}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{Math.round(totalVolume)}</div>
            <div className="text-xs text-gray-400">Volume</div>
          </div>
        </div>
      </Card>
      
      {/* Finish Workout */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onCancelWorkout}
          className="border-gray-600 text-gray-400 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onFinishWorkout}
          disabled={session.sets.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          Finish Workout
        </Button>
      </div>
    </div>
  );
};

export default ActiveWorkoutPanel;