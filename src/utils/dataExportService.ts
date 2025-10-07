import * as XLSX from 'xlsx';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { loadStateForUser } from './localStorage';
import { validCredentials } from '../data/authCredentials';
import { AppState, DietTracking, WeeklyTracking } from '../types';

interface UserExportData {
  username: string;
  displayName: string;
  weekStart: string;
  weekEnd: string;
  dailyData: DailyExportRow[];
  weeklyData: WeeklyExportRow[];
  exerciseData: ExerciseExportRow[];
  summary: UserSummary;
}

interface DailyExportRow {
  date: string;
  fruits: number;
  vegetables: number;
  oliveOil: number;
  nuts: number;
  dailyGoalsCompleted: number;
  dailyGoalsTotal: number;
  dailyCompliancePercentage: number;
}

interface WeeklyExportRow {
  weekStart: string;
  fish: number;
  legumes: number;
  weeklyGoalsCompleted: number;
  weeklyGoalsTotal: number;
  weeklyCompliancePercentage: number;
}

interface ExerciseExportRow {
  weekStart: string;
  resistanceTraining: number;
  exerciseGoalsCompleted: number;
  exerciseGoalsTotal: number;
  exerciseCompliancePercentage: number;
}

interface UserSummary {
  totalDaysTracked: number;
  averageDailyCompliance: number;
  averageWeeklyCompliance: number;
  averageExerciseCompliance: number;
  overallCompliance: number;
}

class DataExportService {
  
  /**
   * Export all users' data for a specific week
   */
  exportWeeklyData(weekStartDate?: Date): Blob {
    const targetWeek = weekStartDate || new Date();
    const weekStart = startOfWeek(targetWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetWeek, { weekStartsOn: 1 });
    
    const allUsersData: UserExportData[] = [];
    
    // Process each user
    validCredentials.forEach(credential => {
      const userData = this.getUserWeeklyData(credential.username, weekStart, weekEnd);
      if (userData) {
        allUsersData.push(userData);
      }
    });
    
    return this.createExcelFile(allUsersData, weekStart, weekEnd);
  }
  
