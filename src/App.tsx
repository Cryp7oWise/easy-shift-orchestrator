
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";
import WeeklyView from "./pages/WeeklyView";
import WeeklyTableView from "./pages/WeeklyTableView";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/weekly-view" element={<WeeklyView />} />
            <Route path="/weekly-table" element={<WeeklyTableView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
