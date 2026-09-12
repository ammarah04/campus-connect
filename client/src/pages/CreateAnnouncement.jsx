import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { DEPARTMENTS } from "../constants/departments.js";

function CreateAnnouncement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { targetType: "society" },
  });

  const targetType = watch("targetType");

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
    mutationFn: async (data) => (await api.post("/announcements", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate("/announcements");
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
          <p className="text-ink font-medium">Only society admins can post announcements.</p>
          <Link to="/announcements" className="text-sm text-ink hover:underline mt-4 inline-block">
            ← Back to announcements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">Create announcement</h1>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-4">
              {mutation.error.response?.data?.message || "Failed to create announcement"}
            </p>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Target audience</label>
              <select className={inputClass} {...register("targetType")}>
                <option value="society">Specific society</option>
                {isUniversityAdmin && (
                  <>
                    <option value="everyone">Everyone (university-wide)</option>
                    <option value="department">Department</option>
                    <option value="semester">Semester</option>
                  </>
                )}
              </select>
            </div>

            {targetType === "society" && (
              <div>
                <label className="text-sm text-muted mb-1 block">Society</label>
                <select className={inputClass} {...register("society", { required: targetType === "society" })}>
                  <option value="">Select a society</option>
                  {societyOptions?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            )}

            {targetType === "department" && (
              <div>
                <label className="text-sm text-muted mb-1 block">Department</label>
                <select
                  className={`${inputClass} bg-white`}
                  defaultValue=""
                  {...register("targetValue", { required: targetType === "department" })}
                >
                  <option value="" disabled>
                    Select a department
                  </option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetType === "semester" && (
              <>
                <div>
                  <label className="text-sm text-muted mb-1 block">Department</label>
                  <select
                    className={`${inputClass} bg-white`}
                    defaultValue=""
                    {...register("department", { required: targetType === "semester" })}
                  >
                    <option value="" disabled>
                      Select a department
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-600 text-sm mt-1">Department is required</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted mb-1 block">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className={inputClass}
                    {...register("targetValue", { required: targetType === "semester" })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-sm text-muted mb-1 block">Title</label>
              <input className={inputClass} {...register("title", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Content</label>
              <textarea rows={4} className={inputClass} {...register("content", { required: true })} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post announcement"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/announcements")}
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

export default CreateAnnouncement;