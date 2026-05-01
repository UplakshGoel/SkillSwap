import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import Carousel from "../components/Carousel";
import AIAssistant from "../components/AIAssistant";

import {
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);

  const controls = useAnimation(); // 🔥 animation control

  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await axios.get(
          `/api/profile/${email}`
        );

        setSkills(profileRes.data.skills || []);
        setInterests(profileRes.data.interests || []);

        const projectRes = await axios.get(
          `/api/projects/recommend/${email}`
        );

        setProjects(projectRes.data);

        const allRes = await axios.get(
          `/api/projects`
        );

        setAllProjects(allRes.data);

      } catch (err) {
        console.log(err);
      }
    };

    if (email) fetchData();
  }, [email]);

  // 🔥 START ANIMATION
  useEffect(() => {
    controls.start({
      x: ["0%", "-50%"],
      transition: {
        repeat: Infinity,
        duration: 25, // slower = smoother
        ease: "linear",
      },
    });
  }, [controls]);

  const isProfileIncomplete =
    skills.length < 2 || interests.length < 2;

  return (
    <div className="pt-20"> {/* Fixed Navbar Offset */}
    <motion.div
      className="min-h-screen px-4 sm:px-6 md:px-16 py-6 md:py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >

      <div className="max-w-7xl mx-auto">
        
        {/* PROFILE BANNER */}
        {isProfileIncomplete && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-yellow-500/10 border border-yellow-400/20 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <UserCircleIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-300 font-semibold text-sm sm:text-base">
                  Complete your profile
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Add skills & interests to unlock recommendations
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="btn-primary w-full md:w-auto text-sm"
            >
              Go to Profile
            </button>

          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          <div className="glass p-5 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-indigo-400">{projects.length}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Recommendations</p>
          </div>

          <div className="glass p-5 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-purple-400">{skills.length}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Your Skills</p>
          </div>

          <div className="glass p-5 flex flex-col items-center justify-center sm:col-span-2 md:col-span-1">
            <p className="text-3xl font-bold text-pink-400">{interests.length}</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Interests</p>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <SparklesIcon className="w-6 h-6 md:w-7 md:h-7 text-indigo-400" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Recommended Projects
          </h1>
        </div>

        {/* RECOMMENDED */}
        {projects.length === 0 ? (
          <div className="glass p-10 text-center border-dashed">
            <p className="text-gray-400 mb-2 font-medium">
              No recommendations yet
            </p>
            <p className="text-xs text-gray-500">
              Add more skills to your profile to improve your feed
            </p>
          </div>
        ) : (
          <div className="overflow-hidden py-4 md:py-6 mb-12 md:mb-16">
            <div className="carousel">
              {[...projects, ...projects, ...projects, ...projects].map((p, i) => (
                <div
                  key={i}
                  className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🚀 EXPLORE MORE */}
        <div className="mt-8 md:mt-10">
          <h2 className="text-lg md:text-xl font-semibold mb-6 text-gray-300 border-l-4 border-indigo-500 pl-4">
            Explore More Projects
          </h2>

          <div className="overflow-hidden py-4">
            <Carousel allProjects={allProjects} />
          </div>
        </div>

      </div>
    </motion.div>
    <AIAssistant />
    </div>
  );
}

export default Dashboard;