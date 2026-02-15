export default function VoteOption({
  option,
  totalVotes,
  hasVoted,
  isSelected,
  votingInProgress,
  onVote,
  index,
}) {
  const percentage =
    totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

  const colors = [
    "linear-gradient(135deg, #6366f1, #818cf8)",
    "linear-gradient(135deg, #ec4899, #f472b6)",
    "linear-gradient(135deg, #06b6d4, #67e8f9)",
    "linear-gradient(135deg, #10b981, #34d399)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    "linear-gradient(135deg, #ef4444, #f87171)",
    "linear-gradient(135deg, #6366f1, #38bdf8)",
    "linear-gradient(135deg, #f43f5e, #fb923c)",
    "linear-gradient(135deg, #14b8a6, #818cf8)",
  ];

  const dotColors = [
    "#818cf8",
    "#f472b6",
    "#67e8f9",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f87171",
    "#38bdf8",
    "#fb923c",
    "#818cf8",
  ];

  return (
    <button
      onClick={() => onVote(option._id)}
      disabled={hasVoted || votingInProgress}
      className={`vote-option w-full text-left ${isSelected ? "selected" : ""}`}
      style={{
        background: isSelected
          ? "rgba(139, 92, 246, 0.1)"
          : "rgba(255, 255, 255, 0.025)",
        border: isSelected
          ? "1.5px solid rgba(139, 92, 246, 0.3)"
          : "1.5px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "var(--radius-lg)",
        padding: "18px 22px",
        cursor: hasVoted || votingInProgress ? "default" : "pointer",
        opacity: votingInProgress && !isSelected ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isSelected ? (
            <span
              className="flex items-center justify-center animate-fade-in-scale"
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--success)",
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              ✓
            </span>
          ) : (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: dotColors[index % dotColors.length],
                opacity: 0.7,
                flexShrink: 0,
              }}
            />
          )}
          <span
            className="font-medium"
            style={{ color: "var(--text-primary)", fontSize: "14px" }}
          >
            {option.text}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {option.votes}
          </span>
          <span
            className="font-bold"
            style={{
              background: isSelected
                ? "rgba(139, 92, 246, 0.15)"
                : "rgba(255, 255, 255, 0.06)",
              color: isSelected
                ? "var(--accent-purple)"
                : "var(--text-secondary)",
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "999px",
              minWidth: "42px",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
          >
            {percentage}%
          </span>
        </div>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: colors[index % colors.length],
          }}
        />
      </div>
    </button>
  );
}
