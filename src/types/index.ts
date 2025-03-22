
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  hoursPerWeek: number;
  color: string;
}

export interface Shift {
  id: string;
  employeeId: string | null;
  startTime: Date;
  endTime: Date;
  position: string;
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
