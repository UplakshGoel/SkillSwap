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

  // ================= JOIN =================
  const handleJoin = async () => {
    if (isMember || isFull) return;

    try {
      await axios.post("/api/projects/join", {
        email,
        projectId: id,
      });

      await fetchProject();
    } catch (err) {
      console.log(err);
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
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white">

      <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">

        {/* HEADER */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

        {/* DESCRIPTION */}
        <p className="text-gray-300 mb-6">{project.description}</p>

        {/* SKILLS */}
        <div className="flex flex-wrap gap-3 mb-6">
          {project.skills?.map((s, i) => (
            <span
              key={i}
              className="bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-sm"
            >
              {s}
            </span>
          ))}
        </div>

        {/* CREATOR */}
        <p className="text-sm text-gray-400 mb-2">
          Created by{" "}
          <span className="text-indigo-400">{project.creatorName}</span>
        </p>

        {/* MEMBERS */}
        <p className="text-sm text-gray-400 mb-2">
          Members{" "}
          <span className="text-white">
            {currentMembers} / {maxMembers}
          </span>
        </p>

        {/* OVERFLOW WARNING */}
        {isOwner && isOverflow && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-400 text-sm">
            ⚠️ Too many members, kick one out
          </div>
        )}

        {/* PROGRESS */}
        <div className="w-full bg-white/10 rounded-full h-2 mb-6">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{
              width:
                maxMembers > 0
                  ? `${(currentMembers / maxMembers) * 100}%`
                  : "0%",
            }}
          />
        </div>

        {/* ACTIONS */}
        <div className="mb-8">

          {/* 🔹 NOT OWNER & NOT MEMBER → JOIN */}
          {!isOwner && !isMember && (
            <button
              onClick={handleJoin}
              disabled={isFull}
              className={`px-6 py-2 rounded ${
                isFull
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 transition"
              }`}
            >
              {isFull ? "Project Full" : "Join Project"}
            </button>
          )}

          {/* 🔹 MEMBER (NOT OWNER) → LEAVE */}
          {!isOwner && isMember && (
            <button
              onClick={handleLeave}
              className="px-6 py-2 bg-red-500 rounded hover:bg-red-600 transition"
            >
              Leave Project
            </button>
          )}

          {/* 🔹 OWNER → EDIT + DELETE */}
          {isOwner && (
            <div className="flex justify-between mt-4">
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/edit-project/${id}`)}
                  className="flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-2 bg-red-500/20 border border-red-400/30 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete
                </button>
              </div>
                {isOwner && (
                  <button
                    onClick={() => navigate(`/create-post/${id}`)}
                    className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl mb-4 
                              bg-gradient-to-r from-green-500 to-emerald-600 
                              text-white text-sm font-medium shadow-lg
                              hover:shadow-xl transition-all duration-200 
                              hover:scale-[1.03] active:scale-[0.97]"
                  >
                    Share Achievement

                    {/* Glow effect */}
                    <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                )}
            </div>
          )}
        </div>

        {/* TEAM */}
        <h2 className="text-xl mb-4 text-blue-400 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Team Members
        </h2>

        {project.members?.map((m, i) => (
          <div
            key={i}
            className="flex justify-between mb-2 bg-white/5 p-2 rounded"
          >
            <span>{m}</span>

            {isOwner && m !== project.creatorName && (
              <button
                onClick={() => handleKick(m)}
                className="text-red-400 text-sm"
              >
                Kick
              </button>
            )}
          </div>
        ))}

        {/* ================= CHAT ================= */}
        <div className="mt-10">
          <h2 className="text-xl text-purple-400 mb-4">
            Project Chat 💬
          </h2>

          <div className="bg-white/5 p-4 h-60 overflow-y-auto rounded mb-4 flex flex-col gap-2">
            {messages.length === 0 ? (
              <p className="text-gray-400">No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="bg-white/10 p-2 rounded">
                  <span className="text-indigo-400">{msg.sender}</span>
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 rounded bg-white/10"
              placeholder="Type message..."
            />

            <button
              onClick={handleSend}
              className="bg-indigo-500 px-4 rounded"
            >
              Send
            </button>
          </div>
        </div>

      </div>
      <AIAssistant />
    </div>
  );
}

export default ViewProject;