import React from 'react';
import { format, parseISO, isToday } from 'date-fns';
import { getDaysOfWeek } from '../../utils/dateUtils';

interface WeeklyCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  trackingDates: string[];
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  selectedDate,
  onSelectDate,
  trackingDates,
}) => {
  const daysOfWeek = getDaysOfWeek();
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-3">This Week</h2>
      
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(({ date, formatted }) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const isSelected = dateString === selectedDate;
          const isCurrentDay = isToday(date);
          const hasData = trackingDates.includes(dateString);
          
          return (
            <button
              key={dateString}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-all
                ${isSelected 
                  ? 'bg-primary-500 text-white' 
                  : isCurrentDay 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                    : 'hover:bg-gray-50'
                }
              `}
              onClick={() => onSelectDate(dateString)}
            >
              <span className="text-xs font-medium">{formatted}</span>
              <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {format(date, 'd')}
              </span>
              
              {hasData && !isSelected && (
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;