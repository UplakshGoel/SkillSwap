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
        "/api/projects/feed"
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
      await axios.post("/api/projects/like", {
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
      await axios.post("/api/projects/comment", {
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
    <div className="min-h-screen px-4 sm:px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white relative overflow-hidden pt-24">

      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />

      <div className="max-w-3xl mx-auto">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
           <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Community Feed</h1>
           <p className="text-gray-400 text-sm sm:text-base">Stay updated with latest project milestones</p>
        </motion.div>

        {/* 🔍 FILTER BAR */}
        <div className="mb-10 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by skill (e.g. React, AI...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/10 transition-all duration-300"
            />
          </div>

          {/* Selected skill tag */}
          {selectedSkill && (
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Filtered by</span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300">
                {selectedSkill}
                <button
                  onClick={() => setSelectedSkill("")}
                  className="hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl border-dashed">
            <p className="text-gray-400">No matching posts found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">

            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.id || i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl hover:bg-white/[0.07] transition-all duration-300"
              >

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                    {post.user?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {post.user}
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-tighter">Contributor</p>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-indigo-300 transition">
                  {post.title}
                </h2>

                <p className="text-gray-400 text-sm sm:text-base mb-6 leading-relaxed">
                  {post.description}
                </p>

                {/* SKILLS */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.skills?.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSkill(s)}
                      className={`px-3 py-1 text-[11px] font-medium rounded-lg transition-all duration-300
                        ${
                          selectedSkill === s
                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      #{s}
                    </button>
                  ))}
                </div>

                {post.content && (
                  <div className="text-gray-300 text-sm mb-6 p-4 bg-white/5 rounded-xl border border-white/5 italic">
                    "{post.content}"
                  </div>
                )}

                {/* LIKE & INTERACTIONS */}
                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-all duration-300 active:scale-90"
                  >
                    <span>❤️</span>
                    <span className="font-semibold">{post.likes?.low ?? post.likes ?? 0}</span>
                  </button>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments?.length || 0} Comments</span>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                <div className="space-y-4">
                  {post.comments && post.comments.length > 0 && (
                    <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {post.comments.map((c, idx) => (
                        <div
                          key={idx}
                          className="text-sm bg-white/5 px-4 py-3 rounded-2xl border border-white/5"
                        >
                          <span className="text-indigo-400 font-semibold mr-2">
                            {c.user}
                          </span>
                          <span className="text-gray-300">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))
                      }
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />

                    <button
                      onClick={() => handleComment(post.id)}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!commentInputs[post.id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>

              </motion.article>
            ))}

          </div>
        )}

      </div>

      <AIAssistant />
    </div>
  );
}

export default Feed;