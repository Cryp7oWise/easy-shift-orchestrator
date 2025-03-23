
import { useState, useEffect } from "react";
import { format, isSameDay, startOfWeek, endOfWeek, addDays, getWeek, addWeeks, isToday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Employee, Shift } from "@/types";
import { differenceInMinutes } from "date-fns";

interface WeeklyTableViewProps {
  shifts: Shift[];
  employees: Employee[];
  currentDate: Date;
  weekStartsOn?: 0 | 1;
}

export function WeeklyTableView({ 
  shifts, 
  employees, 
  currentDate,
  weekStartsOn = 1 
}: WeeklyTableViewProps) {
  // Generate days of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Get week number
  const weekNumber = getWeek(currentDate, { weekStartsOn });
  
  // Group shifts by employee and day
  const getShiftsForEmployeeAndDay = (employeeId: string, date: Date) => {
    return shifts.filter(shift => 
      shift.employeeId === employeeId && 
      isSameDay(new Date(shift.startTime), date)
    ).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };

  // Format time in 24-hour format
  const formatTimeRange = (start: Date, end: Date) => {
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  // Get all shifts for each day, regardless of employee
  const getShiftsForDay = (date: Date) => {
    return shifts
      .filter(shift => isSameDay(new Date(shift.startTime), date))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // Get unique shifts per day (time slots)
  const getUniqueShiftTimesForWeek = () => {
    const timeSlots = new Set<string>();
    
    weekDays.forEach(day => {
      const dayShifts = getShiftsForDay(day);
      dayShifts.forEach(shift => {
        const timeString = formatTimeRange(
          new Date(shift.startTime),
          new Date(shift.endTime)
        );
        timeSlots.add(timeString);
      });
    });
    
    return Array.from(timeSlots).sort((a, b) => {
      const [aStart] = a.split(' - ');
      const [bStart] = b.split(' - ');
      return aStart.localeCompare(bStart);
    });
  };

  const uniqueTimeSlots = getUniqueShiftTimesForWeek();
  
  // Find employee by ID
  const getEmployee = (id: string | null) => {
    if (!id) return null;
    return employees.find(e => e.id === id) || null;
  };

  // Render the weekly view as a table with time slots rows
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Week {weekNumber} Schedule
        </h3>
        <div className="text-sm text-muted-foreground">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </div>
      </div>
      
      <Card className="shadow-sm overflow-x-auto">
        <CardContent className="p-0">
          <table className="w-full border-collapse min-w-[768px]">
            <thead>
              <tr className="bg-muted/30">
                <th className="border p-2 text-left font-medium">Time</th>
                {weekDays.map((day, i) => (
                  <th 
                    key={i} 
                    className={`border p-2 text-center font-medium ${isToday(day) ? 'bg-primary/10' : ''}`}
                  >
                    <div className="text-sm mb-1">
                      {format(day, "EEEE")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, "d MMM")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueTimeSlots.map((timeSlot, timeIndex) => (
                <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-muted/10' : ''}>
                  <td className="border p-2 font-medium text-sm">{timeSlot}</td>
                  
                  {weekDays.map((day, dayIndex) => {
                    const [startTimeStr, endTimeStr] = timeSlot.split(' - ');
                    const dayShifts = getShiftsForDay(day).filter(shift => {
                      const shiftStart = format(new Date(shift.startTime), "HH:mm");
                      const shiftEnd = format(new Date(shift.endTime), "HH:mm");
                      const shiftTimeStr = `${shiftStart} - ${shiftEnd}`;
                      return shiftTimeStr === timeSlot;
                    });
                    
                    return (
                      <td key={dayIndex} className="border p-1 text-center">
                        <div className="space-y-1">
                          {dayShifts.map((shift, shiftIndex) => {
                            const employee = getEmployee(shift.employeeId);
                            
                            return (
                              <div 
                                key={shiftIndex} 
                                className="text-xs p-1 rounded text-left flex items-center"
                              >
                                {employee ? (
                                  <>
                                    <div 
                                      className="h-2 w-2 rounded-full mr-1.5" 
                                      style={{ backgroundColor: employee.color }} 
                                    />
                                    <span>{employee.name}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">{shift.position}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {uniqueTimeSlots.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    No shifts scheduled for this week
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
