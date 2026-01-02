import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
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
    <nav className="sticky top-0 bg-white border-b z-50">
      <div className="max-w-7xl mx-auto h-16 px-4 flex justify-between items-center">
        <Logo />

        <DesktopNav
          user={user}
          loading={loading}
          isCompany={isCompany}
          isAdmin={isAdmin}
          navLinks={navLinks}
          navbar={navbar}
          onLogout={handleLogout}
        />

        <button
          className="md:hidden p-2"
          onClick={() => navbar.setMobileOpen(!navbar.mobileOpen)}
        >
          {navbar.mobileOpen ? <X /> : <Menu />}
        </button>
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
