import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function Announcements() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => (await api.get("/announcements")).data,
  });

  const { data: mySocieties } = useQuery({
    queryKey: ["mySocieties"],
    queryFn: async () => (await api.get("/societies/my/memberships")).data,
  });

  const canManage = user?.role === "universityAdmin" || mySocieties?.some((s) => s.myRole === "admin");

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-ink">Announcements</h1>
          {canManage && (
            <Link
              to="/announcements/new"
              className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
            >
              + Post
            </Link>
          )}
        </div>

        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        {isError && <p className="text-red-600 text-sm">Failed to load announcements</p>}

        <div className="space-y-3">
          {announcements?.map((a) => (
            <div key={a._id} className="bg-white border border-line rounded-lg p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium text-ink">{a.title}</h2>
                <span className="text-xs text-muted border border-line px-2 py-0.5 rounded-md whitespace-nowrap">
                  {a.targetType === "society" ? a.society?.name : a.targetType}
                </span>
              </div>
              <p className="text-ink/80 text-sm mt-2 leading-relaxed">{a.content}</p>
              <p className="text-muted text-xs mt-3">
                {a.createdBy?.name} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>

        {announcements?.length === 0 && !isLoading && (
          <p className="text-muted text-sm text-center mt-10">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}

export default Announcements;