import { useState } from "react";
import { Win } from "../../config";
import { generateUUID } from "../../utils.ts";

export default function WinsTab({
  wins,
  setWins,
}: {
  wins: Win[];
  setWins: (wins: Win[]) => void;
}) {
  const [newWin, setNewWin] = useState("");

  const addWin = () => {
    if (!newWin.trim()) return;
    setWins([...wins, { id: generateUUID(), content: newWin }]);
    setNewWin("");
  };

  const deleteWin = (id: string) => {
    setWins(wins.filter((w) => w.id !== id));
  };

  return (
    <div className="panel active" style={{ padding: "1rem" }}>
      <p className="tip">
        Log every win. Solved a problem, shipped code — all of it.
      </p>

      <div className="add-win" style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="e.g. Solved sliding window without hints"
          value={newWin}
          onChange={(e) => setNewWin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addWin()}
          autoComplete="off"
        />
        <button
          onClick={addWin}
          style={{
            padding: "5px 13px",
            background: "#534AB7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          Add
        </button>
      </div>

      {wins.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#666" }}>
          No wins yet — add your first one above.
        </p>
      ) : (
        <div>
          {[...wins].reverse().map((win) => (
            <span
              key={win.id}
              className="win-chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {win.content}
              <button
                onClick={() => deleteWin(win.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "10px",
                  padding: "0 2px",
                  lineHeight: "1",
                }}
                title="Delete win"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
