
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Index from "./pages/Index";
import Schedule from "./pages/Schedule";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";
import WeeklyView from "./pages/WeeklyView";
import WeeklyTableView from "./pages/WeeklyTableView";

function App() {
  return (
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
  );
}

export default App;
