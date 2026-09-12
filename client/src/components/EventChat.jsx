import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function EventChat({ eventId }) {
  const { accessToken, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!accessToken) return;

    // Load history first
    const loadHistory = async () => {
      try {
        const res = await api.get(`/chat/${eventId}`);
        setMessages(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load chat");
      } finally {
        setLoading(false);
      }
    };
    loadHistory();

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token: accessToken },
    });
    socketRef.current = socket;

    socket.emit("joinEventChat", eventId);

    socket.on("newChatMessage", (message) => {
      if (message.event === eventId || message.event?._id === eventId) {
        setMessages((prev) => [...prev, message]);
      } else {
        // event field might just be the id string depending on population
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("chatError", (msg) => {
      setError(msg);
    });

    return () => {
      socket.emit("leaveEventChat", eventId);
      socket.disconnect();
    };
  }, [accessToken, eventId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("sendChatMessage", { eventId, content: input.trim() });
    setInput("");
  };

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading chat...</p>;
  }

  if (error && messages.length === 0) {
    return <p className="text-red-600 text-sm">{error}</p>;
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
        <p className="text-sm font-medium text-slate-700">Event Chat</p>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((msg) => {
          const isMine = msg.sender?._id === user?.id || msg.sender === user?.id;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMine ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {!isMine && (
                  <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender?.name}</p>
                )}
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-8">No messages yet. Say hello!</p>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-red-600 text-xs px-4 py-1">{error}</p>}

      <form onSubmit={sendMessage} className="flex border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default EventChat;