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
        "http://localhost:5000/api/ai/generate-description",
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
      await axios.post("http://localhost:5000/api/projects/create", {
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
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white">

      <div className="glass w-full max-w-2xl p-8 fade-in">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Create Project</h1>

          <button
            onClick={() => navigate("/projects")}
            className="btn-secondary"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* TITLE */}
          <div>
            <label className="text-sm text-gray-400">Project Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-400">Description</label>

            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none overflow-hidden transition-all duration-200"
            />

            <button
              type="button"
              onClick={handleGenerateDescription}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded mt-3"
            >
              ✨ Generate Description with AI
            </button>
          </div>

          {/* TEAM SIZE */}
          <div>
            <label className="text-sm text-gray-400">Team Size</label>

            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="Enter team size"
              className="w-full mt-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Required Skills
            </label>

            <div className="flex flex-wrap gap-3">
              {skillOptions.map((skill) => {
                const active = selectedSkills.includes(skill);

                return (
                  <button
                    type="button"
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

          {/* ACTION */}
          <button
            type="submit"
            className="btn-primary w-full mt-4"
          >
            <PlusIcon className="w-5 h-5" />
            Create Project
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateProject;