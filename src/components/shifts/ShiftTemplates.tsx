
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import { ShiftTemplate, Employee } from "@/types";
import { ShiftTemplateForm } from "./ShiftTemplateForm";

interface ShiftTemplatesProps {
  employees: Employee[];
  onUseTemplates: (templates: ShiftTemplate[]) => void;
}

export function ShiftTemplates({ employees, onUseTemplates }: ShiftTemplatesProps) {
  const [templates, setTemplates] = useLocalStorage<ShiftTemplate[]>("smartplan-shift-templates", []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | undefined>(undefined);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // Get unique positions from employees
  const positions = Array.from(new Set(employees.map(emp => emp.position)));

  const handleAddTemplate = () => {
    setEditingTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleDuplicateTemplate = (template: ShiftTemplate) => {
    const newTemplate: ShiftTemplate = {
      ...template,
      id: uuidv4(),
      name: `${template.name} (Copy)`,
    };
    setTemplates([...templates, newTemplate]);
    toast.success("Template duplicated");
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
      toast.success("Template deleted");
    }
  };

  const handleSubmitTemplate = (data: Omit<ShiftTemplate, "id">) => {
    if (editingTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id ? { ...t, ...data } : t
      );
      setTemplates(updatedTemplates);
    } else {
      // Add new template
      const newTemplate: ShiftTemplate = {
        id: uuidv4(),
        ...data
      };
      setTemplates([...templates, newTemplate]);
    }
    
    setIsFormOpen(false);
    setEditingTemplate(undefined);
  };

  const handleUseTemplates = () => {
    if (templates.length === 0) {
      toast.error("No templates available");
      return;
    }
    
    onUseTemplates(templates);
  };

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <ShiftTemplateForm
          template={editingTemplate}
          positions={positions}
          onSubmit={handleSubmitTemplate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTemplate(undefined);
          }}
        />
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Shift Templates</CardTitle>
                <CardDescription>
                  Create reusable shift templates to quickly schedule employees
                </CardDescription>
              </div>
              <Button onClick={handleAddTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No templates created yet</p>
                <Button 
                  variant="outline" 
                  onClick={handleAddTemplate} 
                  className="mt-2"
                >
                  Create your first template
                </Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Break</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => {
                        const breakHours = Math.floor(template.breakDurationMinutes / 60);
                        const breakMinutes = template.breakDurationMinutes % 60;
                        const breakText = breakHours > 0 
                          ? `${breakHours}h ${breakMinutes > 0 ? `${breakMinutes}m` : ''}`
                          : `${breakMinutes}m`;
                        
                        return (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.startHour} - {template.endHour}</TableCell>
                            <TableCell>{template.position}</TableCell>
                            <TableCell>{breakText}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditTemplate(template)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDuplicateTemplate(template)}
                                  className="h-8 w-8"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(template.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleUseTemplates}>
                    Use Templates for Auto-Scheduling
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
