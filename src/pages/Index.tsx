
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Users, Table, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="py-10 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Welcome to SmartPlan
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          A modern employee scheduling system that helps you plan shifts, 
          manage your team, and optimize your scheduling workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5" />
              Schedule Management
            </CardTitle>
            <CardDescription>
              Plan and organize employee shifts using our intuitive calendar interface
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground">
              Create, edit, and assign shifts to employees. Drag and drop shifts to 
              different dates, and use the auto-scheduler to generate optimized schedules.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Open Schedule
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage your team members and their scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground">
              Add team members, set their positions, weekly hour targets, and required 
              rest periods between shifts. Track their scheduled hours and workdays.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to="/employees">
                <Users className="mr-2 h-4 w-4" />
                Manage Employees
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Table className="h-5 w-5" />
              Weekly Views
            </CardTitle>
            <CardDescription>
              Review your schedule in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground">
              Access different views of your schedule including a weekly list view and 
              a table format that displays all shifts by time slot across the week.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 flex-col">
            <Button asChild variant="outline" className="w-full">
              <Link to="/weekly-view">
                <Calendar className="mr-2 h-4 w-4" />
                Weekly List
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link to="/weekly-table">
                <Table className="mr-2 h-4 w-4" />
                Weekly Table
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
