import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import JobDetails from "./pages/JobDetails";
import UserLogin from "./pages/auth/UserLogin";
import RecruteurLogin from "./pages/auth/RecruteurLogin";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ViewedJobs from "./pages/dashboard/ViewedJobs";
import SavedJobs from "./pages/dashboard/SavedJobs";
import ApplicationTracker from "./pages/dashboard/ApplicationTracker";
import DashboardLayout from "./pages/recruiter/DashboardLayout";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home /> } />
        <Route path="/user-login" element={<UserLogin /> } />
        <Route path="/recruiter-login" element={<RecruteurLogin /> } />
        <Route path="/job/:id" element={<JobDetails /> } />
        <Route path="/apply-job/:id" element={<ApplyJob /> } />

        <Route path="/dashboard" element={<Dashboard /> } />
        <Route path="/dashboard/viewed-jobs" element={<ViewedJobs /> } />
        <Route path="/dashboard/saved-jobs" element={<SavedJobs /> } />
        <Route path="/dashboard/application-tracker" element={<ApplicationTracker /> } />
        <Route path="/profile" element={<Profile /> } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />

        
        {/* Recruiter Routes */}
        <Route path="/recruiter/dashboard" element={<DashboardLayout /> } />
        <Route path="/recruiter/profile" element={<RecruiterProfile /> } />
        <Route path="/recruiter/post-job" element={<DashboardLayout /> } />
      </Routes>
    </div>
  );
}

export default App;
