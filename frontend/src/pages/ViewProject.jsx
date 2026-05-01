import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";

import {
  ArrowLeftIcon,
  UserGroupIcon,
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

function ViewProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const email = localStorage.getItem("email");
  const name = localStorage.getItem("name");

  // 🔥 Fetch Project
  const fetchProject = async () => {
    try {
      const res = await axios.get(
        `/api/projects/${id}`
      );
      setProject(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fetch Messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `/api/projects/messages/${id}`
      );
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchMessages();

    // 🔥 Auto refresh chat
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // ================= STATE =================
  const isOwner = project?.owner === email;

  const isMember =
    project?.memberEmails?.includes(email) ||
    project?.members?.includes(name);

  const maxMembers = parseInt(project?.teamSize) || 0;
  const currentMembers = project?.memberCount || 0;

  const isFull = maxMembers > 0 && currentMembers >= maxMembers;
  const isOverflow = maxMembers > 0 && currentMembers > maxMembers;

  const [isRequested, setIsRequested] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // ================= JOIN =================
  const handleJoin = async () => {
    if (isMember || isFull || isRequested || isJoining) return;
    setIsJoining(true);

    try {
      const res = await axios.post("/api/projects/join", {
        email,
        projectId: id,
      });

      setIsRequested(true);
      alert(res.data.message || "Request sent successfully!");
      await fetchProject();
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes("already pending")) {
        setIsRequested(true);
        alert("You have already sent a request to join this project.");
      } else {
        alert(err.response?.data?.message || "Failed to send request");
      }
    } finally {
      setIsJoining(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await axios.delete("/api/projects/delete", {
        data: { email, projectId: id },
      });

      navigate("/projects");
    } catch (err) {
      console.log(err);
    }
  };

  //================== LEAVE =================
  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;

    try {
      await axios.post("/api/projects/leave", {
        email,
        projectId: id,
      });

      // 🔥 Update UI instantly
      setProject(prev => ({
        ...prev,
        members: prev.members.filter(m => m !== name),
        memberCount: prev.memberCount - 1
      }));

    } catch (err) {
      console.log(err);
      alert("Failed to leave project");
    }
  };

  // ================= KICK =================
  const handleKick = async (memberName) => {
    if (!window.confirm(`Remove ${memberName}?`)) return;

    try {
      await axios.post("/api/projects/kick", {
        ownerEmail: email,
        memberName,
        projectId: id,
      });

      setProject((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m !== memberName),
        memberCount: prev.memberCount - 1,
      }));
    } catch (err) {
      console.log(err);
      alert("Failed to remove member");
    }
  };

  // ================= CHAT =================
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post("/api/projects/message", {
        email,
        projectId: id,
        text: newMessage,
      });

      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 bg-[#020617] text-white pt-24 pb-20 relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 fade-in">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 shadow-xl"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-indigo-400" />
            <span className="text-sm font-bold uppercase tracking-widest">Back to Explore</span>
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/edit-project/${id}`)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all"
                  title="Edit Project"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  title="Delete Project"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block"></div>

            {!isOwner && (
              isMember ? (
                <button
                  onClick={handleLeave}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                  Exit Team
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={isFull || isRequested || isJoining}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl text-sm font-extrabold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                    isFull 
                      ? 'bg-gray-800 text-gray-500 border border-white/5 cursor-not-allowed' 
                      : (isRequested || isJoining)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isJoining ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : isRequested ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      Request Sent
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="w-5 h-5" />
                      {isFull ? 'Team Full' : 'Request to Join'}
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* MAIN CONTENT CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: PROJECT INFO */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-[100px] group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-[0.2em] font-extrabold text-indigo-400 rounded-lg">
                    {project.skills?.[0] || 'In Progress'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Updated Recently</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight">{project.title}</h1>
                
                <p className="text-gray-400 text-base sm:text-lg mb-10 leading-relaxed font-medium">
                  {project.description}
                </p>

                {/* SKILLS */}
                <div className="flex flex-wrap gap-2.5 mb-12">
                  {project.skills?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs text-gray-300 font-bold hover:border-indigo-500/30 transition-all cursor-default"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* METADATA GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group/card transition-all hover:bg-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Creator
                    </p>
                    <p className="text-sm font-extrabold truncate text-indigo-400">{project.creatorName}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 group/card transition-all hover:bg-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Scale
                    </p>
                    <p className="text-sm font-extrabold">{currentMembers} <span className="text-gray-500 font-medium">/ {maxMembers}</span></p>
                  </div>
                  <div className="col-span-2 bg-white/5 rounded-2xl p-5 border border-white/5 group/card transition-all hover:bg-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Project Health
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isOverflow ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                          style={{ width: maxMembers > 0 ? `${Math.min((currentMembers / maxMembers) * 100, 100)}%` : "0%" }}
                        />
                      </div>
                      <span className="text-xs font-black text-gray-300">{maxMembers > 0 ? Math.round((currentMembers / maxMembers) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* TEAM SECTION */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                    <UserGroupIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Collaborators</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{currentMembers} active members</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.members?.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400 shadow-inner">
                        {member[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate pr-2">{member}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Member</p>
                      </div>
                    </div>

                    {isOwner && member !== name && (
                      <button
                        onClick={() => handleKick(member)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove Member"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: CHAT SECTION */}
          <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-xl">💬</span>
                Live Feed
              </h2>
              {(isOwner || isMember) && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
            </div>

            {isOwner || isMember ? (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col flex-1 min-h-[500px] max-h-[700px] shadow-2xl backdrop-blur-xl relative overflow-hidden group/chat">
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#020617] to-transparent z-10 pointer-events-none opacity-50"></div>
                
                {/* Message List */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 custom-scrollbar relative z-0 pt-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-40">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl">💭</div>
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest">Quiet in here</p>
                        <p className="text-xs mt-1">Start a conversation with the team</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex flex-col ${msg.sender === name ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}
                      >
                        <div className={`max-w-[90%] rounded-2xl p-4 text-sm shadow-xl ${
                          msg.sender === name 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                        }`}>
                          <p className={`text-[10px] font-black mb-1.5 uppercase tracking-widest ${msg.sender === name ? 'text-indigo-200' : 'text-indigo-400'}`}>
                            {msg.sender === name ? 'You' : msg.sender}
                          </p>
                          <p className="leading-relaxed font-medium">{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input Area */}
                <div className="relative z-20">
                  <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 transition-all group/input">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none placeholder:text-gray-600 font-medium"
                      placeholder="Type a message..."
                    />

                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-90"
                    >
                      <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center flex-1 min-h-[500px] text-center space-y-6 backdrop-blur-xl">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 relative">
                  <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full"></div>
                  <span className="text-4xl relative z-10">🔒</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Team Access Only</h3>
                  <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">
                    Join this project to participate in the discussion and collaborate with the team.
                  </p>
                </div>
                <button 
                  onClick={handleJoin}
                  disabled={isFull}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {isFull ? "Team is Full" : "Request Access"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      <AIAssistant />
    </div>
  );
}

export default ViewProject;