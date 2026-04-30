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
          `http://localhost:5000/api/profile/${email}`
        );

        setSkills(profileRes.data.skills || []);
        setInterests(profileRes.data.interests || []);

        const projectRes = await axios.get(
          `http://localhost:5000/api/projects/recommend/${email}`
        );

        setProjects(projectRes.data);

        const allRes = await axios.get(
          `http://localhost:5000/api/projects`
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
    <div>
    <motion.div
      className="min-h-screen px-6 md:px-16 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >

      <div className="max-w-7xl mx-auto">
        <br /><br />

        {/* PROFILE BANNER */}
        {isProfileIncomplete && (
          <div className="mb-8 p-5 rounded-xl bg-yellow-500/10 border border-yellow-400/20 flex flex-col md:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-yellow-300 font-semibold">
                  Complete your profile
                </p>
                <p className="text-gray-400 text-sm">
                  Add skills & interests to unlock recommendations
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="btn-primary"
            >
              Go to Profile
            </button>

          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <div className="glass p-5 text-center">
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-gray-400 text-sm">Recommendations</p>
          </div>

          <div className="glass p-5 text-center">
            <p className="text-2xl font-bold">{skills.length}</p>
            <p className="text-gray-400 text-sm">Your Skills</p>
          </div>

          <div className="glass p-5 text-center">
            <p className="text-2xl font-bold">{interests.length}</p>
            <p className="text-gray-400 text-sm">Interests</p>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <SparklesIcon className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-bold">
            Recommended Projects
          </h1>
        </div>

        {/* RECOMMENDED */}
        {projects.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-gray-400 mb-2">
              No recommendations yet
            </p>
            <p className="text-sm text-gray-500">
              Add more skills to improve feed
            </p>
          </div>
        ) : (
          <div className="overflow-hidden py-6 mb-16">
            <div className="carousel">
              {[...projects, ...projects, ...projects, ...projects].map((p, i) => (
                <div
                  key={i}
                  className="min-w-[300px] max-w-[300px] flex-shrink-0 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🚀 EXPLORE MORE */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-6 text-gray-300">
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