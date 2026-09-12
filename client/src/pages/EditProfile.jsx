import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios.js";

function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/users/profile")).data,
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        department: profile.department,
        semester: profile.semester,
        interests: profile.interests?.join(", "),
        skills: profile.skills?.join(", "),
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        department: data.department,
        semester: data.semester ? Number(data.semester) : undefined,
        interests: data.interests ? data.interests.split(",").map((s) => s.trim()).filter(Boolean) : [],
        skills: data.skills ? data.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      return (await api.put("/users/profile", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/profile");
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">Edit profile</h1>

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Full name</label>
              <input className={inputClass} {...register("name")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Department</label>
              <input className={inputClass} {...register("department")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Semester</label>
              <input type="number" min="1" max="12" className={inputClass} {...register("semester")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">
                Interests <span className="text-muted/70">(comma-separated)</span>
              </label>
              <input className={inputClass} placeholder="AI, Web Development, Robotics" {...register("interests")} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">
                Skills <span className="text-muted/70">(comma-separated)</span>
              </label>
              <input className={inputClass} placeholder="React, Node.js, MongoDB" {...register("skills")} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/profile")}
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

export default EditProfile;