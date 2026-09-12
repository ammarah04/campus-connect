import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios.js";

function SocietyAdminDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["societyAnalytics", id],
    queryFn: async () => (await api.get(`/societies/${id}/analytics`)).data,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        {error.response?.data?.message || "Failed to load analytics"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(`/societies/${id}`)} className="text-muted text-sm hover:text-ink transition mb-6">
          ← {data.society.name}
        </button>

        <h1 className="font-display text-3xl text-ink mb-1">{data.society.name}</h1>
        <p className="text-muted text-sm mb-8">Admin dashboard — society analytics</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-xl overflow-hidden mb-8">
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Members</p>
            <p className="font-display text-3xl text-ink mt-1">{data.memberCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Events</p>
            <p className="font-display text-3xl text-ink mt-1">{data.eventCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Registrations</p>
            <p className="font-display text-3xl text-ink mt-1">{data.totalRegistrations}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Attendance</p>
            <p className="font-display text-3xl text-ink mt-1">{data.totalAttendance}</p>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl p-6">
          <h2 className="font-medium text-ink mb-4">Registrations vs attendance per event</h2>
          {data.perEventStats.length === 0 ? (
            <p className="text-muted text-sm">No events yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.perEventStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DD" />
                <XAxis dataKey="title" tick={{ fontSize: 12, fill: "#6B7280" }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} tick={{ fill: "#6B7280" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" fill="#1C1F26" name="Registrations" />
                <Bar dataKey="attendance" fill="#B8B6B0" name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocietyAdminDashboard;