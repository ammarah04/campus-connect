import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

function UniversityAdminDashboard() {
  const navigate = useNavigate();

  const { data: overview, isLoading, isError, error } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: async () => (await api.get("/admin/overview")).data,
  });

  const { data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => (await api.get("/admin/users")).data,
    enabled: !!overview,
  });

  const { data: events } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: async () => (await api.get("/admin/events")).data,
    enabled: !!overview,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        {error.response?.data?.message || "Access denied"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <h1 className="font-display text-3xl text-ink mb-1">University admin dashboard</h1>
        <p className="text-muted text-sm mb-8">Platform-wide overview</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-line border border-line rounded-xl overflow-hidden mb-8">
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Users</p>
            <p className="font-display text-2xl text-ink mt-1">{overview.userCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Societies</p>
            <p className="font-display text-2xl text-ink mt-1">{overview.societyCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Events</p>
            <p className="font-display text-2xl text-ink mt-1">{overview.eventCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Registrations</p>
            <p className="font-display text-2xl text-ink mt-1">{overview.registrationCount}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Attendance</p>
            <p className="font-display text-2xl text-ink mt-1">{overview.attendanceCount}</p>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mb-8">
          <h2 className="font-medium text-ink mb-1">Events per society</h2>
          <p className="text-muted text-sm mb-4">Number of events created by each society</p>
          {overview.eventsPerSociety.length === 0 ? (
            <p className="text-muted text-sm">No societies yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(80 * overview.eventsPerSociety.length, 180)}>
              <BarChart
                data={overview.eventsPerSociety}
                layout="vertical"
                margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
                barCategoryGap={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DD" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  axisLine={{ stroke: "#E4E2DD" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  tick={{ fontSize: 13, fill: "#1C1F26" }}
                  axisLine={{ stroke: "#E4E2DD" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#FAFAF7" }}
                  contentStyle={{ border: "1px solid #E4E2DD", borderRadius: 6, fontSize: 13 }}
                />
                <Bar
                  dataKey="events"
                  fill="#1C1F26"
                  radius={[0, 4, 4, 0]}
                  barSize={22}
                  label={{ position: "right", fill: "#6B7280", fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mb-8">
          <h2 className="font-medium text-ink mb-4">All users</h2>
          <div className="divide-y divide-line">
            {users?.map((u) => (
              <div key={u._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="text-ink font-medium">{u.name}</p>
                  <p className="text-muted text-xs">{u.email}</p>
                </div>
                <span className="text-xs text-muted border border-line px-2 py-0.5 rounded-md capitalize">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl p-6">
          <h2 className="font-medium text-ink mb-4">All events</h2>
          <div className="divide-y divide-line">
            {events?.map((e) => (
              <div key={e._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="text-ink font-medium">{e.title}</p>
                  <p className="text-muted text-xs">{e.society?.name}</p>
                </div>
                <span className="text-muted text-xs">{format(new Date(e.startDateTime), "MMM d, yyyy")}</span>
              </div>
            ))}
            {events?.length === 0 && <p className="text-muted text-sm text-center py-4">No events yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversityAdminDashboard;