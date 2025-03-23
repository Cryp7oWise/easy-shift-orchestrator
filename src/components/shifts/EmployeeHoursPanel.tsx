
import { Employee, Shift } from "@/types";
import { differenceInMinutes } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateAssignedHours } from "@/utils/schedulingAlgorithm";

interface EmployeeHoursPanelProps {
  employees: Employee[];
  shifts: Shift[];
}

export function EmployeeHoursPanel({ employees, shifts }: EmployeeHoursPanelProps) {
  // Sort employees by name
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="border rounded-md shadow-sm h-full overflow-hidden">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-medium text-sm">Employee Hours</h3>
      </div>
      <ScrollArea className="h-[calc(100%-42px)]">
        <div className="p-2 space-y-4">
          {sortedEmployees.map((employee) => {
            const assignedHours = calculateAssignedHours(employee, shifts);
            const targetHours = employee.hoursPerWeek * employee.weeksPerPeriod;
            const remainingHours = Math.max(0, targetHours - assignedHours);
            const progressPercentage = Math.min(100, (assignedHours / targetHours) * 100);
            
            return (
              <div key={employee.id} className="pb-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: employee.color }} 
                  />
                  <span className="font-medium text-sm truncate">{employee.name}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-1.5 text-muted-foreground">
                  <div>Target: {targetHours}h</div>
                  <div>Assigned: {assignedHours.toFixed(1)}h</div>
                  <div>Left: {remainingHours.toFixed(1)}h</div>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
              </div>
            );
          })}

          {employees.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              <p>No employees added yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
