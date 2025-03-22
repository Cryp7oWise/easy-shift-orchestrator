
import { useState, useRef, useEffect } from "react";
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  getHours, 
  getMinutes,
  addWeeks,
  subWeeks,
  isToday,
  differenceInMinutes,
  differenceInHours
} from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Edit, Trash2, UserCheck } from "lucide-react";
import { Employee, Shift } from "@/types";

const HOUR_HEIGHT = 80; // pixels per hour
const DAY_START_HOUR = 6; // 6am
const DAY_END_HOUR = 22; // 10pm
const HOURS_DISPLAYED = DAY_END_HOUR - DAY_START_HOUR;

interface ShiftCalendarProps {
  shifts: Shift[];
  employees: Employee[];
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onAddShift: (date: Date) => void;
  onAssignEmployee: (shift: Shift, employeeId: string) => void;
}

type DragInfo = {
  shiftId: string;
  initialStartY: number;
  initialEndY: number;
  elementHeight: number;
  dayIndex: number;
};

export function ShiftCalendar({
  shifts,
  employees,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onAssignEmployee,
}: ShiftCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Generate days of the week
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const daysArray = eachDayOfInterval({ start, end });
    setWeekDays(daysArray);
  }, [currentDate]);

  // Get hours for the day
  const hourLabels = Array.from({ length: HOURS_DISPLAYED + 1 }, (_, i) => i + DAY_START_HOUR);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, shiftId: string, dayIndex: number) => {
    if (containerRef.current) {
      const element = e.currentTarget as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      
      setDragging({
        shiftId,
        initialStartY: rect.top,
        initialEndY: rect.bottom,
        elementHeight: rect.height,
        dayIndex,
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !containerRef.current) {
      setDragging(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerTop = containerRect.top;
    
    let clientY: number;
    if ("touches" in e) {
      // Touch event
      clientY = e.changedTouches[0].clientY;
    } else {
      // Mouse event
      clientY = e.clientY;
    }
    
    const relativeY = clientY - containerTop;
    
    // Calculate new time based on drag position
    const hoursOffset = (relativeY / HOUR_HEIGHT) + DAY_START_HOUR;
    
    const shift = shifts.find(s => s.id === dragging.shiftId);
    
    if (shift) {
      // Calculate duration of shift
      const durationMinutes = differenceInMinutes(shift.endTime, shift.startTime);
      
      // Create new start time based on drag position
      const newDay = weekDays[dragging.dayIndex];
      const newStartTime = new Date(newDay);
      const hours = Math.floor(hoursOffset);
      const minutes = Math.round((hoursOffset - hours) * 60);
      newStartTime.setHours(hours, minutes, 0, 0);
      
      // Create new end time based on duration
      const newEndTime = new Date(newStartTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + durationMinutes);
      
      // Check if the new times are within the day bounds
      if (
        getHours(newStartTime) >= DAY_START_HOUR && 
        getHours(newEndTime) <= DAY_END_HOUR + 1
      ) {
        const updatedShift: Shift = {
          ...shift,
          startTime: newStartTime,
          endTime: newEndTime
        };
        
        onEditShift(updatedShift);
        toast.success("Shift moved successfully");
      } else {
        toast.error("Cannot move shift outside displayed hours");
      }
    }
    
    setDragging(null);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  // Calculate shift position
  const calculateShiftStyle = (shift: Shift, dayIndex: number) => {
    const shiftDate = new Date(shift.startTime);
    const currentDayDate = weekDays[dayIndex];
    
    // Check if the shift is on the current day
    if (
      shiftDate.getDate() !== currentDayDate.getDate() ||
      shiftDate.getMonth() !== currentDayDate.getMonth() ||
      shiftDate.getFullYear() !== currentDayDate.getFullYear()
    ) {
      return null;
    }
    
    const startHour = getHours(shift.startTime) + getMinutes(shift.startTime) / 60;
    const endHour = getHours(shift.endTime) + getMinutes(shift.endTime) / 60;
    
    // Calculate position relative to displayed hours
    const top = Math.max(0, (startHour - DAY_START_HOUR) * HOUR_HEIGHT);
    const height = (endHour - startHour) * HOUR_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Get employee by ID
  const getEmployee = (employeeId: string | null) => {
    if (!employeeId) return null;
    return employees.find(e => e.id === employeeId) || null;
  };

  // Handlers for navigation
  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Confirm delete shift
  const confirmDeleteShift = (id: string) => {
    setShiftToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Delete shift
  const handleDeleteConfirm = () => {
    if (shiftToDelete) {
      onDeleteShift(shiftToDelete);
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
      toast.success("Shift deleted successfully");
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevWeek}
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={handleToday}
              className="h-8"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextWeek}
              className="h-8 w-8 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold ml-2">
              {format(weekDays[0] || new Date(), "MMM d")} - {format(weekDays[6] || new Date(), "MMM d, yyyy")}
            </h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[768px]">
            {/* Calendar header */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 text-center text-sm font-medium text-muted-foreground">
                Hours
              </div>
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-2 text-center border-l",
                    isToday(day) && "bg-primary/5 font-medium"
                  )}
                >
                  <div className="text-sm font-medium">{format(day, "EEE")}</div>
                  <div className={cn(
                    "text-sm",
                    isToday(day) ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {format(day, "MMM d")}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="mt-1 h-7 text-xs rounded-full hover:bg-primary/10"
                    onClick={() => onAddShift(day)}
                  >
                    + Add
                  </Button>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-8 relative" ref={containerRef}>
              {/* Hours column */}
              <div className="border-r">
                {hourLabels.map((hour, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted-foreground text-right pr-2 relative"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                  >
                    <span className="absolute -top-3 right-2">
                      {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {weekDays.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className={cn(
                    "border-l relative",
                    isToday(day) && "bg-primary/5"
                  )}
                  style={{ height: `${HOUR_HEIGHT * HOURS_DISPLAYED}px` }}
                >
                  {/* Hour lines */}
                  {hourLabels.map((_, i) => (
                    <div
                      key={i}
                      className="border-t border-border/30 absolute w-full"
                      style={{ top: `${i * HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {/* Shifts */}
                  {shifts.map((shift) => {
                    const style = calculateShiftStyle(shift, dayIndex);
                    const employee = getEmployee(shift.employeeId);
                    
                    // Only render if shift is on this day
                    if (!style) return null;
                    
                    const duration = differenceInHours(shift.endTime, shift.startTime);
                    const showFullDetails = duration >= 1.5;
                    
                    return (
                      <div
                        key={shift.id}
                        className={cn(
                          "absolute w-[95%] left-[2.5%] rounded-md p-2 text-xs shadow-sm border transition-all duration-150 transform",
                          employee ? "cursor-move" : "cursor-pointer",
                          shift.employeeId ? "bg-white dark:bg-accent" : "bg-muted"
                        )}
                        style={{
                          ...style,
                          borderLeftWidth: "4px",
                          borderLeftColor: employee?.color || "#99A1B2",
                        }}
                        onMouseDown={(e) => employee && handleDragStart(e, shift.id, dayIndex)}
                        onTouchStart={(e) => employee && handleDragStart(e, shift.id, dayIndex)}
                        onMouseUp={handleDragEnd}
                        onTouchEnd={handleDragEnd}
                        onClick={() => !employee && onEditShift(shift)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditShift(shift);
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteShift(shift.id);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        {showFullDetails ? (
                          <>
                            <div className="text-muted-foreground mb-1">{shift.position}</div>
                            {employee ? (
                              <div className="flex items-center gap-1 mt-1">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: employee.color }}
                                />
                                <span>{employee.name}</span>
                              </div>
                            ) : (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 text-xs mt-1 w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditShift(shift);
                                      }}
                                    >
                                      <UserCheck className="h-3 w-3 mr-1" />
                                      Assign
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Assign an employee to this shift</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </>
                        ) : (
                          <div className="text-muted-foreground truncate text-[10px]">
                            {employee ? employee.name : shift.position}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
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
    </Card>
  );
}
