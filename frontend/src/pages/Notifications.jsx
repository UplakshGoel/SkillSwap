import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await axios.get(
      `/api/projects/notifications/${email}`
    );
    setNotifications(res.data);
  };

  const handleRead = async (id) => {
    await axios.post(
      "/api/projects/notifications/read-one",
      { id }
    );

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const handleDelete = async (id) => {
    await axios.post(
      "/api/projects/notifications/delete",
      { id }
    );

    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  const markAllRead = async () => {
    await Promise.all(
      notifications.map((n) =>
        !n.read
          ? axios.post(
              "/api/projects/notifications/read-one",
              { id: n.id }
            )
          : null
      )
    );

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const clearAll = async () => {
    await Promise.all(
      notifications.map((n) =>
        axios.post(
          "/api/projects/notifications/delete",
          { id: n.id }
        )
      )
    );

    setNotifications([]);
  };

  const handleJoinRequestAction = async (notificationId, action, requesterEmail, projectId) => {
    try {
      await axios.post("/api/projects/join-request/handle", {
        action,
        notificationId,
        requesterEmail,
        projectId,
        ownerEmail: email
      });

      // Remove from UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      alert(`Request ${action === "approve" ? "approved" : "rejected"}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to process request");
    }
  };

  const handleNotificationClick = (n) => {
    // If it's a join request, the user likely wants to use the buttons
    // But clicking the card could take them to the project anyway
    if (n.projectId && n.projectId !== -1) {
      navigate(`/project/${n.projectId}`);
    }
    
    if (!n.read) handleRead(n.id);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 bg-[#020617] text-white pt-24 pb-20 relative overflow-hidden">

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Notifications</h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Stay updated with your latest community activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              Mark Read
            </button>

            <button
              onClick={clearAll}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-300"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-12 sm:p-20 text-center rounded-3xl border-dashed"
            >
              <div className="text-5xl mb-4">🎉</div>
              <p className="text-xl font-bold mb-2">All caught up!</p>
              <p className="text-gray-500 text-sm">
                No new notifications at the moment
              </p>
            </motion.div>
          ) : (
            notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleNotificationClick(n)}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-4 cursor-pointer ${
                  n.read
                    ? "bg-white/[0.02] border-white/5 opacity-60"
                    : "bg-white/5 border-white/10 hover:bg-white/[0.08] shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  {!n.read && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                  )}

                  {/* ICON/AVATAR placeholder */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${n.read ? 'bg-white/5 text-gray-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    {n.type === "join_request" ? "🤝" : 
                     n.type === "approval" ? "🎉" :
                     n.type === "rejection" ? "❌" :
                     (n.read ? '🔔' : '✨')}
                  </div>

                  {/* TEXT */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm sm:text-base leading-relaxed ${n.read ? 'text-gray-400' : 'text-gray-100 font-medium'}`}>
                      {n.text}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${n.read ? 'text-gray-600' : 'text-indigo-400'}`}>
                        {n.type === "join_request" ? "Join Request" : (n.read ? "Seen" : "New Notification")}
                      </span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full" />
                      <span className="text-[10px] text-gray-500">
                        {new Date(n.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? 'Today' : new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* DEFAULT ACTIONS */}
                  <div className="flex items-center gap-2">
                    {!n.read && n.type !== "join_request" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRead(n.id); }}
                        className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all duration-300"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                      className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* JOIN REQUEST INTERACTIVE ACTIONS */}
                {n.type === "join_request" && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                     <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${n.requesterEmail}`); }}
                      className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoinRequestAction(n.id, "approve", n.requesterEmail, n.projectId); }}
                      className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Approve
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoinRequestAction(n.id, "reject", n.requesterEmail, n.projectId); }}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}

              </motion.div>
            ))
          )}
        </div>

      </div>
      <AIAssistant />
    </div>
  );
}

export default Notifications;