
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types";
import { MoreHorizontal, Plus, UserPlus, Mail, Clock } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export function EmployeeList({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeListProps) {
  return (
    <Card className="w-full shadow-sm animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Employees</CardTitle>
            <CardDescription>
              Manage your team and their hour targets
            </CardDescription>
          </div>
          <Button onClick={onAddEmployee} size="sm" className="gap-1">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline-block">Add Employee</span>
            <span className="inline-block sm:hidden">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <UserPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No employees yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Add your first employee to get started with scheduling and managing your team.
            </p>
            <Button onClick={onAddEmployee} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Employee
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={() => onEditEmployee(employee)}
                onDelete={() => onDeleteEmployee(employee.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit: () => void;
  onDelete: () => void;
}

function EmployeeCard({ employee, onEdit, onDelete }: EmployeeCardProps) {
  // Calculate assigned workdays for this employee
  const workDaysText = employee.workDaysCount ? ` (${employee.workDaysCount} days)` : '';
  
  return (
    <div 
      className="card-glass rounded-xl p-4 transition-all duration-300 hover:shadow-md flex flex-col justify-between gap-3"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium" 
            style={{ backgroundColor: employee.color }}
          >
            {employee.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium">{employee.name}</h3>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-2 space-y-2">
        <div className="flex items-center text-sm gap-2">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{employee.email}</span>
        </div>
        <div className="flex items-center text-sm gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {employee.hoursPerWeek} hours{workDaysText}
          </span>
        </div>
      </div>
    </div>
  );
}
