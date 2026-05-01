import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  CheckIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const skillOptions = [
  "React", "Node", "MongoDB", "Express", "Python", "AI", "ML", "Java"
];

const interestOptions = [
  "Web Dev", "AI", "Backend", "Frontend", "Data Science", "App Dev"
];

function EditProfile() {
  const navigate = useNavigate();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [bio, setBio] = useState("");
  const [organization, setOrganization] = useState("");

  const email = localStorage.getItem("email");

  // 🔥 FETCH EXISTING DATA
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `/api/profile/${email}`
        );

        setSelectedSkills(res.data.skills || []);
        setSelectedInterests(res.data.interests || []);

        // 🔥 NEW FIELDS
        setBio(res.data.user?.bio || "");
        setOrganization(res.data.user?.organization || "");

      } catch (err) {
        console.log(err);
      }
    };

    if (email) fetchProfile();
  }, [email]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async () => {
    try {
      await axios.put("/api/profile/update", {
        email,
        skills: selectedSkills.join(","),
        interests: selectedInterests.join(","),
        bio,
        organization
      });

      alert("Profile updated!");
      navigate("/profile");
    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white pt-24">

      <div className="glass w-full max-w-2xl p-6 sm:p-10 fade-in shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Edit Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Personalize your digital presence</p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="btn-secondary w-full sm:w-auto justify-center py-2 px-4 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* BIO */}
        <div className="space-y-2 mb-8 relative z-10">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell something about yourself..."
            rows={3}
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all resize-none"
          />
        </div>

        {/* ORGANIZATION */}
        <div className="space-y-2 mb-10 relative z-10">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
            University / Company
          </label>

          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Enter your university or company"
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* SKILLS */}
        <div className="mb-10 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 ml-1">
            Skills
          </h2>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {skillOptions.map((skill) => {
              const active = selectedSkills.includes(skill);

              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm border transition-all duration-300 ${
                    active
                      ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-105"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERESTS */}
        <div className="mb-10 relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 ml-1">
            Interests
          </h2>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {interestOptions.map((interest) => {
              const active = selectedInterests.includes(interest);

              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm border transition-all duration-300 ${
                    active
                      ? "bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="relative z-10 pt-4">
          <button
            onClick={handleSave}
            className="btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-600/20"
          >
            <CheckIcon className="w-6 h-6" />
            Update Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;