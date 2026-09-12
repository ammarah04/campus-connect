import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios.js";

function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { category: "General" },
  });

  const mutation = useMutation({
    mutationFn: async (data) => (await api.post("/posts", data)).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(`/discussions/${data._id}`);
    },
  });

  const inputClass =
    "w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink";

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-xl text-ink mb-6">New discussion post</h1>

          {mutation.isError && (
            <p className="text-red-600 text-sm mb-4">
              {mutation.error.response?.data?.message || "Failed to create post"}
            </p>
          )}

          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label className="text-sm text-muted mb-1 block">Category</label>
              <select className={inputClass} {...register("category")}>
                <option value="General">General</option>
                <option value="Academics">Academics</option>
                <option value="Events">Events</option>
                <option value="Help">Help</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Title</label>
              <input className={inputClass} {...register("title", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-muted mb-1 block">Content</label>
              <textarea rows={5} className={inputClass} {...register("content", { required: true })} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/discussions")}
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

export default CreatePost;