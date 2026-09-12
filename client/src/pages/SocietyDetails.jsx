import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function SocietyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: society, isLoading, isError } = useQuery({
    queryKey: ["society", id],
    queryFn: async () => (await api.get(`/societies/${id}`)).data,
  });

  const joinMutation = useMutation({
    mutationFn: async () => (await api.post(`/societies/${id}/join`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["society", id] }),
  });

  const leaveMutation = useMutation({
    mutationFn: async () => (await api.delete(`/societies/${id}/join`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["society", id] }),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError || !society) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        Society not found
      </div>
    );
  }

  const myRole = society.myMembership?.role || null;
  const myStatus = society.myMembership?.status || null;
  const canManage = myRole === "admin" || user?.role === "universityAdmin";

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/societies")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Societies
        </button>

        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-2xl text-ink">{society.name}</h1>
          {society.category && (
            <span className="inline-block text-xs text-muted border border-line px-2 py-0.5 rounded-md mt-2">
              {society.category}
            </span>
          )}

          <p className="text-ink/80 mt-4 leading-relaxed">{society.description || "No description yet."}</p>

          <p className="text-muted text-sm mt-4">
            {society.memberCount} member{society.memberCount !== 1 ? "s" : ""}
          </p>

          {joinMutation.isError && (
            <p className="text-red-600 text-sm mt-3">{joinMutation.error.response?.data?.message}</p>
          )}
          {leaveMutation.isError && (
            <p className="text-red-600 text-sm mt-3">{leaveMutation.error.response?.data?.message}</p>
          )}

          {myStatus === "interviewScheduled" && society.myMembership?.interviewScheduledAt && (
            <p className="text-ink text-sm mt-4 border border-line rounded-md px-3 py-2 inline-block">
              Interview scheduled: {new Date(society.myMembership.interviewScheduledAt).toLocaleString()}
              {society.myMembership.interviewLocation ? ` · ${society.myMembership.interviewLocation}` : ""}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">
            {myRole === "admin" ? (
              <span className="text-sm text-muted">You're the admin of this society</span>
            ) : myStatus === "pending" ? (
              <>
                <span className="text-sm text-muted">Your application is awaiting review</span>
                <button
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition disabled:opacity-50"
                >
                  {leaveMutation.isPending ? "Cancelling..." : "Cancel application"}
                </button>
              </>
            ) : myStatus === "interviewScheduled" ? (
              <>
                <span className="text-sm text-muted">Awaiting your interview decision</span>
                <button
                  onClick={() => leaveMutation.mutate()}
                  disabled={leaveMutation.isPending}
                  className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition disabled:opacity-50"
                >
                  {leaveMutation.isPending ? "Cancelling..." : "Cancel application"}
                </button>
              </>
            ) : myRole === "member" ? (
              <button
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition disabled:opacity-50"
              >
                {leaveMutation.isPending ? "Leaving..." : "Leave society"}
              </button>
            ) : (
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {joinMutation.isPending ? "Applying..." : "Apply to join"}
              </button>
            )}

            {canManage && (
              <>
                <Link
                  to={`/societies/${id}/dashboard`}
                  className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition"
                >
                  Manage society
                </Link>
                <Link
                  to={`/societies/${id}/applicants`}
                  className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition"
                >
                  Review applicants
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocietyDetails;