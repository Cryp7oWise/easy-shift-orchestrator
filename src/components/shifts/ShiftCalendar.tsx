
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
  differenceInHours,
  startOfMonth,
  endOfMonth,
  getDate,
  isSameMonth,
  isSameDay
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
import { ChevronLeft, ChevronRight, Edit, Trash2, UserCheck, CalendarRange, Move } from "lucide-react";
import { Employee, Shift } from "@/types";
import { EmployeeHoursPanel } from "./EmployeeHoursPanel";

const HOUR_HEIGHT = 80; // pixels per hour
const DAY_START_HOUR = 6; // 6am
const DAY_END_HOUR = 22; // 10pm
const HOURS_DISPLAYED = DAY_END_HOUR - DAY_START_HOUR;

interface ShiftCalendarProps {
  shifts: Shift[];
  employees: Employee[];
  currentDate: Date;
  view: "week" | "month";
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onAddShift: (date: Date) => void;
  onAssignEmployee: (shift: Shift, employeeId: string) => void;
  onMoveShift: (shiftId: string, newDate: Date) => void;
}

type DragInfo = {
  shiftId: string;
  initialStartY: number;
  initialEndY: number;
  elementHeight: number;
  dayIndex: number;
  initialDate: Date;
  isDraggingAcrossDays: boolean;
};

export function ShiftCalendar({
  shifts,
  employees,
  currentDate,
  view,
  onEditShift,
  onDeleteShift,
  onAddShift,
  onAssignEmployee,
  onMoveShift,
}: ShiftCalendarProps) {
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [currentDragOverDay, setCurrentDragOverDay] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Generate days based on view type
  useEffect(() => {
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const daysArray = eachDayOfInterval({ start, end });
      setWeekDays(daysArray);
    } else {
      // Month view
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const daysArray = eachDayOfInterval({ start, end });
      setWeekDays(daysArray);
    }
  }, [currentDate, view]);

  // Get hours for the day
  const hourLabels = Array.from({ length: HOURS_DISPLAYED + 1 }, (_, i) => i + DAY_START_HOUR);

  // Track mouse movement for drag and drop
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragging.isDraggingAcrossDays && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // Find which day column the cursor is over
        const dayWidth = containerRect.width / weekDays.length;
        const relativeX = e.clientX - containerRect.left;
        const dayIndex = Math.floor(relativeX / dayWidth);
        
        if (dayIndex >= 0 && dayIndex < weekDays.length) {
          setCurrentDragOverDay(dayIndex);
        }
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (dragging && dragging.isDraggingAcrossDays) {
        // Handle dropping on a different day
        const shift = shifts.find(s => s.id === dragging.shiftId);
        if (shift && currentDragOverDay !== null && currentDragOverDay !== dragging.dayIndex) {
          const newDate = weekDays[currentDragOverDay];
          onMoveShift(dragging.shiftId, newDate);
        }
      }
      setDragging(null);
      setCurrentDragOverDay(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, weekDays, currentDragOverDay, shifts, onMoveShift]);

  // Handle drag start for both vertical repositioning and day-to-day dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, shiftId: string, dayIndex: number, isDraggingAcrossDays: boolean = false) => {
    if (containerRef.current) {
      const element = e.currentTarget as HTMLDivElement;
      const rect = element.getBoundingClientRect();
      
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) return;
      
      setDragging({
        shiftId,
        initialStartY: rect.top,
        initialEndY: rect.bottom,
        elementHeight: rect.height,
        dayIndex,
        initialDate: new Date(shift.startTime),
        isDraggingAcrossDays
      });
      
      if (isDraggingAcrossDays) {
        setCurrentDragOverDay(dayIndex);
      }
      
      // Prevent default to avoid text selection during drag
      e.preventDefault();
    }
  };

  // Handle drag end for vertical repositioning
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !containerRef.current || dragging.isDraggingAcrossDays) {
      // If dragging across days, this is handled by the mouseup event listener
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

  // Format time in 24h format
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
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

  // Render week view
  const renderWeekView = () => {
    return (
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
                {hour}:00
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
              isToday(day) && "bg-primary/5",
              currentDragOverDay === dayIndex && dragging?.isDraggingAcrossDays && "bg-primary/10"
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
                      {employee && (
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleDragStart(e, shift.id, dayIndex, true);
                          }}
                        >
                          <Move className="h-3 w-3" />
                        </button>
                      )}
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
    );
  };

  // Render month view
  const renderMonthView = () => {
    // Calculate number of weeks to display
    const numWeeks = Math.ceil(weekDays.length / 7);
    
    return (
      <div className="grid grid-cols-7 gap-1" ref={containerRef}>
        {/* Day headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
          <div key={i} className="text-center font-medium p-2 text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {weekDays.map((day, dayIndex) => {
          // Get shifts for this day
          const dayShifts = shifts.filter(shift => {
            const shiftDate = new Date(shift.startTime);
            return isSameDay(shiftDate, day);
          });
          
          // Determine if this day is being dragged over
          const isDragOver = currentDragOverDay === dayIndex && dragging?.isDraggingAcrossDays;
          
          return (
            <div 
              key={dayIndex} 
              className={cn(
                "min-h-[100px] border rounded-md p-1 relative",
                !isSameMonth(day, currentDate) && "bg-muted/50",
                isToday(day) && "bg-primary/5",
                isDragOver && "bg-primary/10 border-primary"
              )}
              onClick={() => onAddShift(day)}
            >
              <div className={cn(
                "text-right text-sm mb-1 p-1",
                isToday(day) && "font-bold text-primary"
              )}>
                {getDate(day)}
              </div>
              
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {dayShifts.slice(0, 3).map((shift) => {
                  const employee = getEmployee(shift.employeeId);
                  
                  return (
                    <div 
                      key={shift.id}
                      className={cn(
                        "text-xs p-1 rounded border-l-2 cursor-pointer flex justify-between items-center",
                        employee ? "bg-white dark:bg-accent" : "bg-muted"
                      )}
                      style={{ borderLeftColor: employee?.color || "#99A1B2" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditShift(shift);
                      }}
                      draggable={!!employee}
                      onDragStart={(e) => {
                        if (employee) {
                          e.dataTransfer.setData("shiftId", shift.id);
                          handleDragStart(e, shift.id, dayIndex, true);
                        }
                      }}
                    >
                      <div className="truncate flex-1">
                        <div className="font-medium truncate">
                          {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                        </div>
                        <div className="truncate">
                          {employee ? employee.name : shift.position}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-1">
                        {employee && (
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, shift.id, dayIndex, true);
                            }}
                          >
                            <Move className="h-3 w-3" />
                          </button>
                        )}
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
                  );
                })}
                
                {dayShifts.length > 3 && (
                  <div 
                    className="text-xs text-center text-muted-foreground p-1 bg-muted/50 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Switch to day view and center on this day
                      if (view === "month") {
                        onEditShift(dayShifts[3]);
                      }
                    }}
                  >
                    +{dayShifts.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Employee Hours Panel - on the left side */}
      <div className="md:w-1/4 w-full">
        <EmployeeHoursPanel employees={employees} shifts={shifts} />
      </div>
      
      {/* Calendar */}
      <Card className="w-full md:w-3/4 shadow-sm">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <div className={view === "week" ? "min-w-[768px]" : ""}>
              {view === "week" ? renderWeekView() : renderMonthView()}
            </div>
          </div>
        </CardContent>
      </Card>
      
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
    </div>
  );
}
