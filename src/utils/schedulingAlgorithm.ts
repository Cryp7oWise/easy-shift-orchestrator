
import { Employee, Shift } from "@/types";
import { differenceInMinutes } from "date-fns";

// Calculate duration of a shift in hours
const getShiftDuration = (shift: Shift): number => {
  return differenceInMinutes(new Date(shift.endTime), new Date(shift.startTime)) / 60;
};

// Check if employee already has a conflicting shift
const hasConflict = (employee: Employee, shift: Shift, assignedShifts: Shift[]): boolean => {
  const employeeShifts = assignedShifts.filter(s => s.employeeId === employee.id);
  
  for (const existingShift of employeeShifts) {
    const newStart = new Date(shift.startTime).getTime();
    const newEnd = new Date(shift.endTime).getTime();
    const existingStart = new Date(existingShift.startTime).getTime();
    const existingEnd = new Date(existingShift.endTime).getTime();
    
    // Check for overlap
    if (
      (newStart >= existingStart && newStart < existingEnd) || 
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return true;
    }
  }
  
  return false;
};

// Calculate total assigned hours for an employee
const calculateAssignedHours = (employee: Employee, allShifts: Shift[]): number => {
  return allShifts
    .filter(s => s.employeeId === employee.id)
    .reduce((total, shift) => total + getShiftDuration(shift), 0);
};

// Score an employee for a shift (higher is better)
const scoreEmployeeForShift = (
  employee: Employee, 
  shift: Shift, 
  allShifts: Shift[], 
  allEmployees: Employee[],
  mode: "balanced" | "optimal"
): number => {
  // Always return -1000 for conflicts (cannot be assigned)
  if (hasConflict(employee, shift, allShifts)) {
    return -1000;
  }

  // Calculate currently assigned hours for this employee
  const assignedHours = calculateAssignedHours(employee, allShifts);
  
  // Calculate how many hours the employee is above/below their target
  const hoursDifference = employee.hoursPerWeek - assignedHours;
  
  // Position match score (3 points if positions match exactly)
  const positionMatchScore = employee.position === shift.position ? 3 : 0;
  
  // Relative workload score (how much more/less this employee works compared to others)
  const avgHoursPerEmployee = allEmployees.reduce(
    (sum, emp) => sum + calculateAssignedHours(emp, allShifts), 
    0
  ) / allEmployees.length;
  
  const relativeWorkloadScore = avgHoursPerEmployee - assignedHours;
  
  if (mode === "balanced") {
    // Prioritize balancing hours
    return hoursDifference + (relativeWorkloadScore * 0.5) + positionMatchScore;
  } else {
    // Prioritize position matching
    return positionMatchScore * 2 + hoursDifference + (relativeWorkloadScore * 0.2);
  }
};

export const autoScheduleShifts = (
  shifts: Shift[], 
  employees: Employee[],
  mode: "balanced" | "optimal" = "balanced"
): Shift[] => {
  // Create a copy of shifts to work with
  const workingShifts = [...shifts];
  
  // Get only unassigned shifts
  const unassignedShifts = workingShifts.filter(shift => !shift.employeeId);
  
  // Sort shifts by start time so we schedule earlier shifts first
  unassignedShifts.sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  // For each unassigned shift, find the best employee
  for (const shift of unassignedShifts) {
    let bestEmployee: Employee | null = null;
    let bestScore = -Infinity;
    
    // Score each employee
    for (const employee of employees) {
      const score = scoreEmployeeForShift(
        employee, 
        shift, 
        workingShifts, 
        employees,
        mode
      );
      
      // Skip employees with conflicts
      if (score < -100) continue;
      
      // Update best employee if this one has a higher score
      if (score > bestScore) {
        bestScore = score;
        bestEmployee = employee;
      }
    }
    
    // Assign the shift to the best employee if found
    if (bestEmployee) {
      const shiftIndex = workingShifts.findIndex(s => s.id === shift.id);
      if (shiftIndex !== -1) {
        workingShifts[shiftIndex] = {
          ...workingShifts[shiftIndex],
          employeeId: bestEmployee.id
        };
      }
    }
  }
  
  return workingShifts;
};
