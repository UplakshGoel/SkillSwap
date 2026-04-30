import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, Reorder } from "framer-motion";
import AIAssistant from "../components/AIAssistant";

import {
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

function Profile() {
  const [name, setName] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `/api/profile/${email}`
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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex justify-center px-6 py-16 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_10px_60px_rgba(0,0,0,0.6)]"
      >

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative group"
          >
            <div className="p-5 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10">
              <UserCircleIcon className="w-16 h-16 text-indigo-300" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-semibold mt-4"
          >
            {name || "Your Name"}
          </motion.h1>

          {organization && (
            <p className="text-sm text-indigo-300 mt-1">{organization}</p>
          )}

          {bio && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 mt-4 max-w-lg"
            >
              {bio}
            </motion.p>
          )}
        </div>

        <div className="h-px bg-white/10 mb-8" />

        <div className="flex flex-col gap-8">

          {/* SKILLS */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500">
              Skills (Drag to reorder)
            </label>

            <Reorder.Group
              axis="x"
              values={skills}
              onReorder={setSkills}
              className="flex flex-wrap gap-3 mt-4"
            >
              {skills.map((skill) => (
                <Reorder.Item
                  key={skill}
                  value={skill}
                  whileDrag={{ scale: 1.15 }}
                  className="px-4 py-2 text-sm rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 cursor-grab active:cursor-grabbing"
                >
                  {skill}
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {skills.length === 0 && (
              <p className="text-gray-500 text-xs italic mt-2">
                No skills added yet
              </p>
            )}
          </div>

          {/* INTERESTS */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500">
              Interests (Drag to reorder)
            </label>

            <Reorder.Group
              axis="x"
              values={interests}
              onReorder={setInterests}
              className="flex flex-wrap gap-3 mt-4"
            >
              {interests.map((interest) => (
                <Reorder.Item
                  key={interest}
                  value={interest}
                  whileDrag={{ scale: 1.15 }}
                  className="px-4 py-2 text-sm rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 cursor-grab active:cursor-grabbing"
                >
                  {interest}
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {interests.length === 0 && (
              <p className="text-gray-500 text-xs italic mt-2">
                No interests added yet
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/edit-profile")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-medium"
            >
              <PencilSquareIcon className="w-5 h-5" />
              Edit Profile
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-400/30 text-red-400 hover:bg-red-500/20"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Logout
            </motion.button>

          </div>
        </div>
      </motion.div>

      <AIAssistant />
    </div>
  );
}

export default Profile;