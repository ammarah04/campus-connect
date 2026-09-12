import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios.js";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => (await api.get(`/posts/${id}`)).data,
  });

  const likeMutation = useMutation({
    mutationFn: async () => (await api.post(`/posts/${id}/like`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["post", id] }),
  });

  const commentMutation = useMutation({
    mutationFn: async (content) => (await api.post(`/posts/${id}/comments`, { content })).data,
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => await api.put(`/posts/${id}/report`),
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        Post not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/discussions")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Discussions
        </button>

        <div className="bg-white border border-line rounded-xl p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl text-ink">{post.title}</h1>
            <span className="text-xs text-muted border border-line px-2 py-0.5 rounded-md whitespace-nowrap">
              {post.category}
            </span>
          </div>

          <p className="text-muted text-xs mt-2">
            {post.createdBy?.name} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>

          <p className="text-ink/80 mt-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => likeMutation.mutate()}
              className="text-sm border border-line rounded-md px-3 py-1.5 hover:bg-paper transition"
            >
              {post.likeCount} likes
            </button>
            <button
              onClick={() => reportMutation.mutate()}
              disabled={reportMutation.isSuccess}
              className="text-sm text-muted hover:text-red-600 transition"
            >
              {reportMutation.isSuccess ? "Reported" : "Report"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <h2 className="font-medium text-ink mb-4">Comments ({post.comments?.length || 0})</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) commentMutation.mutate(commentText.trim());
              }}
              className="flex gap-2 mb-6"
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
              />
              <button
                type="submit"
                disabled={commentMutation.isPending}
                className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                Post
              </button>
            </form>

            <div className="space-y-3">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="border border-line rounded-lg p-3">
                  <p className="text-ink/80 text-sm">{comment.content}</p>
                  <p className="text-muted text-xs mt-1">
                    {comment.createdBy?.name} · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>

            {post.comments?.length === 0 && (
              <p className="text-muted text-sm text-center">No comments yet. Be the first.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetails;