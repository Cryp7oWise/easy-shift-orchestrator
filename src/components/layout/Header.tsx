
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { CalendarDays, Users } from "lucide-react";

export function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const routes = [
    {
      name: "Schedule",
      path: "/schedule",
      icon: CalendarDays,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-all duration-300",
        scrolled 
          ? "py-2 glass shadow-sm border-b border-border/50" 
          : "py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-bold tracking-tight transition-all hover:opacity-80"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm">SP</span>
            </div>
            <span className="hidden sm:inline-block">SmartPlan</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 transition-all duration-300">
          {routes.map((route) => {
            const isActive = location.pathname === route.path;
            return (
              <Button
                key={route.path}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 transition-all duration-300",
                  isActive ? "font-medium" : "text-muted-foreground"
                )}
                asChild
              >
                <Link to={route.path}>
                  <route.icon className="h-4 w-4" />
                  {route.name}
                </Link>
              </Button>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
