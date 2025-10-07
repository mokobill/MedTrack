import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isToday, isThisWeek, parseISO } from 'date-fns';

const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

export const getDisplayDate = (dateString: string): string => {
  return format(parseISO(dateString), 'EEEE, MMMM d');
};

export const getCurrentWeekDates = (): string[] => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  const end = endOfWeek(today, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end }).map(formatDate);
};

export const getDaysOfWeek = (): { date: Date; formatted: string }[] => {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      formatted: format(date, 'EEE'),
    };
  });
};

const isDateToday = (dateString: string): boolean => {
  return isToday(parseISO(dateString));
};

const isDateThisWeek = (dateString: string): boolean => {
  return isThisWeek(parseISO(dateString), { weekStartsOn: 1 });
};

export const getWeekStart = (date?: Date): string => {
  const targetDate = date || new Date();
  const start = startOfWeek(targetDate, { weekStartsOn: 1 }); // Start on Monday
  return formatDate(start);
};

export const getCurrentWeekStart = (): string => {
  return getWeekStart();
};

export const isNewWeek = (lastWeekStart: string): boolean => {
  const currentWeekStart = getCurrentWeekStart();
  return currentWeekStart !== lastWeekStart;
};

export const isNewDay = (lastDate: string): boolean => {
  const currentDate = getCurrentDate();
  return currentDate !== lastDate;
};