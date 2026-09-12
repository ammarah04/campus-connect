import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios.js";
import { useSocket } from "../context/SocketContext.jsx";

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();
  const { latestNotification } = useSocket();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (latestNotification) {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }, [latestNotification, queryClient]);

  // Close the dropdown on any click outside this component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllMutation = useMutation({
    mutationFn: async () => await api.put("/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markOneMutation = useMutation({
    mutationFn: async (id) => await api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = data?.unreadCount || 0;
  const notifications = data?.notifications || [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative border border-line rounded-md p-2 text-ink hover:bg-paper transition"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-ink text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-line rounded-lg shadow-sm z-10 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b border-line">
            <span className="font-medium text-ink text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => markAllMutation.mutate()} className="text-xs text-muted hover:text-ink transition">
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="text-muted text-sm p-4 text-center">No notifications yet.</p>
          )}

          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || "#"}
              onClick={() => {
                if (!n.isRead) markOneMutation.mutate(n._id);
                setOpen(false);
              }}
              className={`block p-3 text-sm border-b border-line last:border-0 hover:bg-paper transition ${
                !n.isRead ? "bg-paper" : ""
              }`}
            >
              <p className="text-ink">{n.message}</p>
              <p className="text-muted text-xs mt-1">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;