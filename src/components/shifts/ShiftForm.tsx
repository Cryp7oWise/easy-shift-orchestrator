
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Employee, Shift } from "@/types";
import { TimePicker } from "@/components/ui/time-picker";
import { Slider } from "@/components/ui/slider";

const shiftSchema = z.object({
  employeeId: z.string().nullable(),
  date: z.date(),
  startHour: z.string()
    .refine(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
      message: "Must be in format HH:MM"
    }),
  endHour: z.string()
    .refine(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
      message: "Must be in format HH:MM"
    }),
  position: z.string().min(1, "Position is required"),
  breakDurationMinutes: z.number().min(0).max(120),
});

interface ShiftFormProps {
  shift?: Shift;
  employees: Employee[];
  onSubmit: (data: Omit<Shift, "id">) => void;
  onCancel: () => void;
}

export function ShiftForm({ shift, employees, onSubmit, onCancel }: ShiftFormProps) {
  const defaultDate = shift ? new Date(shift.startTime) : new Date();
  const defaultStartHour = shift ? format(new Date(shift.startTime), "HH:mm") : "09:00";
  const defaultEndHour = shift ? format(new Date(shift.endTime), "HH:mm") : "17:00";

  const form = useForm<z.infer<typeof shiftSchema>>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      employeeId: shift?.employeeId || null,
      date: defaultDate,
      startHour: defaultStartHour,
      endHour: defaultEndHour,
      position: shift?.position || "",
      breakDurationMinutes: shift?.breakDurationMinutes || 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof shiftSchema>) => {
    try {
      const [startHours, startMinutes] = data.startHour.split(":").map(Number);
      const [endHours, endMinutes] = data.endHour.split(":").map(Number);

      const startTime = new Date(data.date);
      startTime.setHours(startHours, startMinutes, 0);

      const endTime = new Date(data.date);
      endTime.setHours(endHours, endMinutes, 0);

      // Validate end time is after start time
      if (endTime <= startTime) {
        toast.error("End time must be after start time");
        return;
      }

      onSubmit({
        employeeId: data.employeeId,
        startTime,
        endTime,
        position: data.position,
        breakDurationMinutes: data.breakDurationMinutes,
      });

      form.reset();
    } catch (error) {
      toast.error("Failed to save shift");
      console.error(error);
    }
  };

  const positions = Array.from(
    new Set(employees.map((employee) => employee.position))
  );

  return (
    <div className="card-glass p-6 rounded-xl max-w-lg w-full mx-auto animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {shift ? "Edit Shift" : "Add New Shift"}
        </h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <TimePicker 
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="09:00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <TimePicker 
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="17:00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position Required</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="breakDurationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Duration: {field.value} minutes</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    min={0}
                    max={120}
                    step={5}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Employee (Optional)</FormLabel>
                <Select
                  value={field.value || "unassigned"}
                  onValueChange={(value) => field.onChange(value === "unassigned" ? null : value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {employees.map((employee) => {
                      const workDaysText = employee.workDaysCount ? ` (${employee.workDaysCount} days)` : '';
                      return (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.position}){workDaysText}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {shift ? "Update Shift" : "Add Shift"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
