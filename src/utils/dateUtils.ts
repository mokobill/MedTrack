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

export const isMondayAtResetTime = (lastResetTime?: string): boolean => {
  const now = new Date();

  // Create a Monday at 00:00 GMT in the current week
  const nowUTC = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
  const dayOfWeekUTC = nowUTC.getUTCDay();

  // Calculate Monday of this week in GMT
  const daysUntilMonday = dayOfWeekUTC === 0 ? 0 : (dayOfWeekUTC === 1 ? 0 : 8 - dayOfWeekUTC);
  const lastMondayUTC = new Date(nowUTC);
  lastMondayUTC.setUTCDate(lastMondayUTC.getUTCDate() - dayOfWeekUTC + (dayOfWeekUTC === 0 ? 0 : 1));
  lastMondayUTC.setUTCHours(0, 0, 0, 0);

  // If no lastResetTime exists, it's the first time - return true to reset
  if (!lastResetTime) {
    return true;
  }

  const lastResetDate = new Date(lastResetTime);

  // Check if the last reset was before the current Monday at 00:00 GMT
  return lastResetDate < lastMondayUTC;
};