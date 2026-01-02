import { Link, useLocation } from "react-router-dom";

const NavLinks = ({ links, mobile = false, onClick }) => {
  const location = useLocation();
  const isActive = (path) => {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return links.map(({ to, label }) => (
    <Link
      key={to}
      to={to}
      onClick={onClick}
      className={`
        ${mobile ? "block px-4 py-3" : "px-3 py-2"}
        rounded-lg text-sm font-medium transition-all
        ${
          isActive(to)
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }
      `}
    >
      {label}
    </Link>
  ));
};

export default NavLinks;
