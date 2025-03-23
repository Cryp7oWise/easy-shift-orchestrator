
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, isSameDay, isToday, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Employee, Shift } from "@/types";
import { ChevronLeft, ChevronRight, Printer, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const WeeklyView = () => {
  const [employees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [shifts, setShifts] = useLocalStorage<Shift[]>("smartplan-shifts", []);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());

  // Generate week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Get week number (ISO)
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handlePrint = () => {
    if (window) {
      window.print();
    }
  };

  // Group shifts by date for the weekly view
  const getShiftsForDate = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.startTime);
      return isSameDay(shiftDate, date);
    }).sort((a, b) => {
      // Sort by start time
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };

  // Format time in 24-hour format
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Find employee by ID
  const getEmployee = (id: string | null) => {
    if (!id) return null;
    return employees.find(e => e.id === id) || null;
  };

  // Render the shift in the table
  const renderShiftCell = (shift: Shift) => {
    const employee = getEmployee(shift.employeeId);
    const startTime = formatTime(new Date(shift.startTime));
    const endTime = formatTime(new Date(shift.endTime));
    const timeRange = `${startTime} - ${endTime}`;
    
    return (
      <div 
        key={shift.id} 
        className="p-2 border-b last:border-b-0"
        style={{ borderLeftColor: employee?.color, borderLeftWidth: employee ? '4px' : '0' }}
      >
        <div className="font-medium">{timeRange}</div>
        {employee ? (
          <div className="flex items-center gap-1.5 mt-1">
            <div 
              className="h-2.5 w-2.5 rounded-full" 
              style={{ backgroundColor: employee.color }} 
            />
            <span className="text-sm">{employee.name}</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{shift.position}</div>
        )}
      </div>
    );
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Schedule</h1>
          <p className="text-muted-foreground">
            View your team's schedule in a weekly format
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint} 
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            variant="outline"
            asChild
            className="gap-2"
          >
            <Link to="/schedule">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Week {getWeekNumber(currentWeek)}</h2>
          
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevWeek}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleToday}
              className="h-8"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card className="overflow-x-auto shadow-sm print:shadow-none">
          <CardContent className="p-0">
            <div className="min-w-[768px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/40">
                    {weekDays.map((day, i) => (
                      <th 
                        key={i} 
                        className={`p-3 text-center border font-medium ${isToday(day) ? 'bg-primary/10' : ''}`}
                      >
                        <div className="text-muted-foreground text-sm mb-1">
                          {format(day, "EEEE")}
                        </div>
                        <div className={`font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                          {format(day, "d MMMM")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {weekDays.map((day, dayIndex) => {
                      const dayShifts = getShiftsForDate(day);
                      
                      return (
                        <td key={dayIndex} className="border p-0 align-top">
                          <div className="min-h-[100px]">
                            {dayShifts.length > 0 ? (
                              dayShifts.map(shift => renderShiftCell(shift))
                            ) : (
                              <div className="p-4 text-center text-muted-foreground text-sm">
                                No shifts
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Print specific styles */}
      <style jsx global>{`
        @media print {
          @page { size: landscape; }
          body * {
            visibility: hidden;
          }
          .card, .card * {
            visibility: visible;
          }
          .card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WeeklyView;
