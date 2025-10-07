import { FoodItem, ExerciseItem } from '../types';
import { Apple, Carrot, Fish, Wheat, Droplets, Leaf, Dumbbell, Scaling as Walking, Nut, Bean, Zap } from 'lucide-react';

export const foodItems: FoodItem[] = [
  {
    id: 'fruits',
    name: 'Fruits',
    category: 'fruit',
    servingSize: 'Serving size: 1 medium fruit or 80g fresh fruit or 30g dried fruit',
    servingsPerDay: 3,
    trackingPeriod: 'daily',
    icon: 'Apple',
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    category: 'vegetable',
    servingSize: 'Serving size: 80g raw weight',
    servingsPerDay: 2,
    trackingPeriod: 'daily',
    icon: 'Carrot',
  },
  {
    id: 'fish',
    name: 'Fish/Seafood',
    category: 'protein',
    servingSize: 'Serving size: 140g raw weight or ~1 fillet',
    servingsPerWeek: 3,
    trackingPeriod: 'weekly',
    icon: 'Fish',
  },
  {
    id: 'legumes',
    name: 'Beans/Legumes',
    category: 'protein',
    servingSize: 'Serving size: 1/2 cup cooked or 1 cup dried',
    servingsPerWeek: 3,
    trackingPeriod: 'weekly',
    icon: 'Wheat',
  },
  {
    id: 'oliveoil',
    name: 'Olive Oil',
    category: 'oil',
    servingSize: 'Serving size: 1 tablespoon',
    servingsPerDay: 4,
    trackingPeriod: 'daily',
    icon: 'Droplets',
  },
  {
    id: 'nuts',
    name: 'Nuts',
    category: 'protein',
    servingSize: 'Serving size: 30g or a handful',
    servingsPerDay: 1,
    trackingPeriod: 'daily',
    icon: 'Nut',
  },
];

export const exerciseItems: ExerciseItem[] = [
  {
    id: 'resistance',
    name: 'Resistance Training',
    frequency: 3,
    period: 'week',
    completed: 0,
    icon: 'Dumbbell',
  },
];

export const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType> = {
    'Apple': Apple,
    'Carrot': Carrot,
    'Fish': Fish,
    'Wheat': Wheat,
    'Droplets': Droplets,
    'Leaf': Leaf,
    'Nut': Nut,
    'Bean': Bean,
    'Dumbbell': Dumbbell,
    'Walking': Walking,
    'Zap': Zap,
  };
  
  return icons[iconName] || Leaf;
};