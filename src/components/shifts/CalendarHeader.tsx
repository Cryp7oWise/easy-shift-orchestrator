
import { format, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  view: "week" | "month";
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: "week" | "month") => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange
}: CalendarHeaderProps) {
  // Format date range based on view type
  const getDateRangeText = () => {
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      // Same month
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
      }
      
      // Different months
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      // Month view
      return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          className="h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          onClick={onToday}
          className="h-8"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold ml-2">
          {getDateRangeText()}
        </h2>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant={view === "week" ? "default" : "outline"} 
          size="sm"
          onClick={() => onViewChange("week")}
          className="h-8"
        >
          Week
        </Button>
        <Button 
          variant={view === "month" ? "default" : "outline"} 
          size="sm"
          onClick={() => onViewChange("month")}
          className="h-8"
        >
          Month
        </Button>
      </div>
    </div>
  );
}
