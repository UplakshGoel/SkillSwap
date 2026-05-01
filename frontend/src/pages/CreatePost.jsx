import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function CreatePost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [content, setContent] = useState("");

  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `/api/projects/${id}`
        );
        setProject(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProject();
  }, [id]);

  const handlePost = async () => {
    if (!content.trim()) {
      alert("Write something about your project");
      return;
    }

    try {
      await axios.post("/api/projects/post", {
        email,
        projectId: id,
        content
      });

      navigate("/feed");

    } catch (err) {
      console.log(err);
      alert("Failed to post");
    }
  };

  if (!project) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white px-4 sm:px-6 py-10 pt-24">

      <div className="max-w-3xl mx-auto fade-in">
        
        {/* HEADER */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Share Your Project</h1>
          <p className="text-gray-400 mt-2">Let the community see what you've built</p>
        </div>

        <div className="glass p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>

          {/* PROJECT INFO SECTION */}
          <div className="mb-8 relative z-10 border-b border-white/5 pb-8">
            <h2 className="text-2xl font-bold mb-3 text-indigo-400">
              {project.title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {/* SKILLS */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Built With</p>
                <div className="flex flex-wrap gap-2">
                  {project.skills?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-3 py-1 text-xs rounded-lg"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* MEMBERS */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Collaborators</p>
                <div className="flex flex-wrap gap-2">
                  {project.members?.map((m, i) => (
                    <span
                      key={i}
                      className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1 text-xs rounded-lg"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* USER INPUT */}
          <div className="relative z-10 space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
              Your Story / Achievement
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="What did you build? What was the biggest challenge? What are you proud of?"
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="relative z-10 pt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handlePost}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-indigo-600/20 order-1"
            >
              Post to Feed 🚀
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary w-full py-4 justify-center text-lg order-2"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreatePost;