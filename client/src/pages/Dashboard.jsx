import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import api from "../api/axios.js";

function Dashboard() {
  const { user, logout } = useAuth();

  const { data: mySocieties } = useQuery({
    queryKey: ["mySocieties"],
    queryFn: async () => (await api.get("/societies/my/memberships")).data,
  });

  const { data: myEvents } = useQuery({
    queryKey: ["myEvents"],
    queryFn: async () => (await api.get("/events/my/registrations")).data,
  });

  const { data: myAttendance } = useQuery({
    queryKey: ["myAttendance"],
    queryFn: async () => (await api.get("/attendance/my")).data,
  });

  const { data: recommended } = useQuery({
    queryKey: ["recommendedEvents"],
    queryFn: async () => (await api.get("/events/recommended")).data,
  });

  const isUniversityAdmin = user?.role === "universityAdmin";
  const administersAnySociety = mySocieties?.some((s) => s.myRole === "admin");
  const canManage = isUniversityAdmin || administersAnySociety;

  const navLinks = [
    { to: "/profile", label: "Profile" },
    { to: "/societies", label: "Societies" },
    { to: "/events", label: "Events" },
    { to: "/announcements", label: "Announcements" },
    { to: "/discussions", label: "Discussions" },
    { to: "/study-resources", label: "Study Resources" },
    ...(isUniversityAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const upcomingEvents = (myEvents || [])
    .filter((e) => new Date(e.startDateTime) >= new Date())
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-4xl mx-auto pl-2 pr-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="font-display text-lg text-ink">
            CampusConnect
          </Link>
          <nav className="hidden sm:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-muted hover:text-ink transition">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={logout} className="text-sm text-muted hover:text-ink transition">
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="font-display text-3xl text-ink">Welcome, {user?.name}</h1>
        <p className="text-muted text-sm mt-1 capitalize">{user?.role}</p>

        <div className="flex flex-wrap gap-2 mt-4 sm:hidden">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-xs border border-line rounded-md px-3 py-1.5 text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-px bg-line border border-line rounded-xl overflow-hidden mt-8">
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Societies</p>
            <p className="font-display text-3xl text-ink mt-1">{mySocieties?.length ?? "—"}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Upcoming events</p>
            <p className="font-display text-3xl text-ink mt-1">{upcomingEvents.length}</p>
          </div>
          <div className="bg-white p-5">
            <p className="text-muted text-sm">Attended</p>
            <p className="font-display text-3xl text-ink mt-1">{myAttendance?.length ?? "—"}</p>
          </div>
        </div>

        {recommended?.length > 0 && (
          <div className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-xl text-ink">Recommended for you</h2>
              <span className="text-xs text-muted">Based on your interests</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommended.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="border border-line rounded-lg p-4 bg-white hover:border-ink/30 transition"
                >
                  <p className="text-ink font-medium">{event.title}</p>
                  <p className="text-muted text-sm mt-1">
                    {event.society?.name} · {format(new Date(event.startDateTime), "MMM d, h:mm a")}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-ink">My upcoming events</h2>
            {canManage && (
              <Link to="/events/new" className="text-sm text-ink hover:underline">
                + Create event
              </Link>
            )}
          </div>
          <div className="border border-line rounded-lg bg-white divide-y divide-line">
            {upcomingEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="flex items-center justify-between p-4 hover:bg-paper transition"
              >
                <div>
                  <p className="text-ink font-medium">{event.title}</p>
                  <p className="text-muted text-sm">{event.society?.name}</p>
                </div>
                <p className="text-muted text-sm">{format(new Date(event.startDateTime), "MMM d, h:mm a")}</p>
              </Link>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-muted text-sm p-4">No upcoming events registered.</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl text-ink">My societies</h2>
            {isUniversityAdmin && (
              <Link to="/societies/new" className="text-sm text-ink hover:underline">
                + Create society
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mySocieties?.map((society) => (
              <Link
                key={society._id}
                to={`/societies/${society._id}`}
                className="border border-line rounded-lg p-4 bg-white hover:border-ink/30 transition flex items-center justify-between"
              >
                <span className="text-ink font-medium">{society.name}</span>
                {society.myRole === "admin" && <span className="text-xs text-muted">Admin</span>}
              </Link>
            ))}
            {mySocieties?.length === 0 && (
              <p className="text-muted text-sm">You haven't joined any societies yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;