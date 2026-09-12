import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios.js";

const RESOURCE_TYPES = ["Notes", "Past Paper", "Quiz Prep", "Assignment Help"];

function UploadStudyResource() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("resourceType", data.resourceType);
      if (data.courseCode) formData.append("courseCode", data.courseCode);
      if (data.description) formData.append("description", data.description);
      formData.append("file", data.file[0]);

      return (
        await api.post("/study-resources", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studyResources"] });
      navigate("/study-resources");
    },
  });

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">Upload study resource</h1>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-4">
              {mutation.error.response?.data?.message || "Failed to upload resource"}
            </p>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Title</label>
              <input className={inputClass} {...register("title", { required: true })} />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Type</label>
              <select
                className={`${inputClass} bg-white`}
                defaultValue=""
                {...register("resourceType", { required: "Type is required" })}
              >
                <option value="" disabled>
                  Select a type
                </option>
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.resourceType && (
                <p className="text-red-600 text-sm mt-1">{errors.resourceType.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Course code (optional)</label>
              <input className={inputClass} placeholder="CS301" {...register("courseCode")} />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">Description (optional)</label>
              <textarea rows={3} className={inputClass} {...register("description")} />
            </div>

            <div>
              <label className="text-sm text-muted mb-1 block">File (PDF, image, or Word/PowerPoint doc)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                className={`${inputClass} bg-white`}
                {...register("file", { required: "A file is required" })}
              />
              {errors.file && <p className="text-red-600 text-sm mt-1">{errors.file.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {mutation.isPending ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/study-resources")}
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

export default UploadStudyResource;