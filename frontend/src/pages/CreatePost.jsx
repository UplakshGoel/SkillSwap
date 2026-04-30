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
          `http://localhost:5000/api/projects/${id}`
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
      await axios.post("http://localhost:5000/api/projects/post", {
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
    <div className="min-h-screen p-10 text-white">
      <br></br><br></br>

      <h1 className="text-3xl mb-6">Share Your Project </h1>

      <div className="bg-white/10 p-6 rounded-lg">

        {/* PROJECT TITLE */}
        <h2 className="text-xl font-semibold mb-2">
          {project.title}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-300 mb-4">
          {project.description}
        </p>

        {/* SKILLS */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Skills:</p>
          <div className="flex flex-wrap gap-2">
            {project.skills?.map((s, i) => (
              <span
                key={i}
                className="bg-indigo-500 px-2 py-1 text-sm rounded"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* MEMBERS */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Team:</p>
          <div className="flex flex-wrap gap-2">
            {project.members?.map((m, i) => (
              <span
                key={i}
                className="bg-gray-700 px-2 py-1 text-sm rounded"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* USER INPUT */}
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-2">
            Tell your story / achievement:
          </p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="What did you build? What did you learn?"
            className="w-full p-3 bg-white/10 rounded border border-white/20 outline-none"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handlePost}
          className="mt-6 bg-indigo-500 px-4 py-2 rounded"
        >
          Share 🚀
        </button>

      </div>
    </div>
  );
}

export default CreatePost;