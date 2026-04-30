import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import AIAssistant from "../components/AIAssistant";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

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

  return (
    <div className="min-h-screen px-6 md:px-16 py-10 bg-gradient-to-br from-[#020617] via-[#020617] to-black text-white">

      <div className="max-w-3xl mx-auto pt-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-400 text-sm">
              Stay updated with your activity
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllRead}
              className="px-4 py-2 text-sm rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition"
            >
              Mark all
            </button>

            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm rounded-lg bg-red-500/20 border border-red-400/20 hover:bg-red-500/40 transition"
            >
              Clear all
            </button>
          </div>

        </div>

        {/* LIST */}
        <div className="space-y-4">

          {notifications.length === 0 ? (
            <div className="glass p-10 text-center">
              <p className="text-lg mb-2">🎉 All caught up!</p>
              <p className="text-gray-400 text-sm">
                No new notifications right now
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className={`glass p-5 flex justify-between items-start gap-4 transition ${
                  n.read
                    ? "opacity-70"
                    : "border-indigo-400/20 bg-indigo-500/5"
                }`}
              >

                {/* TEXT */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">

                    {!n.read && (
                      <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                    )}

                    <p className="text-sm leading-relaxed">
                      {n.text}
                    </p>

                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {n.read ? "Seen" : "New"}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  {!n.read && (
                    <button
                      onClick={() => handleRead(n.id)}
                      className="p-2 bg-indigo-500/20 border border-indigo-400/20 rounded-lg hover:bg-indigo-500/40 transition"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-2 bg-red-500/20 border border-red-400/20 rounded-lg hover:bg-red-500/40 transition"
                  >
                    <Trash2 size={14} />
                  </button>

                </div>

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