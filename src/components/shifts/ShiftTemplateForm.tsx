
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShiftTemplate } from "@/types";
import { TimePicker } from "@/components/ui/time-picker";

const shiftTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  startHour: z.string()
    .refine(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
      message: "Must be in format HH:MM"
    }),
  endHour: z.string()
    .refine(time => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time), {
      message: "Must be in format HH:MM"
    }),
  position: z.string().min(1, "Position is required"),
  breakDurationMinutes: z.coerce.number().min(0, "Break duration cannot be negative"),
});

type ShiftTemplateFormData = z.infer<typeof shiftTemplateSchema>;

interface ShiftTemplateFormProps {
  template?: ShiftTemplate;
  positions: string[];
  onSubmit: (data: Omit<ShiftTemplate, "id">) => void;
  onCancel: () => void;
}

export function ShiftTemplateForm({ 
  template, 
  positions, 
  onSubmit, 
  onCancel 
}: ShiftTemplateFormProps) {
  const form = useForm<ShiftTemplateFormData>({
    resolver: zodResolver(shiftTemplateSchema),
    defaultValues: template || {
      name: "",
      startHour: "09:00",
      endHour: "17:00",
      position: positions[0] || "",
      breakDurationMinutes: 30,
    },
  });

  const handleSubmit = (data: ShiftTemplateFormData) => {
    try {
      onSubmit({
        name: data.name,
        startHour: data.startHour,
        endHour: data.endHour,
        position: data.position,
        breakDurationMinutes: data.breakDurationMinutes,
      });

      form.reset();
      toast.success(`Shift template ${template ? "updated" : "created"} successfully`);
    } catch (error) {
      toast.error("Failed to save shift template");
      console.error(error);
    }
  };

  // Calculate break duration in hours and minutes for display
  const breakHours = Math.floor(form.watch("breakDurationMinutes") / 60);
  const breakMinutes = form.watch("breakDurationMinutes") % 60;

  return (
    <div className="card-glass p-6 rounded-xl max-w-lg w-full mx-auto animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {template ? "Edit Shift Template" : "Create Shift Template"}
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Morning Shift" {...field} />
                </FormControl>
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
                {positions.length > 0 ? (
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
                ) : (
                  <Input placeholder="e.g., Manager" {...field} />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="breakDurationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Break Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormDescription>
                  {breakHours > 0 && `${breakHours} hour${breakHours > 1 ? 's' : ''} `}
                  {breakMinutes > 0 && `${breakMinutes} minute${breakMinutes > 1 ? 's' : ''}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
