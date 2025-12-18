import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateJob from "./pages/CreateJob";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import MyJobs from "./pages/Myjobs";
import EditJob from "./pages/EditJob";
import Profile from "./pages/Profile";
import RecommendedJobs from "./pages/RecommendedJobs";
import MyApplications from "./pages/MyApplications";
import JobApplicants from "./pages/JobApplicants";
import InterviewPrep from "./pages/InterviewPrep";
import AnalyticsPage from "./pages/AnalyticsPage";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/post-job" element={<CreateJob />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/jobs/:id/edit" element={<EditJob />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recommendations" element={<RecommendedJobs />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/jobs/:id/applicants" element={<JobApplicants />} />
            <Route
              path="/jobs/:id/interview-prep"
              element={<InterviewPrep />}
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>

          {/* Vercel Analytics */}
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
