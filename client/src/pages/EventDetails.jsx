import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios.js";
import EventChat from "../components/EventChat.jsx";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => (await api.get(`/events/${id}`)).data,
  });

  const { data: myStatus } = useQuery({
    queryKey: ["registrationStatus", id],
    queryFn: async () => (await api.get(`/events/${id}/register/status`)).data,
  });

  const registerMutation = useMutation({
    mutationFn: async () => (await api.post(`/events/${id}/register`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["registrationStatus", id] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => (await api.delete(`/events/${id}/register`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["registrationStatus", id] });
    },
  });

  const downloadCertificate = async () => {
    setCertLoading(true);
    setCertError("");
    try {
      const res = await api.get(`/certificates/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate-${event.title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setCertError("You need to have attended this event to download a certificate.");
    } finally {
      setCertLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-muted">Loading...</div>;
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-red-600">
        Event not found
      </div>
    );
  }

  const isRegistered = myStatus?.status === "registered";
  const isWaitlisted = myStatus?.status === "waitlisted";
  const eventHasPassed = new Date(event.startDateTime) < new Date();

  return (
    <div className="min-h-screen bg-paper p-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/events")} className="text-muted text-sm hover:text-ink transition mb-6">
          ← Events
        </button>

        <div className="bg-white border border-line rounded-xl p-8">
          <h1 className="font-display text-2xl text-ink">{event.title}</h1>
          <p className="text-muted text-sm mt-1">{event.society?.name}</p>

          {event.category && (
            <span className="inline-block text-xs text-muted border border-line px-2 py-0.5 rounded-md mt-2">
              {event.category}
            </span>
          )}

          <div className="mt-4 space-y-1 text-sm text-ink/80">
            <p>{format(new Date(event.startDateTime), "EEEE, MMM d, yyyy · h:mm a")}</p>
            {event.venue && <p>{event.venue}</p>}
            {event.registrationDeadline && (
              <p className="text-muted">
                Register by {format(new Date(event.registrationDeadline), "MMM d, yyyy · h:mm a")}
              </p>
            )}
            <p className="text-muted">
              {event.registrationCount} registered
              {event.capacity ? ` / ${event.capacity} capacity` : ""}
            </p>
          </div>

          <p className="text-ink/80 mt-4 leading-relaxed">{event.description || "No description yet."}</p>

          {registerMutation.isError && (
            <p className="text-red-600 text-sm mt-4">{registerMutation.error.response?.data?.message}</p>
          )}

          {isWaitlisted && (
            <p className="text-amber-700 text-sm mt-4 font-medium">You're on the waitlist for this event.</p>
          )}

          <div className="mt-4">
            {isRegistered || isWaitlisted ? (
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="border border-line text-ink px-5 py-2 rounded-md text-sm font-medium hover:bg-paper transition disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel registration"}
              </button>
            ) : (
              <button
                onClick={() => registerMutation.mutate()}
                disabled={registerMutation.isPending}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </button>
            )}
          </div>

          {isRegistered && myStatus?.qrToken && (
            <div className="mt-6 p-6 bg-paper rounded-lg border border-line flex flex-col items-center">
              <p className="text-ink text-sm mb-3 font-medium">Your check-in QR code</p>
              <div className="bg-white p-4 rounded-md">
                <QRCodeSVG value={myStatus.qrToken} size={180} />
              </div>
              <p className="text-muted text-xs mt-3 text-center">
                Show this at the event entrance to be checked in
              </p>
            </div>
          )}

          {(isRegistered || isWaitlisted) && (
            <div className="mt-6 pt-6 border-t border-line">
              <p className="text-ink text-sm mb-3 font-medium">Chat with other attendees</p>
              <EventChat eventId={id} />
            </div>
          )}

          {eventHasPassed && (
            <div className="mt-6 pt-6 border-t border-line">
              <button
                onClick={downloadCertificate}
                disabled={certLoading}
                className="bg-ink text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-ink/90 transition disabled:opacity-50"
              >
                {certLoading ? "Generating..." : "Download certificate"}
              </button>
              {certError && <p className="text-red-600 text-sm mt-2">{certError}</p>}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-line">
            <Link to={`/events/${event._id}/check-in`} className="text-muted text-sm hover:text-ink transition">
              Open check-in scanner (admin)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;