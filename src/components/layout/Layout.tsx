
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased">
      <Header />
      <main className={cn("flex-1 pt-24 pb-12 px-4 md:px-6 transition-all duration-300 animate-fade-in")}>
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="py-6 px-4 md:px-6 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SmartPlan. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with precision and care
          </p>
        </div>
      </footer>
    </div>
  );
}
