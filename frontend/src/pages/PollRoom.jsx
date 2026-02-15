import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import VoteOption from "../components/VoteOption";
import ErrorMessage from "../components/ErrorMessage";
import { getPoll, votePoll, getStreamUrl } from "../utils/api";

export default function PollRoom() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const eventSourceRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const voted = localStorage.getItem(`poll_${pollId}_voted`);
    const optionId = localStorage.getItem(`poll_${pollId}_optionId`);
    if (voted) {
      setHasVoted(true);
      setVotedOptionId(optionId);
    }
  }, [pollId]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const data = await getPoll(pollId);
        setPoll(data);
        setError("");
      } catch (err) {
        if (err.message === "Poll not found") {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [pollId]);

  useEffect(() => {
    if (notFound) return;
    const streamUrl = getStreamUrl(pollId);
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPoll(data);
        setIsConnected(true);
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };
    eventSource.onerror = () => setIsConnected(false);

    return () => eventSource.close();
  }, [pollId, notFound]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleVote = async (optionId) => {
    if (hasVoted || votingInProgress) return;
    setVotingInProgress(true);
    try {
      const data = await votePoll(pollId, optionId);
      setPoll(data);
      setHasVoted(true);
      setVotedOptionId(optionId);
      localStorage.setItem(`poll_${pollId}_voted`, "true");
      localStorage.setItem(`poll_${pollId}_optionId`, optionId);
      showToast("Your vote has been recorded! 🎉");
    } catch (err) {
      if (err.message.includes("already voted")) {
        setHasVoted(true);
        localStorage.setItem(`poll_${pollId}_voted`, "true");
        showToast("You have already voted in this poll", "error");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setVotingInProgress(false);
    }
  };

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(
      () => showToast("Link copied to clipboard! 📋"),
      () => showToast("Failed to copy link", "error"),
    );
  };
  if (notFound) {
    return (
      <div className="page-container">
        <div
          className="glass-card text-center animate-fade-in-up"
          style={{ maxWidth: "440px", padding: "48px 36px" }}
        >
          <div className="text-5xl mb-5">🔍</div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #fff, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Poll Not Found
          </h1>
          <p
            className="text-sm mb-7"
            style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
          >
            This poll doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="btn-primary"
            style={{ textDecoration: "none" }}
          >
            ← Create a New Poll
          </Link>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="page-container">
        <div
          className="glass-card animate-fade-in-up"
          style={{ maxWidth: "580px", width: "100%", padding: "40px" }}
        >
          <div
            className="skeleton mb-3"
            style={{ height: "24px", width: "60%" }}
          />
          <div
            className="skeleton mb-8"
            style={{ height: "14px", width: "30%" }}
          />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "76px", borderRadius: "var(--radius-lg)" }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="page-container">
      <div className="w-full" style={{ maxWidth: "580px" }}>
        <div className="flex items-center justify-between mb-5 animate-fade-in-up">
          <Link
            to="/"
            className="btn-secondary"
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            ← Back
          </Link>
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: isConnected
                ? "rgba(16, 185, 129, 0.08)"
                : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)"}`,
              borderRadius: "999px",
            }}
          >
            <span
              className={`status-dot ${isConnected ? "connected" : "disconnected"}`}
            />
            <span
              className="text-xs font-medium"
              style={{
                color: isConnected ? "var(--success)" : "var(--warning)",
              }}
            >
              {isConnected ? "Live" : "Reconnecting…"}
            </span>
          </div>
        </div>

        <div
          className="glass-card animate-fade-in-up animate-delay-1"
          style={{ padding: "36px" }}
        >
      
          <h1
            className="font-bold mb-1.5"
            style={{
              background: "linear-gradient(135deg, #ffffff, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "22px",
              lineHeight: "1.35",
            }}
          >
            {poll.question}
          </h1>

          <p
            className="mb-6"
            style={{ color: "var(--text-muted)", fontSize: "13px" }}
          >
            {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"} total
          </p>

          {hasVoted && (
            <div
              className="flex items-center gap-2.5 mb-5 animate-fade-in-scale"
              style={{
                padding: "12px 16px",
                background: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--success)",
                  fontSize: "11px",
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span className="text-sm" style={{ color: "var(--success)" }}>
                You voted for{" "}
                <strong>
                  {poll.options.find((o) => o._id === votedOptionId)?.text ||
                    "an option"}
                </strong>
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {poll.options.map((option, index) => (
              <VoteOption
                key={option._id}
                option={option}
                totalVotes={poll.totalVotes}
                hasVoted={hasVoted}
                isSelected={votedOptionId === option._id}
                votingInProgress={votingInProgress}
                onVote={handleVote}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-5 animate-fade-in-up animate-delay-3">
          <button className="btn-secondary" onClick={copyLink}>
            📋 Copy Link
          </button>
          <Link
            to="/"
            className="btn-secondary"
            style={{ textDecoration: "none" }}
          >
            ✨ Create New Poll
          </Link>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
