import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistant({ project }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAskAI = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/assistant", {
        question,
        project,
      });

      const aiMessage = {
        role: "ai",
        text: res.data.answer,
      };

      setMessages([...updatedMessages, aiMessage]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: "ai", text: "⚠️ AI failed. Try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-full shadow-xl"
          >
            <MessageCircle size={26} />
          </motion.button>
        )}
      </motion.div>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 w-96 h-[520px] bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div>
                <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
                <p className="text-[10px] text-white/70">Ask anything about projects</p>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X className="text-white" size={18} />
              </button>
            </div>

            {/* QUICK QUESTIONS */}
            <div className="flex flex-wrap gap-2 p-3 border-b border-white/10 bg-[#020617]">
              {[
                "How do I join a project?",
                "How to improve recommendations?",
                "How should I start this project?",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-[10px] px-2 py-1 bg-white/10 rounded-full hover:bg-white/20 text-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* CHAT */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0b1120] to-[#020617]"
            >
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-xs mt-10">
                  Ask me anything about this platform or your projects...
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow ${
                      msg.role === "user"
                        ? "bg-indigo-500 text-white"
                        : "bg-white/10 text-gray-200 backdrop-blur"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
                </div>
              )}
            </div>

            {/* INPUT */}
            <div className="p-3 border-t border-white/10 bg-[#020617]">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-indigo-500">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskAI();
                  }}
                />

                <button
                  onClick={handleAskAI}
                  className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded-lg text-xs text-white"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