  /**
   * Get weekly data for a specific user
   */
  private getUserWeeklyData(username: string, weekStart: Date, weekEnd: Date): UserExportData | null {
    try {
      const userState = loadStateForUser(username);
      
      // Get all days in the week
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      const weekStartString = format(weekStart, 'yyyy-MM-dd');
      
      // Process daily data
      const dailyData: DailyExportRow[] = weekDays.map(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        const dayTracking = userState.tracking[dateString];
        
        return this.processDailyData(dateString, dayTracking, userState);
      });
      
      // Process weekly data
      const weeklyData: WeeklyExportRow[] = [
        this.processWeeklyData(weekStartString, userState.weeklyTracking[weekStartString], userState)
      ];
      
      // Process exercise data
      const exerciseData: ExerciseExportRow[] = [
        this.processExerciseData(weekStartString, userState)
      ];
      
      // Calculate summary
      const summary = this.calculateUserSummary(dailyData, weeklyData, exerciseData);
      
      return {
        username,
        displayName: userState.settings.name || username,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        dailyData,
        weeklyData,
        exerciseData,
        summary
      };
    } catch (error) {
      console.error(`Error processing data for user ${username}:`, error);
      return null;
    }
  }
  
  /**
   * Process daily tracking data for a specific date
   */
  private processDailyData(date: string, tracking: DietTracking | undefined, userState: AppState): DailyExportRow {
    const fruits = tracking?.items['fruits'] || 0;
    const vegetables = tracking?.items['vegetables'] || 0;
    const oliveOil = tracking?.items['oliveoil'] || 0;
    const nuts = tracking?.items['nuts'] || 0;
    
    // Calculate daily goals completion
    const dailyGoals = [
      { current: fruits, target: 3 },
      { current: vegetables, target: 2 },
      { current: oliveOil, target: 4 },
      { current: nuts, target: 1 }
    ];
    
    const dailyGoalsCompleted = dailyGoals.filter(goal => goal.current >= goal.target).length;
    const dailyGoalsTotal = dailyGoals.length;
    const dailyCompliancePercentage = (dailyGoalsCompleted / dailyGoalsTotal) * 100;
    
    return {
      date,
      fruits,
      vegetables,
      oliveOil,
      nuts,
      dailyGoalsCompleted,
      dailyGoalsTotal,
      dailyCompliancePercentage
    };
  }
  
  /**
   * Process weekly tracking data
   */
  private processWeeklyData(weekStart: string, tracking: WeeklyTracking | undefined, userState: AppState): WeeklyExportRow {
    const fish = tracking?.items['fish'] || 0;
    const legumes = tracking?.items['legumes'] || 0;
    
    // Calculate weekly goals completion
    const weeklyGoals = [
      { current: fish, target: 3 },
      { current: legumes, target: 3 }
    ];
    
    const weeklyGoalsCompleted = weeklyGoals.filter(goal => goal.current >= goal.target).length;
    const weeklyGoalsTotal = weeklyGoals.length;
    const weeklyCompliancePercentage = (weeklyGoalsCompleted / weeklyGoalsTotal) * 100;
    
    return {
      weekStart,
      fish,
      legumes,
      weeklyGoalsCompleted,
      weeklyGoalsTotal,
      weeklyCompliancePercentage
    };
  }
  
  /**
   * Process exercise data
   */
  private processExerciseData(weekStart: string, userState: AppState): ExerciseExportRow {
    const resistanceTraining = userState.exerciseItems.find(item => item.id === 'resistance')?.completed || 0;
    
    const exerciseGoalsCompleted = resistanceTraining >= 2 ? 1 : 0;
    const exerciseGoalsTotal = 1;
    const exerciseCompliancePercentage = (exerciseGoalsCompleted / exerciseGoalsTotal) * 100;
    
    return {
      weekStart,
      resistanceTraining,
      exerciseGoalsCompleted,
      exerciseGoalsTotal,
      exerciseCompliancePercentage
    };
  }
  
  /**
   * Calculate user summary statistics
   */
  private calculateUserSummary(dailyData: DailyExportRow[], weeklyData: WeeklyExportRow[], exerciseData: ExerciseExportRow[]): UserSummary {
    const totalDaysTracked = dailyData.filter(day => 
      day.fruits > 0 || day.vegetables > 0 || day.oliveOil > 0 || day.nuts > 0
    ).length;
    
    const averageDailyCompliance = dailyData.reduce((sum, day) => sum + day.dailyCompliancePercentage, 0) / dailyData.length;
    const averageWeeklyCompliance = weeklyData.reduce((sum, week) => sum + week.weeklyCompliancePercentage, 0) / weeklyData.length;
    const averageExerciseCompliance = exerciseData.reduce((sum, exercise) => sum + exercise.exerciseCompliancePercentage, 0) / exerciseData.length;
    
    const overallCompliance = (averageDailyCompliance + averageWeeklyCompliance + averageExerciseCompliance) / 3;
    
    return {
      totalDaysTracked,
      averageDailyCompliance: Math.round(averageDailyCompliance * 100) / 100,
      averageWeeklyCompliance: Math.round(averageWeeklyCompliance * 100) / 100,
      averageExerciseCompliance: Math.round(averageExerciseCompliance * 100) / 100,
      overallCompliance: Math.round(overallCompliance * 100) / 100
    };
  }
  
  /**
   * Create Excel file with all users' data
   */
  private createExcelFile(allUsersData: UserExportData[], weekStart: Date, weekEnd: Date): Blob {
    const workbook = XLSX.utils.book_new();
    
    // Create summary sheet
    this.createSummarySheet(workbook, allUsersData, weekStart, weekEnd);
    
    // Create detailed sheets for each user
    allUsersData.forEach(userData => {
      this.createUserDetailSheet(workbook, userData);
    });
    
    // Create consolidated daily data sheet
    this.createConsolidatedDailySheet(workbook, allUsersData);
    
    // Create consolidated weekly data sheet
    this.createConsolidatedWeeklySheet(workbook, allUsersData);
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
  
  /**
   * Create summary sheet with all users' overview
   */
  private createSummarySheet(workbook: XLSX.WorkBook, allUsersData: UserExportData[], weekStart: Date, weekEnd: Date) {
    const summaryData = [
      ['Mediterranean Diet Tracker - Weekly Summary'],
      [`Week: ${format(weekStart, 'MMM dd, yyyy')} - ${format(weekEnd, 'MMM dd, yyyy')}`],
      ['Generated:', format(new Date(), 'MMM dd, yyyy HH:mm')],
      [],
      ['Username', 'Display Name', 'Days Tracked', 'Daily Compliance %', 'Weekly Compliance %', 'Exercise Compliance %', 'Overall Compliance %'],
      ...allUsersData.map(user => [
        user.username,
        user.displayName,
        user.summary.totalDaysTracked,
        user.summary.averageDailyCompliance,
        user.summary.averageWeeklyCompliance,
        user.summary.averageExerciseCompliance,
        user.summary.overallCompliance
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // Username
      { width: 20 }, // Display Name
      { width: 15 }, // Days Tracked
      { width: 18 }, // Daily Compliance
      { width: 18 }, // Weekly Compliance
      { width: 18 }, // Exercise Compliance
      { width: 18 }  // Overall Compliance
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }
  
  /**
   * Create detailed sheet for individual user
   */
  private createUserDetailSheet(workbook: XLSX.WorkBook, userData: UserExportData) {
    const userDetailData = [
      [`${userData.displayName} (${userData.username}) - Detailed Data`],
      [`Week: ${userData.weekStart} to ${userData.weekEnd}`],
      [],
      ['DAILY NUTRITION'],
      ['Date', 'Fruits (3)', 'Vegetables (2)', 'Olive Oil (4)', 'Nuts (1)', 'Goals Met', 'Compliance %'],
      ...userData.dailyData.map(day => [
        day.date,
        day.fruits,
        day.vegetables,
        day.oliveOil,
        day.nuts,
        `${day.dailyGoalsCompleted}/${day.dailyGoalsTotal}`,
        `${day.dailyCompliancePercentage.toFixed(1)}%`
      ]),
      [],
      ['WEEKLY NUTRITION'],
      ['Week Start', 'Fish/Seafood (3)', 'Legumes (3)', 'Goals Met', 'Compliance %'],
      ...userData.weeklyData.map(week => [
        week.weekStart,
        week.fish,
        week.legumes,
        `${week.weeklyGoalsCompleted}/${week.weeklyGoalsTotal}`,
        `${week.weeklyCompliancePercentage.toFixed(1)}%`
      ]),
      [],
      ['EXERCISE'],
      ['Week Start', 'Resistance Training (2)', 'Goals Met', 'Compliance %'],
      ...userData.exerciseData.map(exercise => [
        exercise.weekStart,
        exercise.resistanceTraining,
        `${exercise.exerciseGoalsCompleted}/${exercise.exerciseGoalsTotal}`,
        `${exercise.exerciseCompliancePercentage.toFixed(1)}%`
      ])
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(userDetailData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 12 }, // Date/Week
      { width: 12 }, // Various data columns
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 12 },
      { width: 12 }
    ];
    
    // Truncate username for sheet name (Excel limit is 31 characters)
    const sheetName = userData.username.length > 31 ? userData.username.substring(0, 31) : userData.username;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
  
  /**
   * Create consolidated daily data sheet
   */
  private createConsolidatedDailySheet(workbook: XLSX.WorkBook, allUsersData: UserExportData[]) {
    const consolidatedDaily = [
      ['Consolidated Daily Nutrition Data'],
      [],
      ['Username', 'Date', 'Fruits', 'Vegetables', 'Olive Oil', 'Nuts', 'Daily Compliance %']
    ];
    
    allUsersData.forEach(user => {
      user.dailyData.forEach(day => {
        consolidatedDaily.push([
          user.username,
          day.date,
          day.fruits,
          day.vegetables,
          day.oliveOil,
          day.nuts,
          `${day.dailyCompliancePercentage.toFixed(1)}%`
        ]);
      });
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(consolidatedDaily);
    worksheet['!cols'] = [
      { width: 15 }, // Username
      { width: 12 }, // Date
      { width: 10 }, // Fruits
      { width: 12 }, // Vegetables
      { width: 12 }, // Olive Oil
      { width: 10 }, // Nuts
      { width: 15 }  // Compliance
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Data');
  }
  
  /**
   * Create consolidated weekly data sheet
   */
  private createConsolidatedWeeklySheet(workbook: XLSX.WorkBook, allUsersData: UserExportData[]) {
    const consolidatedWeekly = [
      ['Consolidated Weekly Data'],
      [],
      ['Username', 'Week Start', 'Fish/Seafood', 'Legumes', 'Resistance Training', 'Weekly Compliance %', 'Exercise Compliance %']
    ];
    
    allUsersData.forEach(user => {
      user.weeklyData.forEach((week, index) => {
        const exercise = user.exerciseData[index];
        consolidatedWeekly.push([
          user.username,
          week.weekStart,
          week.fish,
          week.legumes,
          exercise?.resistanceTraining || 0,
          `${week.weeklyCompliancePercentage.toFixed(1)}%`,
          `${exercise?.exerciseCompliancePercentage.toFixed(1)}%`
        ]);
      });
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(consolidatedWeekly);
    worksheet['!cols'] = [
      { width: 15 }, // Username
      { width: 12 }, // Week Start
      { width: 12 }, // Fish
      { width: 12 }, // Legumes
      { width: 15 }, // Resistance Training
      { width: 18 }, // Weekly Compliance
      { width: 18 }  // Exercise Compliance
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Data');
  }
  
  /**
   * Download the Excel file
   */
  downloadExcelFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  
  /**
   * Generate filename for the export
   */
  generateFilename(weekStart: Date): string {
    const weekString = format(weekStart, 'yyyy-MM-dd');
    const timestamp = format(new Date(), 'yyyyMMdd-HHmm');
    return `MediterraneanDiet-WeeklyReport-${weekString}-${timestamp}.xlsx`;
  }
}

export default new DataExportService();