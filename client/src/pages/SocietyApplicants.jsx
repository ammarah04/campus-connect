import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios.js";

function SocietyApplicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scheduling, setScheduling] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [now, setNow] = useState(new Date());

  // Tick every 30s so buttons unlock automatically once interview time passes,
  // without the admin needing to refresh the page.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const { data: applicants, isLoading, isError, error } = useQuery({
    queryKey: ["societyApplicants", id],
    queryFn: async () => (await api.get(`/societies/${id}/applicants`)).data,
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({ membershipId, interviewScheduledAt, interviewLocation }) =>
      (
        await api.put(`/societies/${id}/applicants/${membershipId}/interview`, {
          interviewScheduledAt,
          interviewLocation,
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societyApplicants", id] });
      setScheduling(null);
      setInterviewDate("");
      setInterviewLocation("");
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ membershipId, action }) =>
      (await api.put(`/societies/${id}/applicants/${membershipId}`, { action })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["societyApplicants", id] });
      queryClient.invalidateQueries({ queryKey: ["society", id] });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        {error.response?.data?.message || "Failed to load applicants"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/societies/${id}`)} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Back to society
        </button>

        <h1 className="font-display text-3xl text-ink mb-1">Applicants</h1>
        <p className="text-muted text-sm mb-8">Schedule interviews and review applications</p>

        {(scheduleMutation.isError || respondMutation.isError) && (
          <p className="text-red-600 text-sm mb-4">
            {(scheduleMutation.error || respondMutation.error)?.response?.data?.message}
          </p>
        )}

        {applicants.length === 0 ? (
          <div className="bg-white border border-line rounded-xl p-8 text-center text-muted text-sm">
            No pending applications right now.
          </div>
        ) : (
          <div className="bg-white border border-line rounded-xl divide-y divide-line">
            {applicants.map((applicant) => {
              const interviewTime = applicant.interviewScheduledAt ? new Date(applicant.interviewScheduledAt) : null;
              const interviewPassed = interviewTime ? now >= interviewTime : false;

              return (
                <div key={applicant._id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-ink font-medium">{applicant.user.name}</p>
                      <p className="text-muted text-sm">{applicant.user.email}</p>
                      <p className="text-muted text-xs mt-1">
                        {applicant.user.department}
                        {applicant.user.semester ? ` · Semester ${applicant.user.semester}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {applicant.status === "pending" && scheduling !== applicant._id && (
                        <button
                          onClick={() => setScheduling(applicant._id)}
                          className="border border-line text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-paper transition"
                        >
                          Schedule interview
                        </button>
                      )}

                      {applicant.status === "interviewScheduled" && (
                        <>
                          <button
                            onClick={() => respondMutation.mutate({ membershipId: applicant._id, action: "reject" })}
                            disabled={!interviewPassed || respondMutation.isPending}
                            title={!interviewPassed ? "Available after the interview time has passed" : undefined}
                            className="border border-line text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-paper transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => respondMutation.mutate({ membershipId: applicant._id, action: "approve" })}
                            disabled={!interviewPassed || respondMutation.isPending}
                            title={!interviewPassed ? "Available after the interview time has passed" : undefined}
                            className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {applicant.status === "interviewScheduled" && (
                    <p className="text-muted text-xs mt-3 border border-line rounded-md px-3 py-2 inline-block">
                      Interview: {interviewTime.toLocaleString()}
                      {applicant.interviewLocation ? ` · ${applicant.interviewLocation}` : ""}
                      {!interviewPassed && " · decision unlocks after this time"}
                    </p>
                  )}

                  {scheduling === applicant._id && (
                    <div className="mt-4 border border-line rounded-md p-4 flex flex-col gap-3">
                      <label className="text-sm text-ink">
                        Date & time
                        <input
                          type="datetime-local"
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="block w-full mt-1 border border-line rounded-md px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-sm text-ink">
                        Location or call link (optional)
                        <input
                          type="text"
                          value={interviewLocation}
                          onChange={(e) => setInterviewLocation(e.target.value)}
                          placeholder="Room 204, or a Zoom/Meet link"
                          className="block w-full mt-1 border border-line rounded-md px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setScheduling(null)}
                          className="border border-line text-ink px-4 py-2 rounded-md text-sm font-medium hover:bg-paper transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            scheduleMutation.mutate({
                              membershipId: applicant._id,
                              interviewScheduledAt: interviewDate,
                              interviewLocation,
                            })
                          }
                          disabled={!interviewDate || scheduleMutation.isPending}
                          className="bg-ink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
                        >
                          {scheduleMutation.isPending ? "Scheduling..." : "Confirm"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SocietyApplicants;