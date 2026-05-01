import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import {
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const skillOptions = [
  "React", "Node", "MongoDB", "Express", "Python", "AI", "ML"
];

function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [teamSize, setTeamSize] = useState("");

  const textareaRef = useRef(null);

  const email = localStorage.getItem("email");

  // 🔥 FETCH PROJECT
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get("/api/projects");

        const project = res.data.find(p => p.id == id);

        if (project) {
          setTitle(project.title);
          setDescription(project.description);
          setSelectedSkills(project.skills || []);
          setTeamSize(project.teamSize || "");
        }

      } catch (err) {
        console.log(err);
      }
    };

    fetchProject();
  }, [id]);

  // 🔥 AUTO RESIZE (typing + AI)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [description]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // 🔥 AI GENERATE DESCRIPTION
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

      setDescription(res.data.description);

    } catch (err) {
      console.log(err);
      alert("AI failed");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put("/api/projects/update", {
        email,
        projectId: id,
        title,
        description,
        skills: selectedSkills.join(","),
        teamSize: Number(teamSize),
      });

      alert("Updated!");
      navigate("/projects");

    } catch (err) {
      console.log(err);
      alert("Not allowed or error");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-10 pt-24 pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 fade-in">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              <PencilSquareIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Edit Project</h1>
              <p className="text-gray-500 text-sm mt-1 font-medium">Refine your vision and keep your team updated</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate(-1)}
            className="group btn-secondary py-2.5 px-5 flex items-center gap-2"
          >
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Cancel Edits</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
              
              {/* TITLE */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/80 flex items-center gap-2 ml-1">
                  <span className="w-4 h-px bg-indigo-500/40"></span>
                  Project Identity
                </label>
                <div className="relative group">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter project title"
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all text-lg font-semibold"
                  />
                </div>
              </div>

              {/* DESCRIPTION + AI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/80 flex items-center gap-2">
                    <span className="w-4 h-px bg-purple-500/40"></span>
                    Project Mission
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:bg-purple-500/20 transition-all active:scale-95"
                  >
                    <span>✨</span>
                    <span>AI Rewrite</span>
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 resize-none overflow-hidden transition-all leading-relaxed text-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* TEAM SIZE */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/80 flex items-center gap-2 ml-1">
                    <span className="w-4 h-px bg-blue-500/40"></span>
                    Collaboration
                  </label>
                  <div className="relative">
                    <UsersIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="number"
                      min="1"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      placeholder="Members"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                {/* SKILLS TAGS PREVIEW (Simplified) */}
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80 flex items-center gap-2 ml-1">
                    <span className="w-4 h-px bg-emerald-500/40"></span>
                    Primary Stack
                  </label>
                  <div className="flex flex-wrap gap-2 p-1">
                    {selectedSkills.slice(0, 3).map(s => (
                      <span key={s} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] rounded-lg text-emerald-400 font-bold uppercase">{s}</span>
                    ))}
                    {selectedSkills.length > 3 && <span className="text-[10px] text-gray-500 font-bold">+{selectedSkills.length - 3} more</span>}
                  </div>
                </div>
              </div>

              {/* SKILLS SELECTOR */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 block ml-1">
                  Expand Your Stack
                </label>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {skillOptions.map(skill => {
                    const active = selectedSkills.includes(skill);

                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30 scale-105"
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
                  onClick={handleUpdate}
                  className="btn-primary w-full py-5 text-lg font-bold shadow-2xl shadow-indigo-600/20 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <CheckIcon className="w-6 h-6 mr-2" />
                  Synchronize Changes
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 px-2">
              Live Preview
              <span className="flex-1 h-px bg-white/5"></span>
            </h3>
            
            <div className="glass p-8 border-indigo-500/30 shadow-indigo-500/10 flex flex-col h-fit sticky top-32 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl mb-6 flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/40 group-hover:scale-110 transition-transform duration-500">
                {title ? title[0].toUpperCase() : "?"}
              </div>
              
              <h2 className="text-2xl font-bold mb-3 truncate group-hover:text-indigo-400 transition-colors">{title || "Your Project Title"}</h2>
              
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-4 mb-6">
                {description || "Add a description to see how your project mission will appear to collaborators..."}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedSkills.length > 0 ? (
                  selectedSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 text-[10px] rounded-lg text-gray-400 uppercase font-bold tracking-tighter">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-600 italic">No skills selected</span>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Sync</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400">
                   <UsersIcon className="w-4 h-4" />
                   <span className="text-xs font-bold">{teamSize || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-white/5 bg-white/2 backdrop-blur-sm text-center">
              <p className="text-[10px] text-gray-500 font-medium">
                Changes will be reflected immediately across the platform upon saving.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditProject;