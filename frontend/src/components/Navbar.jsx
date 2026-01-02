import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import { useNavbarState } from "./useNavbarState";

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const navbar = useNavbarState(location);

  const isCompany = user?.role?.toLowerCase() === "company";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const navLinks = user
    ? isAdmin
      ? [{ to: "/admin", label: "Admin Panel" }]
      : isCompany
      ? [
          { to: "/my-jobs", label: "Dashboard" },
          { to: "/jobs", label: "Jobs" },
        ]
      : [
          { to: "/jobs", label: "Jobs" },
          { to: "/recommendations", label: "AI Picks" },
          { to: "/saved-jobs", label: "Saved" },
          { to: "/my-applications", label: "Applications" },
        ]
    : [
        { to: "/", label: "Home" },
        { to: "/jobs", label: "Jobs" },
      ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-16 px-4 flex justify-between items-center">
        <Logo />

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <DesktopNav
            user={user}
            loading={loading}
            isCompany={isCompany}
            isAdmin={isAdmin}
            navLinks={navLinks}
            navbar={navbar}
            onLogout={handleLogout}
          />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 dark:text-gray-300"
            onClick={() => navbar.setMobileOpen(!navbar.mobileOpen)}
          >
            {navbar.mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <MobileNav
        user={user}
        isAdmin={isAdmin}
        isCompany={isCompany}
        navLinks={navLinks}
        open={navbar.mobileOpen}
        setOpen={navbar.setMobileOpen}
        onLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
