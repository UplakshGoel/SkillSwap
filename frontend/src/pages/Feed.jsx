import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AIAssistant from "../components/AIAssistant";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [search, setSearch] = useState("");

  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedSkill, search]);

  const fetchFeed = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/projects/feed"
      );
      setPosts(res.data);
      setFilteredPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filterPosts = () => {
    let updated = [...posts];

    if (selectedSkill) {
      updated = updated.filter(post =>
        post.skills?.includes(selectedSkill)
      );
    }

    if (search.trim()) {
      updated = updated.filter(post =>
        post.skills?.some(skill =>
          skill.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    setFilteredPosts(updated);
  };

  const handleLike = async (postId) => {
    try {
      await axios.post("http://localhost:5000/api/projects/like", {
        email,
        name,
        postId
      });
      fetchFeed();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await axios.post("http://localhost:5000/api/projects/comment", {
        email,
        name,
        postId,
        text
      });

      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));

      fetchFeed();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />

      <div className="max-w-3xl mx-auto">
        <br></br>
        {/* HEADER */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-6 text-center"
        >
           Community Feed
        </motion.h1>

        {/* 🔍 FILTER BAR */}
        <div className="mb-8 flex flex-col gap-4">

          <input
            type="text"
            placeholder="Search by skill (e.g. React, AI...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />

          {/* Selected skill */}
          {selectedSkill && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Filtered by:</span>
              <span className="px-3 py-1 bg-indigo-500/30 rounded-full text-sm">
                {selectedSkill}
              </span>
              <button
                onClick={() => setSelectedSkill("")}
                className="text-red-400 text-sm"
              >
                ✕ Clear
              </button>
            </div>
          )}

        </div>

        {filteredPosts.length === 0 ? (
          <p className="text-gray-400 text-center">
            No matching posts found
          </p>
        ) : (
          <div className="flex flex-col gap-8">

            {filteredPosts.map((post, i) => (
              <motion.div
                key={post.id || i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl hover:bg-white/10 transition"
              >

                <p className="text-indigo-400 text-sm font-semibold mb-2">
                  {post.user}
                </p>

                <h2 className="text-xl font-semibold mb-2">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-sm mb-4">
                  {post.description}
                </p>

                {/* SKILLS (Clickable) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.skills?.map((s, idx) => (
                    <span
                      key={idx}
                      onClick={() => setSelectedSkill(s)}
                      className={`px-3 py-1 text-xs rounded-lg cursor-pointer transition
                        ${
                          selectedSkill === s
                            ? "bg-indigo-500 text-white"
                            : "bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 hover:bg-indigo-500/30"
                        }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="text-gray-200 mb-4">
                  {post.content}
                </div>

                {/* LIKE */}
                <button
                  onClick={() => handleLike(post.id)}
                  className="text-red-400 text-sm mb-4 hover:scale-110 transition"
                >
                  ❤️ {post.likes?.low ?? post.likes ?? 0}
                </button>

                {/* COMMENTS */}
                <div className="border-t border-white/10 pt-4">

                  <div className="flex flex-col gap-2 mb-3">
                    {post.comments?.map((c, idx) => (
                      <div
                        key={idx}
                        className="text-sm bg-white/5 px-3 py-2 rounded"
                      >
                        <span className="text-indigo-400">
                          {c.user}:
                        </span>{" "}
                        {c.text}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                    />

                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-4 bg-indigo-500 rounded-lg"
                    >
                      Post
                    </button>
                  </div>

                </div>

              </motion.div>
            ))}

          </div>
        )}

      </div>

      <AIAssistant />
    </div>
  );
}

export default Feed;