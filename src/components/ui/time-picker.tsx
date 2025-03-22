
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({ value, onChange, className, placeholder = "00:00" }: TimePickerProps) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Initialize hours and minutes from value
  useEffect(() => {
    if (value) {
      const [hourStr, minuteStr] = value.split(":");
      setHours(parseInt(hourStr, 10) || 0);
      setMinutes(parseInt(minuteStr, 10) || 0);
    }
  }, [value]);

  const updateValue = (h: number, m: number) => {
    const formattedHours = h.toString().padStart(2, "0");
    const formattedMinutes = m.toString().padStart(2, "0");
    onChange(`${formattedHours}:${formattedMinutes}`);
  };

  const handleHourChange = (increment: number) => {
    const newHours = (hours + increment + 24) % 24;
    setHours(newHours);
    updateValue(newHours, minutes);
  };

  const handleMinuteChange = (increment: number) => {
    const newMinutes = (minutes + increment + 60) % 60;
    setMinutes(newMinutes);
    updateValue(hours, newMinutes);
  };

  const commonTimeOptions = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", 
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  return (
    <div className="relative">
      <div 
        className={cn(
          "flex items-center relative",
          className
        )}
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          onClick={() => setIsPanelOpen(true)}
          onBlur={() => setTimeout(() => setIsPanelOpen(false), 200)}
        />
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {isPanelOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-popover border border-input rounded-md shadow-md w-[280px] p-3 animate-in fade-in-80 zoom-in-95">
          <div className="flex justify-center items-center gap-4 my-3">
            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleHourChange(1)}
              >
                ▲
              </Button>
              <div className="w-14 h-14 flex items-center justify-center text-xl font-medium bg-muted rounded-md">
                {hours.toString().padStart(2, "0")}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleHourChange(-1)}
              >
                ▼
              </Button>
            </div>

            <div className="text-xl">:</div>

            <div className="flex flex-col items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleMinuteChange(5)}
              >
                ▲
              </Button>
              <div className="w-14 h-14 flex items-center justify-center text-xl font-medium bg-muted rounded-md">
                {minutes.toString().padStart(2, "0")}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-primary hover:text-primary-foreground"
                onClick={() => handleMinuteChange(-5)}
              >
                ▼
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 mt-3">
            {commonTimeOptions.map((time) => (
              <Button
                key={time}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
                  value === time && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onChange(time);
                  const [h, m] = time.split(":").map(Number);
                  setHours(h);
                  setMinutes(m);
                }}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
