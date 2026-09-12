import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const { data: mySocieties, isLoading } = useQuery({
    queryKey: ["mySocieties"],
    queryFn: async () => (await api.get("/societies/my/memberships")).data,
  });

  const isUniversityAdmin = user?.role === "universityAdmin";
  const adminSocieties = mySocieties?.filter((s) => s.myRole === "admin") || [];
  const canManage = isUniversityAdmin || adminSocieties.length > 0;

  const { data: allSocieties } = useQuery({
    queryKey: ["societies"],
    queryFn: async () => (await api.get("/societies")).data,
    enabled: isUniversityAdmin,
  });

  const societyOptions = isUniversityAdmin ? allSocieties : adminSocieties;

  const mutation = useMutation({
    mutationFn: async (data) => (await api.post("/events", data)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate(`/events/${data._id}`);
    },
  });

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-ink font-medium">Only society admins can create events.</p>
          <p className="text-muted text-sm mt-1">
            If you run a society, ask a university admin to make you its admin.
          </p>
          <Link to="/events" className="text-sm text-ink hover:underline mt-4 inline-block">
            ← Back to events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">Create event</h1>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-4">
              {mutation.error.response?.data?.message || "Failed to create event"}
            </p>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Society</label>
              <select className={inputClass} {...register("society", { required: true })}>
                <option value="">Select a society</option>
                {societyOptions?.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Event title</label>
              <input className={inputClass} {...register("title", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Category</label>
              <input className={inputClass} placeholder="Workshop, Seminar, Competition" {...register("category")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Venue</label>
              <input className={inputClass} {...register("venue")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Start date & time</label>
              <input type="datetime-local" className={inputClass} {...register("startDateTime", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Registration deadline</label>
              <input type="datetime-local" className={inputClass} {...register("registrationDeadline")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">
                Capacity <span className="text-muted/70">(blank = unlimited)</span>
              </label>
              <input type="number" min="1" className={inputClass} {...register("capacity")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Description</label>
              <textarea rows={4} className={inputClass} {...register("description")} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create event"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;