
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Employee } from "@/types";
import { X } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  hoursPerWeek: z.coerce
    .number()
    .min(1, "Hours must be at least 1")
    .max(168, "Hours cannot exceed 168 (hours in a week)"),
  color: z.string(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, "id">) => void;
  onCancel: () => void;
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6366F1", // indigo
  "#06B6D4", // cyan
];

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [selectedColor, setSelectedColor] = useState(employee?.color || COLORS[0]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? { ...employee }
      : {
          name: "",
          email: "",
          position: "",
          hoursPerWeek: 40,
          color: COLORS[0],
        },
  });

  const handleSubmit = (data: EmployeeFormData) => {
    try {
      // Ensure all required fields are included and properly typed
      const employeeData: Omit<Employee, "id"> = {
        name: data.name,
        email: data.email,
        position: data.position,
        hoursPerWeek: data.hoursPerWeek,
        color: selectedColor,
      };
      
      onSubmit(employeeData);
      form.reset();
    } catch (error) {
      toast.error("Failed to save employee");
      console.error(error);
    }
  };

  return (
    <div className="card-glass p-6 rounded-xl max-w-lg w-full mx-auto animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {employee ? "Edit Employee" : "Add New Employee"}
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours Per Week</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={168} {...field} />
                </FormControl>
                <FormDescription>
                  Target number of hours per week for this employee
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Color</FormLabel>
            <div className="flex items-center gap-2 mt-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-primary ring-offset-background"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    form.setValue("color", color);
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {employee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
