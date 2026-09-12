import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios.js";

const categories = ["", "General", "Academics", "Events", "Help"];

function Discussions() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts", category],
    queryFn: async () => (await api.get("/posts", { params: category ? { category } : {} })).data,
  });

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-ink">Discussions</h1>
          <Link
            to="/discussions/new"
            className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
          >
            + New post
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm px-3 py-1.5 rounded-md border transition ${
                category === cat
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-muted border-line hover:text-ink"
              }`}
            >
              {cat || "All"}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        {isError && <p className="text-red-600 text-sm">Failed to load posts</p>}

        <div className="space-y-3">
          {posts?.map((post) => (
            <Link
              key={post._id}
              to={`/discussions/${post._id}`}
              className="block bg-white border border-line rounded-lg p-5 hover:border-ink/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium text-ink">{post.title}</h2>
                <span className="text-xs text-muted border border-line px-2 py-0.5 rounded-md whitespace-nowrap">
                  {post.category}
                </span>
              </div>
              <p className="text-muted text-sm mt-1 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted mt-3">
                <span>{post.createdBy?.name}</span>
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>{post.likeCount} likes</span>
                <span>{post.commentCount} comments</span>
              </div>
            </Link>
          ))}
        </div>

        {posts?.length === 0 && !isLoading && (
          <p className="text-muted text-sm text-center mt-10">No posts yet. Start a discussion.</p>
        )}
      </div>
    </div>
  );
}

export default Discussions;