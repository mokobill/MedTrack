import { format } from 'date-fns';
import { UserSettings, FoodItem } from '../types';

class NotificationService {
  private notificationTimers: NodeJS.Timeout[] = [];
  private hasPermission: boolean = false;

  constructor() {
    this.checkPermission();
  }

  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      this.hasPermission = false;
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  async requestPermission(): Promise<boolean> {
    return this.checkPermission();
  }

  /**
   * Generate random notification times throughout the day
   * Returns 3-5 random times between 8 AM and 9 PM
   */
  private generateRandomTimes(): string[] {
    const times: string[] = [];
    const numberOfNotifications = Math.floor(Math.random() * 3) + 3; // 3-5 notifications
    
    // Generate random times between 8:00 and 21:00 (8 AM to 9 PM)
    const startHour = 8;
    const endHour = 21;
    
    for (let i = 0; i < numberOfNotifications; i++) {
      const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
      const minute = Math.floor(Math.random() * 60);
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Avoid duplicate times
      if (!times.includes(timeString)) {
        times.push(timeString);
      }
    }
    
    return times.sort();
  }
  scheduleNotifications(settings: UserSettings, foodItems: FoodItem[]): void {
    // Clear any existing timers
    this.clearScheduledNotifications();

    if (!settings.notifications.enabled || !this.hasPermission) {
      return;
    }

    // Generate random times for today
    const randomTimes = this.generateRandomTimes();
    
    randomTimes.forEach((timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      // Get current time
      const now = new Date();
      
      // Set notification time for today
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (notificationTime.getTime() < now.getTime()) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }
      
      // Calculate delay in milliseconds
      const delay = notificationTime.getTime() - now.getTime();
      
      // Schedule notification
      const timer = setTimeout(() => {
        this.showNotification(foodItems);
        // Reschedule for the next day
        this.scheduleNotifications(settings, foodItems);
      }, delay);
      
      this.notificationTimers.push(timer);
    });
  }

  clearScheduledNotifications(): void {
    this.notificationTimers.forEach(clearTimeout);
    this.notificationTimers = [];
  }

  showNotification(foodItems: FoodItem[]): void {
    if (!this.hasPermission) return;

    // Randomly select a food item to remind about
    const randomItem = foodItems[Math.floor(Math.random() * foodItems.length)];
    
    // Create varied notification messages
    const messages = [
      `Have you had your ${randomItem.name.toLowerCase()} today?`,
      `Don't forget about your ${randomItem.name.toLowerCase()} goal!`,
      `Time for some ${randomItem.name.toLowerCase()}?`,
      `Remember to track your ${randomItem.name.toLowerCase()} intake!`,
      `How's your ${randomItem.name.toLowerCase()} progress today?`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const title = 'Mediterranean Diet Reminder';
    const options = {
      body: randomMessage,
      icon: '/favicon.svg',
    };
    
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  showCompletionNotification(itemName: string): void {
    if (!this.hasPermission) return;

    const title = 'Great job!';
    const options = {
      body: `You've completed your ${itemName} goal for today!`,
      icon: '/favicon.svg',
    };
    
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

export default new NotificationService();