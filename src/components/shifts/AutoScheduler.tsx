import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShiftTemplates } from "./ShiftTemplates";
import { AlertCircle, Wand2 } from "lucide-react";
import { Employee, Shift, ShiftTemplate } from "@/types";
import { autoScheduleShifts } from "@/utils/schedulingAlgorithm";

interface AutoSchedulerProps {
  shifts: Shift[];
  employees: Employee[];
  onAutoSchedule: (assignedShifts: Shift[]) => void;
  onUseTemplates: (templates: ShiftTemplate[]) => void;
}

export function AutoScheduler({
  shifts,
  employees,
  onAutoSchedule,
  onUseTemplates,
}: AutoSchedulerProps) {
  const [scheduling, setScheduling] = useState(false);
  const [schedulingMode, setSchedulingMode] = useState<"balanced" | "optimal">("balanced");
  const [overallocatedEmployees, setOverallocatedEmployees] = useState<string[]>([]);

  const unassignedShifts = shifts.filter(shift => !shift.employeeId);
  const assignedShifts = shifts.filter(shift => shift.employeeId);
  
  const estimatedTime = unassignedShifts.length * 0.5; // 0.5 seconds per shift is a rough estimate
  
  const handleAutoSchedule = async () => {
    if (unassignedShifts.length === 0) {
      toast.info("No unassigned shifts to schedule");
      return;
    }
    
    if (employees.length === 0) {
      toast.error("No employees available for scheduling");
      return;
    }
    
    setScheduling(true);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assignedShifts = autoScheduleShifts(
        shifts, 
        employees, 
        schedulingMode
      );
      
      // Check for overallocated employees
      const overallocated = checkOverallocatedEmployees(assignedShifts, employees);
      setOverallocatedEmployees(overallocated);
      
      if (overallocated.length > 0) {
        const names = overallocated.map(id => 
          employees.find(e => e.id === id)?.name || 'Unknown'
        ).join(', ');
        
        toast.warning(`Warning: Some employees are scheduled for more hours than their limit: ${names}`);
      }
      
      onAutoSchedule(assignedShifts);
      toast.success(`Successfully auto-scheduled ${unassignedShifts.length} shifts`);
    } catch (error) {
      console.error("Auto-scheduling error:", error);
      toast.error("Failed to auto-schedule shifts");
    } finally {
      setScheduling(false);
    }
  };

  const handleUseTemplates = (templates: ShiftTemplate[]) => {
    onUseTemplates(templates);
  };

  const checkOverallocatedEmployees = (shifts: Shift[], employees: Employee[]): string[] => {
    const overallocated: string[] = [];
    
    const employeeHours: Record<string, number> = {};
    
    for (const shift of shifts) {
      if (!shift.employeeId) continue;
      
      const duration = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
      
      if (!employeeHours[shift.employeeId]) {
        employeeHours[shift.employeeId] = 0;
      }
      
      employeeHours[shift.employeeId] += duration;
    }
    
    for (const employee of employees) {
      const totalHours = employeeHours[employee.id] || 0;
      const weeklyLimit = employee.hoursPerWeek;
      
      const adjustedLimit = weeklyLimit * employee.weeksPerPeriod;
      
      if (totalHours > adjustedLimit) {
        overallocated.push(employee.id);
      }
    }
    
    return overallocated;
  };

  return (
    <Tabs defaultValue="auto" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="auto">Auto-Scheduler</TabsTrigger>
        <TabsTrigger value="templates">Shift Templates</TabsTrigger>
      </TabsList>
      
      <TabsContent value="auto" className="mt-0">
        <Card className="shadow-sm animate-fade-in">
          <CardHeader>
            <CardTitle>Auto-Scheduler</CardTitle>
            <CardDescription>
              Automatically assign employees to open shifts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="balanced" className="mb-6" onValueChange={(v) => setSchedulingMode(v as "balanced" | "optimal")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="balanced">Balanced</TabsTrigger>
                <TabsTrigger value="optimal">Optimal</TabsTrigger>
              </TabsList>
              <TabsContent value="balanced" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Balances employee hours to ensure even distribution of shifts and prevent overworking.
                </p>
              </TabsContent>
              <TabsContent value="optimal" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Optimizes for employee position matching, ensuring employees work shifts that match their positions.
                </p>
              </TabsContent>
            </Tabs>

            {overallocatedEmployees.length > 0 && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Warning: Hour limit exceeded</p>
                  <p className="text-muted-foreground mt-1">
                    Some employees are scheduled for more hours than their weekly limit.
                    Review their schedules and make adjustments as needed.
                  </p>
                  <ul className="mt-2 list-disc list-inside">
                    {overallocatedEmployees.map(id => {
                      const employee = employees.find(e => e.id === id);
                      if (!employee) return null;
                      return (
                        <li key={id}>
                          {employee.name} (Limit: {employee.hoursPerWeek} hours/week over {employee.weeksPerPeriod} {employee.weeksPerPeriod === 1 ? 'week' : 'weeks'})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm mb-1">
                  <span className="font-medium">{unassignedShifts.length}</span> unassigned shifts
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">{employees.length}</span> available employees
                </div>
                {unassignedShifts.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Estimated processing time: ~{estimatedTime < 1 ? "< 1" : Math.ceil(estimatedTime)} seconds
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleAutoSchedule} 
                disabled={scheduling || unassignedShifts.length === 0 || employees.length === 0}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                {scheduling ? "Scheduling..." : "Auto-Schedule"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="templates" className="mt-0">
        <ShiftTemplates 
          employees={employees} 
          onUseTemplates={handleUseTemplates} 
        />
      </TabsContent>
    </Tabs>
  );
}
