import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/users/profile")).data,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="bg-white border border-line rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-ink text-white flex items-center justify-center font-display text-xl">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-xl text-ink">{profile.name}</h1>
              <p className="text-muted text-sm">{profile.email}</p>
            </div>
          </div>

          <div className="divide-y divide-line text-sm">
            <div className="flex justify-between py-2.5">
              <span className="text-muted">University ID</span>
              <span className="text-ink">{profile.universityId || "—"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted">Department</span>
              <span className="text-ink">{profile.department || "—"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted">Semester</span>
              <span className="text-ink">{profile.semester || "—"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted">Role</span>
              <span className="text-ink capitalize">{profile.role}</span>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-muted text-sm mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {profile.interests?.length ? (
                profile.interests.map((tag, i) => (
                  <span key={i} className="border border-line text-ink text-xs px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-muted text-sm">None added</span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted text-sm mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.length ? (
                profile.skills.map((tag, i) => (
                  <span key={i} className="border border-line text-ink text-xs px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-muted text-sm">None added</span>
              )}
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="inline-block mt-6 bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
          >
            Edit profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;