import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Weight, RotateCcw } from 'lucide-react';
import { loadState, saveState } from '../utils/localStorage';
import { getCurrentDate } from '../utils/dateUtils';
import { WorkoutExercise, WorkoutSession, ExerciseSet } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import WorkoutExerciseCard from '../components/exercise/WorkoutExerciseCard';
import ActiveWorkoutPanel from '../components/exercise/ActiveWorkoutPanel';

const ExercisePage: React.FC = () => {
  const [appState, setAppState] = useState(loadState());
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const currentDate = getCurrentDate();
  
  // Get today's workout sessions
  const todaysSessions = appState.workoutSessions.filter(session => session.date === currentDate);
  
  const handleStartExercise = (exercise: WorkoutExercise) => {
    const newSession: WorkoutSession = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      date: currentDate,
      sets: [],
      totalVolume: 0,
      duration: 0,
    };
    
    setActiveWorkout(newSession);
    setSelectedExercise(exercise);
  };
  
  const handleAddSet = (set: Omit<ExerciseSet, 'id'>) => {
    if (!activeWorkout) return;
    
    const newSet: ExerciseSet = {
      ...set,
      id: `set-${Date.now()}`,
    };
    
    const updatedWorkout = {
      ...activeWorkout,
      sets: [...activeWorkout.sets, newSet],
    };
    
    setActiveWorkout(updatedWorkout);
  };
  
  const handleCompleteSet = (setId: string) => {
    if (!activeWorkout) return;
    
    const updatedSets = activeWorkout.sets.map(set =>
      set.id === setId ? { ...set, completed: true } : set
    );
    
    const updatedWorkout = {
      ...activeWorkout,
      sets: updatedSets,
    };
    
    setActiveWorkout(updatedWorkout);
  };
  
  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    
    // Calculate total volume
    const totalVolume = activeWorkout.sets.reduce((total, set) => {
      return total + ((set.weight || 0) * set.reps);
    }, 0);
    
    const completedWorkout = {
      ...activeWorkout,
      totalVolume,
    };
    
    // Save to app state
    const newState = { ...appState };
    newState.workoutSessions = [...newState.workoutSessions, completedWorkout];
    setAppState(newState);
    saveState(newState);
    
    // Reset active workout
    setActiveWorkout(null);
    setSelectedExercise(null);
  };
  
  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    setSelectedExercise(null);
  };
  
  const getExerciseStats = (exerciseId: string) => {
    const sessions = todaysSessions.filter(session => session.exerciseId === exerciseId);
    const totalSets = sessions.reduce((total, session) => total + session.sets.length, 0);
    const totalVolume = sessions.reduce((total, session) => total + (session.totalVolume || 0), 0);
    
    return { totalSets, totalVolume, sessions: sessions.length };
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
  
  if (activeWorkout && selectedExercise) {
    return (
      <ActiveWorkoutPanel
        exercise={selectedExercise}
        session={activeWorkout}
        onAddSet={handleAddSet}
        onCompleteSet={handleCompleteSet}
        onFinishWorkout={handleFinishWorkout}
        onCancelWorkout={handleCancelWorkout}
      />
    );
  }
  
  return (
    <div className="pb-12">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Exercise</h1>
        <p className="text-gray-500 mt-1">Track your strength training and workouts</p>
      </header>
      
      {/* Today's Summary */}
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{todaysSessions.length}</div>
            <div className="text-sm text-gray-500">Exercises</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {todaysSessions.reduce((total, session) => total + session.sets.length, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {Math.round(todaysSessions.reduce((total, session) => total + (session.totalVolume || 0), 0))}
            </div>
            <div className="text-sm text-gray-500">Volume (lbs)</div>
          </div>
        </div>
      </Card>
      
      {/* Exercise Categories */}
      <div className="space-y-6">
        {/* Strength Training */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Weight className="mr-2" size={20} />
            Resistance Training
          </h2>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {appState.workoutExercises
              .filter(exercise => exercise.category === 'strength')
              .map((exercise) => {
                const stats = getExerciseStats(exercise.id);
                return (
                  <motion.div key={exercise.id} variants={itemVariants}>
                    <WorkoutExerciseCard
                      exercise={exercise}
                      stats={stats}
                      onStart={() => handleStartExercise(exercise)}
                    />
                  </motion.div>
                );
              })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;