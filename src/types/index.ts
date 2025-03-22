

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  hoursPerWeek: number; // Keeping the property name for compatibility
  weeksPerPeriod: number;
  color: string;
}

export interface Shift {
  id: string;
  employeeId: string | null;
  startTime: Date;
  endTime: Date;
  position: string;
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
