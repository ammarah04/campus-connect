import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function Societies() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: societies, isLoading, isError } = useQuery({
    queryKey: ["societies", search],
    queryFn: async () => (await api.get("/societies", { params: { search } })).data,
  });

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-ink">Societies</h1>
          {user?.role === "universityAdmin" && (
            <Link
              to="/societies/new"
              className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
            >
              + Create society
            </Link>
          )}
        </div>

        <input
          type="text"
          placeholder="Search societies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 text-sm mb-6 bg-white focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
        />

        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        {isError && <p className="text-red-600 text-sm">Failed to load societies</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {societies?.map((society) => (
            <Link
              key={society._id}
              to={`/societies/${society._id}`}
              className="border border-line rounded-lg p-5 bg-white hover:border-ink/30 transition block"
            >
              <h2 className="font-medium text-ink">{society.name}</h2>
              {society.category && (
                <span className="inline-block text-xs text-muted border border-line px-2 py-0.5 rounded-md mt-1.5">
                  {society.category}
                </span>
              )}
              <p className="text-muted text-sm mt-2 line-clamp-2">
                {society.description || "No description yet."}
              </p>
            </Link>
          ))}
        </div>

        {societies?.length === 0 && !isLoading && (
          <p className="text-muted text-sm text-center mt-10">No societies found.</p>
        )}
      </div>
    </div>
  );
}

export default Societies;