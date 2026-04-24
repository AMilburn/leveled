import { STATS } from "../config/stats";
import { getActivityMeta, calculatePointsPreview } from "../config/stats";
import { StatType } from "../config/stats";

const PLURAL_EXCEPTIONS: Record<string, string> = {
  fix: "fixes",
  story: "stories",
  company: "companies",
  pr: "PRs",
};

function pluralize(unit: string): string {
  return PLURAL_EXCEPTIONS[unit] ?? `${unit}s`;
}

interface Props {
  activityLabel: string;
  amount: string;
  note: string;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogActivityModal({
  activityLabel,
  amount,
  note,
  onAmountChange,
  onNoteChange,
  onConfirm,
  onCancel,
}: Props) {
  const meta = getActivityMeta(activityLabel);
  const stat = meta?.stat as StatType | null;
  const statColor = stat ? STATS[stat].color : "#534AB7";
  const statName = stat ? STATS[stat].fullName : "";
  const pointsPreview = calculatePointsPreview(meta?.pointValue ?? 0, parseInt(amount) || 1);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "min(420px, 100%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ background: statColor, padding: "16px 20px", color: "white" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", opacity: 0.8, textTransform: "uppercase", marginBottom: "4px" }}>
            {statName}
          </div>
          <div style={{ fontSize: "16px", fontWeight: "700" }}>
            {activityLabel}
          </div>
          <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "2px" }}>
            {meta?.pointValue} pts / {meta?.unit}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#444", display: "block", marginBottom: "6px" }}>
              How many {meta ? pluralize(meta.unit) : ""}?
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#444", display: "block", marginBottom: "6px" }}>
              Note <span style={{ fontWeight: "400", color: "#999" }}>(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="e.g. Two Trees problem, dynamic programming..."
              onKeyDown={(e) => { if (e.key === "Enter") onConfirm(); }}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {/* Points preview */}
          <div style={{ fontSize: "13px", color: "#666", background: "#f9f9f9", borderRadius: "6px", padding: "10px 12px" }}>
            You'll earn <strong style={{ color: statColor }}>+{pointsPreview} pts</strong> toward {statName}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "14px",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#555",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 2,
                padding: "12px",
                fontSize: "14px",
                background: statColor,
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Log Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
