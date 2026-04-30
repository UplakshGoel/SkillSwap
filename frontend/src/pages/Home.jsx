import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/SkillSwapLogo.png";


import {
  ArrowRightIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white bg-[#020617] overflow-hidden px-6">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto">

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
        className="text-center mb-12 w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
          Build Projects.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Find Your Team.
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Connect with top developers worldwide, collaborate on groundbreaking ideas, and elevate your skills in a community driven by innovation.
        </p>
      </motion.div>

      {/* CTA CARD */}
      <motion.div
        className="relative group w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass p-10 rounded-3xl text-center shadow-2xl border border-white/10 bg-[#020617]/80 backdrop-blur-2xl">
          <h2 className="text-3xl font-semibold mb-8 text-white">
            Get Started
          </h2>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            {/* LOGIN */}
            <Link
              to="/login"
              className="btn-primary w-full flex justify-center py-3 text-base shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]"
            >
              Login
              <ArrowRightIcon className="w-5 h-5 ml-1" />
            </Link>

            {/* REGISTER */}
            <Link
              to="/register"
              className="btn-secondary w-full flex justify-center py-3 text-base hover:bg-white/10 hover:border-white/30"
            >
              <UserPlusIcon className="w-5 h-5 mr-1" />
              Register
            </Link>
          </div>
        </div>
      </motion.div>

      {/* FOOTER NOTE */}
      <motion.p
        className="mt-12 text-sm text-gray-500 text-center font-medium tracking-wide uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="inline-block mr-2 text-indigo-400">🚀</span>
        Start building real projects with real people
      </motion.p>
      
      </div>
    </div>
  );
}

export default Home;