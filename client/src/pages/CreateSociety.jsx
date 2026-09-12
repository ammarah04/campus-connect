import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { DEPARTMENTS } from "../constants/departments.js";

function CreateSociety() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => (await api.post("/societies", data)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["societies"] });
      navigate(`/societies/${data._id}`);
    },
  });

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";

  if (user?.role !== "universityAdmin") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-ink font-medium">Only university admins can create societies.</p>
          <Link to="/societies" className="text-sm text-ink hover:underline mt-4 inline-block">
            ← Back to societies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">Create society</h1>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-4">
              {mutation.error.response?.data?.message || "Failed to create society"}
            </p>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Society name</label>
              <input className={inputClass} {...register("name", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Department</label>
              <select
                className={`${inputClass} bg-white`}
                defaultValue=""
                {...register("department", { required: "Department is required" })}
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
                <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Category</label>
              <input className={inputClass} placeholder="Technology, Arts, Sports" {...register("category")} />
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
                {isSubmitting ? "Creating..." : "Create society"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/societies")}
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

export default CreateSociety;