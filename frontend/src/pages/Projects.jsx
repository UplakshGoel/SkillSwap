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
          `http://localhost:5000/api/projects/my/${email}`
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
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white px-6 md:px-16 py-10">
      <motion.div
        className="max-w-7xl mx-auto pt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">
            My Projects
          </h1>
        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-12">

            {/* CREATED PROJECTS */}
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-green-400">
                  <FolderIcon className="w-6 h-6" />
                  Created Projects
                </h2>
              </div>

              {created.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-gray-400">
                    No projects created yet. Create one now!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
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
            </div>

            {/* JOINED PROJECTS */}
            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-blue-400">
                  <UserGroupIcon className="w-6 h-6" />
                  Joined Projects
                </h2>
              </div>

              {joined.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                  <p className="text-gray-400">
                    No projects joined yet. Browse recommendations!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
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
            </div>

          </div>

          {/* 🔥 RIGHT SIDEBAR */}
          <div className="space-y-6">

            {/* CREATE PROJECT */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-4">
                Start Something New
              </h3>

              <button
                onClick={() => navigate("/create-project")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 rounded-lg hover:scale-105 transition"
              >
                <PlusIcon className="w-5 h-5" />
                Create Project
              </button>
            </div>

            {/* EXPLORE */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-3">
                Discover Projects
              </h3>

              <p className="text-sm text-gray-400 mb-4">
                Find projects based on your skills
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 rounded-lg hover:scale-105 transition"
              >
                Explore Recommendations
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* STATS */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 text-center">
              <p className="text-2xl font-bold">{created.length}</p>
              <p className="text-gray-400 text-sm">Created</p>

              <div className="my-4 border-t border-white/10"></div>

              <p className="text-2xl font-bold">{joined.length}</p>
              <p className="text-gray-400 text-sm">Joined</p>
            </div>

          </div>
                
        </div>
      </motion.div>
      <AIAssistant />
    </div>
  );
}

export default Projects;