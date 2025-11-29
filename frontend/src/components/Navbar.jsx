import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, User, LogOut, PlusCircle } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to get the display name safely
  const getDisplayName = () => {
    if (!user) return "";
    // Checks various possible properties where the name might be stored
    return user.full_name || user.name || user.email || "User";
  };

  // Helper to check role safely (case insensitive)
  const isCompany = () => {
    return user?.role === "company" || user?.role === "COMPANY";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
        >
          <Briefcase className="w-8 h-8" />
          <span>CampusCareer AI</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className="text-gray-600 hover:text-blue-600 font-medium transition"
          >
            Jobs
          </Link>

          {/* AUTHENTICATION SECTION */}
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
              {/* POST JOB BUTTON (Only for Companies) */}
              {isCompany() && (
                <>
                  {/* Dashboard Link - NEW */}
                  <Link
                    to="/my-jobs"
                    className="text-gray-600 hover:text-blue-600 font-medium transition mr-2"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/post-job"
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Post Job</span>
                  </Link>
                </>
              )}

              {/* User Info Display */}
              <Link
                to="/profile"
                className="flex flex-col items-end hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {/* Display Name */}
                    {getDisplayName()}
                  </span>

                  {/* Role Badge */}
                  {user.role && (
                    <span className="text-[10px] uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold mt-0.5">
                      {user.role}
                    </span>
                  )}
                </div>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition ml-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
