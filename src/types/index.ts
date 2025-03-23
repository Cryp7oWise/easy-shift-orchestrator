
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  hoursPerWeek: number; // No limit on hours
  weeksPerPeriod: number;
  color: string;
  restHoursBetweenShifts: number; // Hours needed between shifts
  workDaysCount?: number; // Track number of days worked
}

export interface Shift {
  id: string;
  employeeId: string | null;
  startTime: Date;
  endTime: Date;
  position: string;
  breakDurationMinutes?: number; // Break duration in minutes
}

export interface ShiftTemplate {
  id: string;
  name: string;
  startHour: string;
  endHour: string;
  position: string;
  breakDurationMinutes: number;
}

export interface ScheduleDay {
  date: Date;
  shifts: Shift[];
}

export interface ScheduleWeek {
  startDate: Date;
  endDate: Date;
  days: ScheduleDay[];
}
