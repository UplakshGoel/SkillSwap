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
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white px-6 md:px-16 py-10">

      <div className="max-w-3xl mx-auto pt-20 fade-in">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-10">
          <PencilSquareIcon className="w-7 h-7 text-indigo-400" />
          <h1 className="text-3xl font-bold">Edit Project</h1>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 space-y-6 shadow-lg">

          {/* TITLE */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Project Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* DESCRIPTION + AI */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Description
            </label>

            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition resize-none overflow-hidden"
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
            <label className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Team Size
            </label>

            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="Enter team size"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* SKILLS */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">
              Required Skills
            </label>

            <div className="flex flex-wrap gap-3">
              {skillOptions.map(skill => {
                const active = selectedSkills.includes(skill);

                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm border transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent"
                        : "bg-white/10 border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-4">

            <button
              onClick={handleUpdate}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 py-3 rounded-lg hover:scale-[1.02] transition"
            >
              <CheckIcon className="w-5 h-5" />
              Save Changes
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 border border-white/20 py-3 rounded-lg hover:bg-white/20 transition"
            >
              <XMarkIcon className="w-5 h-5" />
              Cancel
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default EditProject;