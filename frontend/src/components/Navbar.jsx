import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to get the display name safely
  const getDisplayName = () => {
    if (!user) return "";
    return user.full_name || user.name || user.email || "User";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
          <Briefcase className="w-8 h-8" />
          <span>CampusCareer AI</span>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Home
          </Link>
          <Link to="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition">
            Jobs
          </Link>
          
          {/* AUTHENTICATION SECTION */}
          {user ? (
            <div className="flex items-center gap-4 border-l pl-4 border-gray-200">
              
              {/* User Info Display */}
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {/* DISPLAY NAME HERE */}
                  {getDisplayName()}
                </span>
                
                {/* Role Badge */}
                {user.role && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                    {user.role.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition"
                title="Logout"
              >
                <span className="hidden md:inline">Logout</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
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