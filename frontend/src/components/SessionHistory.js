"use client";
import { useState } from "react";
import styles from "./SessionHistory.module.css";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function SessionHistory({ history, onReplay }) {
  const [isOpen, setIsOpen] = useState(false);
  const { playPop } = useSoundEffects();

  const handleToggle = () => {
    playPop();
    setIsOpen(!isOpen);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <button className={styles.sidebarToggle} onClick={handleToggle}>
        📜
      </button>

      {isOpen && <div className={styles.overlay} onClick={handleToggle} />}

      <div className={styles.sidebar} data-open={isOpen}>
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Session History</h3>
          <button className={styles.closeBtn} onClick={handleToggle}>
            ✕
          </button>
        </div>

        <div className={styles.historyList}>
          {history.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🕰️</div>
              <p>No history yet.</p>
              <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Ask a question to see it here.
              </p>
            </div>
          ) : (
            history.map((item, idx) => (
              <div
                key={idx}
                className={styles.historyItem}
                onClick={() => {
                  playPop();
                  onReplay(item);
                  setIsOpen(false);
                }}
              >
                <div className={styles.historyItemHeader}>
                  <span className={styles.historyType} data-type={item.intent}>
                    {item.intent === "explain" ? "Explanation" : "Quiz"}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    • {item.language} • Class {item.grade}
                  </span>
                </div>
                <div className={styles.historyCommand}>{item.command}</div>
                <div className={styles.historyTime}>{formatTime(item.timestamp)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
