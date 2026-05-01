import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const skillOptions = [
  "React", "Node", "MongoDB", "Express", "Python", "AI", "ML"
];

function CreateProject() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [teamSize, setTeamSize] = useState("");

  const textareaRef = useRef(null);

  const email = localStorage.getItem("email");

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // 🔥 AUTO RESIZE (works for typing + AI)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [description]);

  const handleGenerateDescription = async () => {
    if (!title) {
      alert("Enter title first");
      return;
    }

    try {
      const res = await axios.post(
        "/api/ai/generate-description",
        {
          title,
          skills: selectedSkills.join(", "),
        }
      );

      setDescription(res.data.description); // ✅ useEffect handles resize

    } catch (err) {
      console.log(err);
      alert("AI failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !teamSize) {
      alert("Please fill all fields including team size");
      return;
    }

    try {
      await axios.post("/api/projects/create", {
        email,
        title,
        description,
        skills: selectedSkills.join(","),
        teamSize
      });

      navigate("/projects");

    } catch (err) {
      console.log(err);
      alert("Failed to create project");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white pt-24 pb-20">

      <div className="glass w-full max-w-2xl p-6 sm:p-10 fade-in shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Launch Project</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Turn your idea into a collaborative reality</p>
          </div>

          <button
            onClick={() => navigate("/projects")}
            className="group btn-secondary py-2 px-4 flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10 relative z-10">

          {/* TITLE */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/80 flex items-center gap-2 ml-1">
              <span className="w-4 h-px bg-indigo-500/40"></span>
              Project Name
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Portfolio Builder"
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-lg font-semibold"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/80 flex items-center gap-2">
                <span className="w-4 h-px bg-purple-500/40"></span>
                Mission & Vision
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:bg-purple-500/20 transition-all active:scale-95"
              >
                <span>✨</span>
                <span>AI Generate</span>
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project goals, stack, and mission..."
              rows={4}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 resize-none overflow-hidden transition-all leading-relaxed"
            />
          </div>

          {/* TEAM SIZE */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/80 flex items-center gap-2 ml-1">
              <span className="w-4 h-px bg-blue-500/40"></span>
              Team Scale
            </label>

            <div className="relative group">
              <input
                type="number"
                min="1"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="Target member count"
                className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-semibold"
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="space-y-6">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80 flex items-center gap-2 ml-1">
              <span className="w-4 h-px bg-emerald-500/40"></span>
              Desired Expertise
            </label>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {skillOptions.map((skill) => {
                const active = selectedSkills.includes(skill);

                return (
                  <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                      active
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-xl shadow-indigo-600/30 scale-105"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTION */}
          <div className="pt-6">
            <button
              type="submit"
              className="btn-primary w-full py-5 text-xl font-bold shadow-2xl shadow-indigo-600/30 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <PlusIcon className="w-7 h-7 mr-2" />
              Initialize Project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default CreateProject;