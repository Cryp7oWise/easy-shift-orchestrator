import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks, 
  addDays, 
  isSameDay, 
  isToday, 
  getWeek,
  getYear
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee, Shift } from "@/types";
import { ChevronLeft, ChevronRight, Printer, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { WeeklyTableView as WeeklyTableViewComponent } from "@/components/schedule/WeeklyTableView";

const WeeklyView = () => {
  const [employees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [shifts, setShifts] = useLocalStorage<Shift[]>("smartplan-shifts", []);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekRange, setWeekRange] = useState<Date[]>([]);

  // Get week number
  const weekNumber = getWeek(currentDate, { weekStartsOn: 1 });
  
  // Generate two weeks for display
  useEffect(() => {
    const firstWeek = {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    };
    
    const secondWeek = {
      start: startOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 }),
      end: endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 })
    };
    
    setWeekRange([firstWeek.start, firstWeek.end, secondWeek.start, secondWeek.end]);
  }, [currentDate]);

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrint = () => {
    if (window) {
      window.print();
    }
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Schedule</h1>
          <p className="text-muted-foreground">
            View your team's schedule in a weekly table format
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
          <h2 className="text-2xl font-bold">Week {weekNumber}</h2>
          
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
        
        <div className="space-y-10">
          {weekRange.length === 4 && (
            <>
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-lg">
                    Week {weekNumber}, {getYear(currentDate)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <WeeklyTableViewComponent 
                    shifts={shifts}
                    employees={employees}
                    currentDate={currentDate}
                    weekStartsOn={1}
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-lg">
                    Week {weekNumber + 1}, {getYear(addWeeks(currentDate, 1))}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <WeeklyTableViewComponent 
                    shifts={shifts}
                    employees={employees}
                    currentDate={addWeeks(currentDate, 1)}
                    weekStartsOn={1}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      
      {/* Print specific styles */}
      <style>
      {`
        @media print {
          @page { size: landscape; }
          body * {
            visibility: hidden;
          }
          .card, .card * {
            visibility: visible;
          }
          .card {
            break-inside: avoid;
            margin-bottom: 20px;
          }
          button, .no-print {
            display: none !important;
          }
        }
      `}
      </style>
    </div>
  );
};

export default WeeklyView;

