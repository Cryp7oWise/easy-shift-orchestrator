
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShiftForm } from "@/components/shifts/ShiftForm";
import { ShiftCalendar } from "@/components/shifts/ShiftCalendar";
import { AutoScheduler } from "@/components/shifts/AutoScheduler";
import { CalendarHeader } from "@/components/shifts/CalendarHeader";
import { Employee, Shift, ShiftTemplate } from "@/types";
import { Plus, CalendarX } from "lucide-react";
import { createShiftsFromTemplates } from "@/utils/schedulingAlgorithm";
import { addMonths, subMonths, addWeeks, subWeeks } from "date-fns";

const Schedule = () => {
  const [employees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [shifts, setShifts] = useLocalStorage<Shift[]>("smartplan-shifts", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | undefined>(undefined);
  const [initialDate, setInitialDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"week" | "month">("month");
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleAddShift = (date?: Date) => {
    setEditingShift(undefined);
    if (date) {
      setInitialDate(date);
    }
    setIsFormOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsFormOpen(true);
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(shift => shift.id !== id));
  };

  const handleClearAllShifts = () => {
    setClearDialogOpen(true);
  };

  const confirmClearAllShifts = () => {
    // Only clear assigned shifts (employeeId is not null)
    const unassignedShifts = shifts.map(shift => ({
      ...shift,
      employeeId: null
    }));
    setShifts(unassignedShifts);
    setClearDialogOpen(false);
    toast.success("All shift assignments cleared");
  };

  const handleAssignEmployee = (shift: Shift, employeeId: string) => {
    const updatedShifts = shifts.map(s => 
      s.id === shift.id ? { ...s, employeeId } : s
    );
    setShifts(updatedShifts);
    toast.success("Employee assigned to shift");
  };

  const handleSubmitShift = (data: Omit<Shift, "id">) => {
    if (editingShift) {
      // Update existing shift
      const updatedShifts = shifts.map(s => 
        s.id === editingShift.id ? { ...s, ...data } : s
      );
      setShifts(updatedShifts);
      toast.success("Shift updated successfully");
    } else {
      // Add new shift
      const newShift: Shift = {
        id: uuidv4(),
        ...data
      };
      setShifts([...shifts, newShift]);
      toast.success("Shift added successfully");
    }
    
    setIsFormOpen(false);
    setEditingShift(undefined);
  };

  const handleAutoSchedule = (updatedShifts: Shift[]) => {
    setShifts(updatedShifts);
  };

  const handleUseTemplates = (templates: ShiftTemplate[]) => {
    // Calculate date range based on the longest employee period
    const maxWeeks = employees.length > 0 
      ? Math.max(...employees.map(e => e.weeksPerPeriod || 1))
      : 4;
    
    // Default to 4 weeks if no employees
    const periodWeeks = maxWeeks > 0 ? maxWeeks : 4;
    
    const startDate = new Date(currentDate);
    const endDate = addWeeks(currentDate, periodWeeks);
    
    // Create shifts from templates
    const newShifts = createShiftsFromTemplates(templates, startDate, endDate, false);
    
    if (newShifts.length > 0) {
      setShifts([...shifts, ...newShifts]);
      toast.success(`Created ${newShifts.length} shifts for ${periodWeeks} week period`);
    } else {
      toast.error("No shifts were created");
    }
  };

  // Calendar navigation
  const handlePrevious = () => {
    if (calendarView === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (calendarView === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule</h1>
          <p className="text-muted-foreground">
            Manage your team's schedule and assign shifts
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleAddShift()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Shift
          </Button>
          <Button 
            variant="outline"
            onClick={handleClearAllShifts} 
            className="gap-2"
          >
            <CalendarX className="h-4 w-4" />
            Clear Assignments
          </Button>
        </div>
      </div>
      
      {isFormOpen ? (
        <ShiftForm 
          shift={editingShift}
          employees={employees}
          onSubmit={handleSubmitShift}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingShift(undefined);
          }}
        />
      ) : (
        <div className="space-y-8">
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="auto">Auto-Scheduler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-0 space-y-4">
              <CalendarHeader
                currentDate={currentDate}
                view={calendarView}
                onPrev={handlePrevious}
                onNext={handleNext}
                onToday={handleToday}
                onViewChange={setCalendarView}
              />
              
              <ShiftCalendar 
                shifts={shifts}
                employees={employees}
                currentDate={currentDate}
                view={calendarView}
                onEditShift={handleEditShift}
                onDeleteShift={handleDeleteShift}
                onAddShift={handleAddShift}
                onAssignEmployee={handleAssignEmployee}
                onMoveShift={(shiftId, newDate) => {
                  const shiftToMove = shifts.find(s => s.id === shiftId);
                  if (shiftToMove) {
                    // Calculate the time difference between old and new date
                    const oldDate = new Date(shiftToMove.startTime);
                    const timeDiff = newDate.getTime() - oldDate.getTime();
                    
                    // Apply the same time difference to both start and end times
                    const newStartTime = new Date(shiftToMove.startTime.getTime() + timeDiff);
                    const newEndTime = new Date(shiftToMove.endTime.getTime() + timeDiff);
                    
                    const updatedShift = {
                      ...shiftToMove,
                      startTime: newStartTime,
                      endTime: newEndTime
                    };
                    
                    const updatedShifts = shifts.map(s => 
                      s.id === shiftId ? updatedShift : s
                    );
                    
                    setShifts(updatedShifts);
                    toast.success("Shift moved successfully");
                  }
                }}
              />
            </TabsContent>
            
            <TabsContent value="auto" className="mt-0 space-y-4">
              <AutoScheduler 
                shifts={shifts}
                employees={employees}
                onAutoSchedule={handleAutoSchedule}
                onUseTemplates={handleUseTemplates}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Shift Assignments</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all employee assignments from shifts. The shifts themselves will remain but will be unassigned.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAllShifts}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear Assignments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schedule;
