
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
import { Wand2 } from "lucide-react";
import { Employee, Shift } from "@/types";
import { autoScheduleShifts } from "@/utils/schedulingAlgorithm";

interface AutoSchedulerProps {
  shifts: Shift[];
  employees: Employee[];
  onAutoSchedule: (assignedShifts: Shift[]) => void;
}

export function AutoScheduler({
  shifts,
  employees,
  onAutoSchedule,
}: AutoSchedulerProps) {
  const [scheduling, setScheduling] = useState(false);
  const [schedulingMode, setSchedulingMode] = useState<"balanced" | "optimal">("balanced");

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
      
      onAutoSchedule(assignedShifts);
      toast.success(`Successfully auto-scheduled ${unassignedShifts.length} shifts`);
    } catch (error) {
      console.error("Auto-scheduling error:", error);
      toast.error("Failed to auto-schedule shifts");
    } finally {
      setScheduling(false);
    }
  };

  return (
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
  );
}
