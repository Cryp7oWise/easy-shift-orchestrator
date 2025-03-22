
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { Employee } from "@/types";

const Employees = () => {
  const [employees, setEmployees] = useLocalStorage<Employee[]>("smartplan-employees", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);

  const handleAddEmployee = () => {
    setEditingEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast.success("Employee deleted successfully");
  };

  const handleSubmitEmployee = (data: Omit<Employee, "id">) => {
    if (editingEmployee) {
      // Update existing employee
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id ? { ...emp, ...data } : emp
      );
      setEmployees(updatedEmployees);
      toast.success("Employee updated successfully");
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: uuidv4(),
        ...data
      };
      setEmployees([...employees, newEmployee]);
      toast.success("Employee added successfully");
    }
    
    setIsFormOpen(false);
    setEditingEmployee(undefined);
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members and their weekly hour targets
        </p>
      </div>
      
      {isFormOpen ? (
        <EmployeeForm 
          employee={editingEmployee}
          onSubmit={handleSubmitEmployee}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingEmployee(undefined);
          }}
        />
      ) : (
        <EmployeeList 
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )}
    </div>
  );
};

export default Employees;
