import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion, Reorder } from "framer-motion";
import AIAssistant from "../components/AIAssistant";

import {
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

function Profile() {
  const { email: paramEmail } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");

  const myEmail = localStorage.getItem("email");
  const targetEmail = paramEmail || myEmail;
  const isOwnProfile = !paramEmail || paramEmail === myEmail;

  useEffect(() => {
    if (!targetEmail) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `/api/profile/${targetEmail}`
        );

        setName(res.data.user.name || "");
        setSkills(res.data.skills || []);
        setInterests(res.data.interests || []);
        setBio(res.data.user.bio || "");
        setOrganization(res.data.user.organization || "");
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, [targetEmail]);

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 bg-[#020617] text-white pt-24 pb-20 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full p-8 sm:p-12 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="relative group mb-6"
              >
                <div className="p-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                  <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-400 relative z-10" />
                </div>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">
                {name || "User Profile"}
              </h1>

              {organization && (
                <p className="text-indigo-400 font-semibold tracking-wider uppercase text-xs">{organization}</p>
              )}

              {bio && (
                <p className="text-gray-400 mt-6 max-w-md leading-relaxed text-sm sm:text-base italic">
                  "{bio}"
                </p>
              )}
            </div>

            <div className="h-px bg-white/5 mb-10 w-full" />

            <div className="space-y-12">
              {/* SKILLS */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Skills & Expertise</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>

                {skills.length === 0 ? (
                  <p className="text-gray-600 text-xs italic text-center py-4 bg-white/[0.02] rounded-2xl">No skills shared yet</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill) => (
                      <div
                        key={skill}
                        className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-default"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INTERESTS */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Areas of Interest</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>

                {interests.length === 0 ? (
                  <p className="text-gray-600 text-xs italic text-center py-4 bg-white/[0.02] rounded-2xl">No interests shared yet</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {interests.map((interest) => (
                      <div
                        key={interest}
                        className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all cursor-default"
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              {isOwnProfile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="flex items-center justify-center gap-3 px-8 py-3.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 px-8 py-3.5 bg-white/5 border border-white/10 text-red-400 text-xs font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <AIAssistant />
    </div>
  );
}

export default Profile;