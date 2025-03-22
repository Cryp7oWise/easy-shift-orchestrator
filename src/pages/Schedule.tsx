
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShiftForm } from "@/components/shifts/ShiftForm";
import { ShiftCalendar } from "@/components/shifts/ShiftCalendar";
import { AutoScheduler } from "@/components/shifts/AutoScheduler";
import { Employee, Shift } from "@/types";
import { Plus } from "lucide-react";

const Schedule = () => {
  const [employees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [shifts, setShifts] = useLocalStorage<Shift[]>("smartplan-shifts", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | undefined>(undefined);
  const [initialDate, setInitialDate] = useState<Date>(new Date());

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

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Schedule</h1>
          <p className="text-muted-foreground">
            Manage your team's schedule and assign shifts
          </p>
        </div>
        
        <Button onClick={() => handleAddShift()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shift
        </Button>
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
              <ShiftCalendar 
                shifts={shifts}
                employees={employees}
                onEditShift={handleEditShift}
                onDeleteShift={handleDeleteShift}
                onAddShift={handleAddShift}
                onAssignEmployee={handleAssignEmployee}
              />
            </TabsContent>
            
            <TabsContent value="auto" className="mt-0 space-y-4">
              <AutoScheduler 
                shifts={shifts}
                employees={employees}
                onAutoSchedule={handleAutoSchedule}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Schedule;
