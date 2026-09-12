import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const FULL_TEXT = "CampusConnect";
const TYPE_SPEED = 90;
const PAUSE_AFTER_TYPE = 400;
const MOVE_DURATION = 700;

function Landing() {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing -> moving -> done
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const overlayLogoRef = useRef(null);
  const headerLogoRef = useRef(null);

  // Type out the logo letter by letter
  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length >= FULL_TEXT.length) {
      const t = setTimeout(() => setPhase("moving"), PAUSE_AFTER_TYPE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setTyped(FULL_TEXT.slice(0, typed.length + 1));
    }, TYPE_SPEED);
    return () => clearTimeout(t);
  }, [typed, phase]);

  // Once typing is done, measure where the header logo actually sits
  // and animate the overlay logo there
  useEffect(() => {
    if (phase !== "moving") return;
    const overlayEl = overlayLogoRef.current;
    const headerEl = headerLogoRef.current;

    if (overlayEl && headerEl) {
      const overlayRect = overlayEl.getBoundingClientRect();
      const headerRect = headerEl.getBoundingClientRect();

      const scale = headerRect.height / overlayRect.height;
      const x = headerRect.left + headerRect.width / 2 - (overlayRect.left + overlayRect.width / 2);
      const y = headerRect.top + headerRect.height / 2 - (overlayRect.top + overlayRect.height / 2);

      setTransform({ x, y, scale });
    }

    const t = setTimeout(() => setPhase("done"), MOVE_DURATION + 50);
    return () => clearTimeout(t);
  }, [phase]);

  const isTyping = phase === "typing";
  const isMoving = phase === "moving";
  const isDone = phase === "done";

  return (
    <div className="min-h-screen bg-paper flex flex-col relative overflow-hidden">
      {!isDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-paper">
          <span
            ref={overlayLogoRef}
            className="font-display text-4xl sm:text-5xl tracking-tight text-ink inline-block"
            style={{
              transform: isMoving
                ? `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
                : "translate(0px, 0px) scale(1)",
              transformOrigin: "center",
              transition: isMoving
                ? `transform ${MOVE_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`
                : "none",
            }}
          >
            {typed}
            {isTyping && (
              <span className="inline-block w-[2px] h-[1em] bg-ink ml-0.5 align-middle animate-pulse" />
            )}
          </span>
        </div>
      )}
      <nav className="pl-4 pr-8 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span
          ref={headerLogoRef}
          className="font-display text-lg tracking-tight text-ink"
          style={{ opacity: isDone ? 1 : 0 }}
        >
          CampusConnect
        </span>
        <div
          className="flex gap-6 items-center transition-opacity duration-500"
          style={{ opacity: isDone ? 1 : 0 }}
        >
          <Link to="/login" className="text-sm text-muted hover:text-ink transition">
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-ink text-white px-4 py-2 rounded-md hover:bg-ink/90 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div
        className="flex-1 flex items-center transition-opacity duration-700"
        style={{ opacity: isDone ? 1 : 0 }}
      >
        <div className="max-w-5xl mx-auto px-8 w-full">
          <div className="max-w-xl">
            <p className="text-muted text-sm mb-4">For students, by students</p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.1] text-ink">
              Everything happening on campus, in one place.
            </h1>
            <p className="text-muted mt-6 text-lg leading-relaxed">
              Find your societies, register for events, and keep up with what's
              happening — without digging through five different group chats.
            </p>
            <div className="flex gap-3 mt-8">
              <Link
                to="/register"
                className="bg-ink text-white px-6 py-3 rounded-md font-medium hover:bg-ink/90 transition"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="border border-line text-ink px-6 py-3 rounded-md font-medium hover:bg-white transition"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-t border-line transition-opacity duration-700"
        style={{ opacity: isDone ? 1 : 0 }}
      >
        <div className="max-w-5xl mx-auto px-8 py-6 flex flex-wrap gap-x-10 gap-y-2 text-sm text-muted">
          <span>Societies & clubs</span>
          <span>Event registration</span>
          <span>QR check-in</span>
          <span>Discussion forums</span>
        </div>
      </div>
    </div>
  );
}

export default Landing;