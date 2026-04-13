import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/SkillSwapLogo.png";


import {
  ArrowRightIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white animated-gradient px-6">

      {/* LOGO */}
      <motion.img
        src={logo}
        alt="SkillSwap Logo"
        className="w-80 md:w-96 mb-6 drop-shadow-xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* HERO TEXT */}
      <motion.div
        className="text-center mb-8 max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
          Build Projects.
          <br />
          <span className="text-violet-500">Find Your Team.</span>
        </h1>

        <p className="text-gray-300 text-lg">
          Connect with developers, collaborate on ideas, and grow your skills
          together.
        </p>
      </motion.div>

      {/* CTA CARD */}
      <motion.div
        className="glass p-10 rounded-2xl text-center w-full max-w-md"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
      >

        <h2 className="text-2xl font-semibold mb-6">
          Get Started
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          {/* LOGIN */}
          <Link
            to="/login"
            className="btn-primary w-full flex justify-center"
          >
            Login
            <ArrowRightIcon className="w-4 h-4" />
          </Link>

          {/* REGISTER */}
          <Link
            to="/register"
            className="btn-secondary w-full flex justify-center"
          >
            <UserPlusIcon className="w-4 h-4" />
            Register
          </Link>

        </div>

      </motion.div>

      {/* FOOTER NOTE */}
      <motion.p
        className="mt-8 text-sm text-gray-400 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🚀 Start building real projects with real people
      </motion.p>

    </div>
  );
}

export default Home;