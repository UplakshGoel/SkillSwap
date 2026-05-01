import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/SkillSwapLogo.png";

import {
  Squares2X2Icon,
  FolderIcon,
  UserCircleIcon,
  BellIcon,
  NewspaperIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkStyle = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${
      location.pathname === path
        ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
        : "text-gray-300 hover:text-white hover:bg-white/5"
    }`;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
    { name: "Projects", path: "/projects", icon: FolderIcon },
    { name: "Feed", path: "/feed", icon: NewspaperIcon },
    { name: "Notifications", path: "/notifications", icon: BellIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* 🔥 LOGO + NAME */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 sm:gap-8 group relative"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative shrink-0">
            <img
              src={logo}
              alt="SkillSwap Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain scale-[2] sm:scale-[2.2] origin-left transition-transform duration-500 group-hover:scale-[1.8]"
            />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
            SkillSwap
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={linkStyle(link.path)}>
              <link.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{link.name}</span>
            </Link>
          ))}

          <div className="h-6 w-px bg-white/10 mx-2"></div>

          {/* PROFILE */}
          <Link
            to="/profile"
            className={`flex items-center gap-2 p-1.5 pr-4 rounded-full transition-all duration-300 ${
              location.pathname === "/profile"
                ? "bg-white/10"
                : "hover:bg-white/10"
            }`}
          >
            <UserCircleIcon className="w-8 h-8 text-indigo-400" />
            <span className="text-sm font-medium text-gray-300">Profile</span>
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white transition-colors"
        >
          {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-[#020617]/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-screen opacity-100 py-6" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-6 gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={linkStyle(link.path)}
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-6 h-6" />
              <span className="text-lg font-medium">{link.name}</span>
            </Link>
          ))}
          <div className="h-px w-full bg-white/10 my-2"></div>
          <Link
            to="/profile"
            className={linkStyle("/profile")}
            onClick={() => setIsOpen(false)}
          >
            <UserCircleIcon className="w-6 h-6" />
            <span className="text-lg font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;