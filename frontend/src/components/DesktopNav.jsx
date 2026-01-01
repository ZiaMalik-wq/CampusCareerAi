import NavLinks from "./NavLinks";
import ProfileMenu from "./ProfileMenu";
import { Link } from "react-router-dom";

const DesktopNav = ({
  user,
  loading,
  isCompany,
  isAdmin,
  navLinks,
  navbar,
  onLogout,
}) => {
  if (loading) return null;

  return (
    <div className="hidden md:flex items-center gap-1">
      <NavLinks links={navLinks} />

      {isCompany && (
        <Link
          to="/post-job"
          className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
        >
          Post Job
        </Link>
      )}

      {!user && (
        <>
          <Link to="/login" className="px-4 py-2 text-sm">
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
          >
            Register
          </Link>
        </>
      )}

      {user && (
        <ProfileMenu
          user={user}
          isAdmin={isAdmin}
          open={navbar.profileOpen}
          setOpen={navbar.setProfileOpen}
          dropdownRef={navbar.dropdownRef}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};

export default DesktopNav;
