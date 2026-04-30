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
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white">

      <div className="glass w-full max-w-2xl p-8 fade-in">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Edit Profile</h1>

          <button
            onClick={() => navigate("/profile")}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* BIO */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">
            Bio
          </h2>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell something about yourself..."
            rows={3}
            className="w-full p-3 rounded bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* ORGANIZATION */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">
            University / Company
          </h2>

          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Enter your university or company"
            className="w-full p-3 rounded bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* SKILLS */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-indigo-400">
            Skills
          </h2>

          <div className="flex flex-wrap gap-3">
            {skillOptions.map((skill) => {
              const active = selectedSkills.includes(skill);

              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-300 ${
                    active
                      ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/30 scale-105"
                      : "bg-white/5 border-white/20 hover:bg-indigo-500/20"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERESTS */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-purple-400">
            Interests
          </h2>

          <div className="flex flex-wrap gap-3">
            {interestOptions.map((interest) => {
              const active = selectedInterests.includes(interest);

              return (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-300 ${
                    active
                      ? "bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/30 scale-105"
                      : "bg-white/5 border-white/20 hover:bg-purple-500/20"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="btn-primary w-full"
          >
            <CheckIcon className="w-5 h-5" />
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditProfile;