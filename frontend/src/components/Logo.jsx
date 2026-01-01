import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Logo = () => (
  <Link
    to="/"
    className="flex items-center gap-2 font-bold text-lg hover:opacity-90"
  >
    <img src={logo} alt="CampusCareer logo" className="h-8 w-8" />
    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      CampusCareer
    </span>
  </Link>
);

export default Logo;
