import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import api from "../api/axios.js";

const RESOURCE_TYPES = ["", "Notes", "Past Paper", "Quiz Prep", "Assignment Help"];

function buildDownloadUrl(fileUrl, fileName) {
  const cleanName = encodeURIComponent(fileName.replace(/\.[^/.]+$/, ""));
  return fileUrl.replace("/upload/", `/upload/fl_attachment:${cleanName}/`);
}

function StudyResources() {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState("");
  const [search, setSearch] = useState("");

  const { data: resources, isLoading, isError } = useQuery({
    queryKey: ["studyResources", resourceType, search],
    queryFn: async () =>
      (
        await api.get("/study-resources", {
          params: { resourceType: resourceType || undefined, search: search || undefined },
        })
      ).data,
  });

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/dashboard")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Dashboard
        </button>

        <div className="flex items-end justify-between mb-6">
          <h1 className="font-display text-3xl text-ink">Study Resources</h1>
          <Link
            to="/study-resources/new"
            className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition"
          >
            + Upload
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-line rounded-md px-3 py-2 text-sm mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-ink"
        />

        <div className="flex gap-2 mb-6 flex-wrap">
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setResourceType(type)}
              className={`text-sm px-3 py-1.5 rounded-md border transition ${
                resourceType === type
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-muted border-line hover:text-ink"
              }`}
            >
              {type || "All"}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-muted text-sm">Loading...</p>}
        {isError && <p className="text-red-600 text-sm">Failed to load resources</p>}

        <div className="space-y-3">
          {resources?.map((resource) => (
            <div
              key={resource._id}
              className="bg-white border border-line rounded-lg p-5 hover:border-ink/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink hover:underline"
                >
                  {resource.title}
                </a>
                <span className="text-xs text-muted border border-line px-2 py-0.5 rounded-md whitespace-nowrap">
                  {resource.resourceType}
                </span>
              </div>

              {resource.courseCode && (
                <p className="text-muted text-xs mt-1">{resource.courseCode}</p>
              )}
              {resource.description && (
                <p className="text-muted text-sm mt-1 line-clamp-2">{resource.description}</p>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>{resource.uploadedBy?.name}</span>
                  <span>{formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}</span>
                </div>

                <a
                                 
                  href={buildDownloadUrl(resource.fileUrl, resource.fileName)}
                  className="flex items-center gap-1.5 text-xs bg-ink text-white rounded-md px-3 py-1.5 hover:bg-ink/90 transition whitespace-nowrap"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>

        {resources?.length === 0 && !isLoading && (
          <p className="text-muted text-sm text-center mt-10">No study resources yet. Be the first to upload one.</p>
        )}
      </div>
    </div>
  );
}

export default StudyResources;