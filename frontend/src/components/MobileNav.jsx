import NavLinks from "./NavLinks";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useFocusTrap from "./useFocusTrap";
import { useRef } from "react";

const MobileNav = ({
  user,
  isAdmin,
  isCompany,
  navLinks,
  open,
  setOpen,
  onLogout,
}) => {
  const menuRef = useRef(null);
  useFocusTrap(open, menuRef);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 bg-white z-50 shadow-lg"
          >
            <NavLinks links={navLinks} mobile onClick={() => setOpen(false)} />

            {user && !isAdmin && (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-3"
                  onClick={() => setOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/analytics"
                  className="block px-4 py-3"
                  onClick={() => setOpen(false)}
                >
                  Analytics
                </Link>
              </>
            )}

            {isCompany && (
              <Link
                to="/post-job"
                onClick={() => setOpen(false)}
                className="block mx-4 my-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center"
              >
                Post Job
              </Link>
            )}

            {user ? (
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 text-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center"
                >
                  Register
                </Link>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;
