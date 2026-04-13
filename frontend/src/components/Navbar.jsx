import { Link, useLocation } from "react-router-dom";
import logo from "../assets/SkillSwapLogo.png";

import {
  Squares2X2Icon,
  FolderIcon,
  UserCircleIcon,
  BellIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";


function Navbar() {
  const location = useLocation();

  const linkStyle = (path) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
      location.pathname === path
        ? "bg-white/10 text-white"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* 🔥 LOGO + NAME */}
        <Link
          to="/dashboard"
          className="flex items-center gap-10 group"
        >
          <img
            src={logo}
            alt="SkillSwap Logo"
            className="w-8 h-8 object-contain scale-[2.5] origin-left transition-transform duration-300 group-hover:scale-[2]"
          />
          <span className="text-lg font-semibold tracking-tight group-hover:text-indigo-400 transition">
            SkillSwap
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-4">

          <Link to="/dashboard" className={linkStyle("/dashboard")}>
            <Squares2X2Icon className="w-5 h-5" />
            Dashboard
          </Link>

          <Link to="/projects" className={linkStyle("/projects")}>
            <FolderIcon className="w-5 h-5" />
            Projects
          </Link>

          <Link to="/feed" className={linkStyle("/feed")}>
            <NewspaperIcon className="w-5 h-5" />
            Feed
          </Link>

          <Link to="/notifications" className={linkStyle("/notifications")}>
            <BellIcon className="w-5 h-5" />
            Notifications
          </Link>

          {/* PROFILE */}
          <Link
            to="/profile"
            className={`p-1.5 rounded-full transition-all duration-300 ${
              location.pathname === "/profile"
                ? "bg-white/10"
                : "hover:bg-white/10"
            }`}
          >
            <UserCircleIcon className="w-7 h-7 text-gray-300 hover:text-white transition" />
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;