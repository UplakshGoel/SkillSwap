import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "../components/ProjectCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AIAssistant from "../components/AIAssistant";

// Heroicons
import {
  PlusIcon,
  ArrowRightIcon,
  FolderIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

function Projects() {
  const [created, setCreated] = useState([]);
  const [joined, setJoined] = useState([]);

  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `/api/projects/my/${email}`
        );

        setCreated(res.data.createdProjects || []);
        setJoined(res.data.joinedProjects || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProjects();
  }, [email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white px-4 sm:px-6 md:px-16 pt-24 pb-10">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            My Projects
          </h1>
          <button
            onClick={() => navigate("/create-project")}
            className="sm:hidden w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <PlusIcon className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* LEFT SIDE - PROJECT LISTS */}
          <div className="lg:col-span-2 space-y-12">

            {/* CREATED PROJECTS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-green-400">
                  <div className="p-2 bg-green-400/10 rounded-lg">
                    <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  Created Projects
                </h2>
              </div>

              {created.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed backdrop-blur-md">
                  <p className="text-gray-400 text-sm sm:text-base">
                    No projects created yet.
                  </p>
                  <button 
                    onClick={() => navigate("/create-project")}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
                  >
                    Start your first project →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {created.map((p, i) => (
                    <div
                      key={i}
                      className="transition transform hover:-translate-y-2 hover:scale-[1.02] duration-300"
                    >
                      <ProjectCard project={p} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* JOINED PROJECTS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-blue-400">
                  <div className="p-2 bg-blue-400/10 rounded-lg">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  Joined Projects
                </h2>
              </div>

              {joined.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed backdrop-blur-md">
                  <p className="text-gray-400 text-sm sm:text-base">
                    No projects joined yet.
                  </p>
                  <button 
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
                  >
                    Browse recommendations →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {joined.map((p, i) => (
                    <div
                      key={i}
                      className="transition transform hover:-translate-y-2 hover:scale-[1.02] duration-300"
                    >
                      <ProjectCard project={p} />
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* 🔥 RIGHT SIDEBAR - CONTROLS & STATS */}
          <div className="space-y-6">

            {/* CREATE PROJECT (Desktop Only) */}
            <div className="hidden sm:block glass p-6 text-center border-indigo-500/20">
              <h3 className="text-lg font-semibold mb-4">
                Start Something New
              </h3>

              <button
                onClick={() => navigate("/create-project")}
                className="btn-primary w-full py-3"
              >
                <PlusIcon className="w-5 h-5" />
                Create Project
              </button>
            </div>

            {/* EXPLORE */}
            <div className="glass p-6 text-center border-purple-500/20">
              <h3 className="text-lg font-semibold mb-2">
                Discover Projects
              </h3>

              <p className="text-sm text-gray-400 mb-6">
                Find projects based on your unique skills and interests
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary w-full py-3 justify-center"
              >
                Explore More
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* STATS CARD */}
            <div className="glass p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Overview</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{created.length}</p>
                    <p className="text-xs text-gray-400">Created by you</p>
                  </div>
                  <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
                    <FolderIcon className="w-5 h-5 text-green-400" />
                  </div>
                </div>

                <div className="h-px w-full bg-white/5"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{joined.length}</p>
                    <p className="text-xs text-gray-400">Collaborating in</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center">
                    <UserGroupIcon className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

          </div>
                
        </div>
      </motion.div>
      <AIAssistant />
    </div>
  );
}

export default Projects;