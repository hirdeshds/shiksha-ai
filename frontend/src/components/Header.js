"use client";
import { useState, useEffect } from "react";
import { checkHealth } from "@/lib/api";
import styles from "./Header.module.css";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function Header({ mode, onModeChange, language, onLanguageChange, grade, onGradeChange }) {
  const [isOnline, setIsOnline] = useState(false);
  const { playPop } = useSoundEffects();

  useEffect(() => {
    const check = async () => {
      const healthy = await checkHealth();
      setIsOnline(healthy);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = (newMode) => {
    if (mode !== newMode) {
      playPop();
      onModeChange(newMode);
    }
  };

  return (
    <header className={styles.header} id="main-header">
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>🎓</div>
        <div>
          <div className={styles.logoText}>Shiksha AI</div>
          <div className={styles.logoSubtext}>Voice Teaching Assistant</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.modeToggle}>
          <button
            className={styles.modeBadge}
            data-active={mode === "explain"}
            onClick={() => handleModeChange("explain")}
          >
            Explain
          </button>
          <button
            className={styles.modeBadge}
            data-active={mode === "quiz"}
            onClick={() => handleModeChange("quiz")}
          >
            Quiz
          </button>
        </div>

        <div className={styles.selectWrapper}>
          <span className={styles.selectLabel}>Lang:</span>
          <select
            className={styles.select}
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="Hinglish">Hinglish</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <span className={styles.selectLabel}>Class:</span>
          <select
            className={styles.select}
            value={grade}
            onChange={(e) => onGradeChange(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.statusWrapper}>
          <div className={styles.statusDot} data-offline={!isOnline} />
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}
