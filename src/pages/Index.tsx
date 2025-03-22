
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  CalendarDays, 
  Users, 
  Clock, 
  Briefcase, 
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Employee, Shift } from "@/types";
import { differenceInHours, format, isToday, isTomorrow } from "date-fns";

const Index = () => {
  const [employees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [shifts] = useLocalStorage<Shift[]>("smartplan-shifts", []);
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const totalEmployees = employees.length;
  const totalShifts = shifts.length;
  const unassignedShifts = shifts.filter(shift => !shift.employeeId).length;
  const totalHours = shifts.reduce((total, shift) => 
    total + differenceInHours(new Date(shift.endTime), new Date(shift.startTime)), 
    0
  );

  // Get today's and tomorrow's shifts
  const getTodayShifts = () => {
    return shifts.filter(shift => 
      isToday(new Date(shift.startTime))
    );
  };

  const getTomorrowShifts = () => {
    return shifts.filter(shift => 
      isTomorrow(new Date(shift.startTime))
    );
  };

  const todayShifts = getTodayShifts();
  const tomorrowShifts = getTomorrowShifts();

  const getEmployeeName = (id: string | null) => {
    if (!id) return "Unassigned";
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : "Unknown";
  };

  return (
    <div className="py-8 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to SmartPlan, your intelligent work scheduling tool
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm">Total Employees</p>
                <h3 className="text-3xl font-bold mt-1">{totalEmployees}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Link to="/employees">
                View employees <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm">Total Shifts</p>
                <h3 className="text-3xl font-bold mt-1">{totalShifts}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Link to="/schedule">
                View schedule <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm">Unassigned Shifts</p>
                <h3 className="text-3xl font-bold mt-1">{unassignedShifts}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Link to="/schedule?tab=auto">
                Auto-schedule <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm">Total Hours</p>
                <h3 className="text-3xl font-bold mt-1">{totalHours}</h3>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-2">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
              <Link to="/schedule">
                View details <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Today's Shifts</h3>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {todayShifts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No shifts scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayShifts.map(shift => (
                  <div key={shift.id} className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{getEmployeeName(shift.employeeId)}</p>
                      <p className="text-sm text-muted-foreground">{shift.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {format(new Date(shift.startTime), "h:mm a")} - {format(new Date(shift.endTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {differenceInHours(new Date(shift.endTime), new Date(shift.startTime))} hours
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {todayShifts.length > 0 && (
            <CardFooter className="pb-6 pt-2">
              <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Link to="/schedule">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
        
        <Card className="card-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Tomorrow's Shifts</h3>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {tomorrowShifts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No shifts scheduled for tomorrow</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tomorrowShifts.map(shift => (
                  <div key={shift.id} className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{getEmployeeName(shift.employeeId)}</p>
                      <p className="text-sm text-muted-foreground">{shift.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {format(new Date(shift.startTime), "h:mm a")} - {format(new Date(shift.endTime), "h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {differenceInHours(new Date(shift.endTime), new Date(shift.startTime))} hours
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {tomorrowShifts.length > 0 && (
            <CardFooter className="pb-6 pt-2">
              <Button asChild variant="ghost" size="sm" className="gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Link to="/schedule">
                  View all <ChevronRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
