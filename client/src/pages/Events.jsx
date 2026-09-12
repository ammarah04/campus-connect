import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function Events() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: events, isLoading, isError } = useQuery({
    queryKey: ["events", search],
    queryFn: async () => (await api.get("/events", { params: { search } })).data,
  });

  const { data: mySocieties } = useQuery({
    queryKey: ["mySocieties"],
    queryFn: async () => (await api.get("/societies/my/memberships")).data,
  });

  const canManage = user?.role === "universityAdmin" || mySocieties?.some((s) => s.myRole === "admin");

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-ink">Events</h1>
          {canManage && (
            <Link
              to="/events/new"
              className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
            >
              + Create event
            </Link>
          )}
        </div>

        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 text-sm mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
        />

        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        {isError && <p className="text-red-600 text-sm">Failed to load events</p>}

        <div className="border border-line rounded-lg bg-white divide-y divide-line">
          {events?.map((event) => (
            <Link
              key={event._id}
              to={`/events/${event._id}`}
              className="flex items-center justify-between p-4 hover:bg-paper transition"
            >
              <div>
                <p className="text-ink font-medium">{event.title}</p>
                <p className="text-muted text-sm mt-0.5">
                  {event.society?.name}
                  {event.venue ? ` · ${event.venue}` : ""}
                </p>
              </div>
              <p className="text-muted text-sm whitespace-nowrap ml-4">
                {format(new Date(event.startDateTime), "MMM d, h:mm a")}
              </p>
            </Link>
          ))}
        </div>

        {events?.length === 0 && !isLoading && (
          <p className="text-muted text-sm text-center mt-10">No events found.</p>
        )}
      </div>
    </div>
  );
}

export default Events;