import { useContext, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isCompany = user?.role?.toLowerCase() === "company";
  const isActive = (path) => location.pathname.startsWith(path);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      // Focus on mobile menu for accessibility
      if (mobileMenuRef.current) {
        mobileMenuRef.current.focus();
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setProfileOpen(false);
      setMobileOpen(false);
    }
  };

  const navLinks = user
    ? isCompany
      ? [
          { to: "/my-jobs", label: "Dashboard" },
          { to: "/jobs", label: "Jobs" },
        ]
      : [
          { to: "/jobs", label: "Jobs" },
          { to: "/recommendations", label: "AI Picks" },
          { to: "/my-applications", label: "Applications" },
        ]
    : [
        { to: "/", label: "Home" },
        { to: "/jobs", label: "Jobs" },
      ];

  // NavLink component for consistent styling
  const NavLink = ({ to, label, mobile = false, onClick = () => {} }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        ${mobile ? "block px-4 py-3 rounded-lg" : "px-3 py-2 rounded-lg"}
        text-sm font-medium transition-all duration-200
        ${
          isActive(to)
            ? mobile
              ? "bg-blue-50 text-blue-600"
              : "text-blue-600 bg-blue-50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }
      `}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity"
        >
          <span className="p-1.5 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CampusCareer
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} label={link.label} />
          ))}

          {!loading && user && isCompany && (
            <Link
              to="/post-job"
              className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200"
            >
              Post Job
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}

          {/* Profile Dropdown */}
          {!loading && user && (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                onKeyDown={handleKeyDown}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
                  {user.full_name || user.name ? (
                    <span className="text-xs font-semibold">
                      {(user.full_name || user.name).charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.full_name || user.name || user.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
                      {user.role}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/analytics"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Analytics
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </span>
                      <kbd className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                        Esc
                      </kbd>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {!loading && user && isCompany && (
            <Link
              to="/post-job"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-md transition-all"
            >
              Post
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            onKeyDown={handleKeyDown}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 md:hidden z-40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            ref={mobileMenuRef}
            tabIndex={-1}
            className="fixed top-16 left-0 right-0 md:hidden bg-white border-t shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top duration-200"
            onKeyDown={handleKeyDown}
          >
            <div className="p-2 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  mobile
                  onClick={() => setMobileOpen(false)}
                />
              ))}

              {/* User section */}
              {user && (
                <>
                  <div className="pt-4 mt-2 border-t border-gray-200 space-y-1">
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                          {user.full_name || user.name ? (
                            <span className="text-sm font-semibold">
                              {(user.full_name || user.name)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          ) : (
                            <User className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.full_name ||
                              user.name ||
                              user.email ||
                              "User"}
                          </p>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      My Profile
                    </Link>

                    <Link
                      to="/analytics"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      Analytics
                    </Link>

                    {isCompany && (
                      <Link
                        to="/post-job"
                        onClick={() => setMobileOpen(false)}
                        className="block w-full mt-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all text-center"
                      >
                        Post Job
                      </Link>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </span>
                      <kbd className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                        Esc
                      </kbd>
                    </button>
                  </div>
                </>
              )}

              {/* Non-user section */}
              {!user && (
                <div className="pt-4 mt-2 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Close hint for mobile */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Tap outside or press{" "}
                <kbd className="px-1.5 py-0.5 bg-white rounded text-gray-700">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
