"use client";
import { useState, useEffect, useRef } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useTilt } from "@/hooks/useTilt";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import styles from "./ExplanationDisplay.module.css";

export default function ExplanationDisplay({ explanation, topic, language, grade, onDismiss }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const indexRef = useRef(0);
  const { playPop } = useSoundEffects();

  // Apply 3D tilt effect
  const cardRef = useTilt({ max: 8, scale: 1.01 });

  // Typewriter effect
  useEffect(() => {
    if (!explanation) return;

    setDisplayedText("");
    indexRef.current = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      if (indexRef.current < explanation.length) {
        setDisplayedText(explanation.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [explanation]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const lang = language === "Hindi" ? "hi-IN" : language === "English" ? "en-IN" : "hi-IN";
      speak(explanation, lang);
    }
  };

  const getTopicIcon = () => {
    const topicLower = topic?.toLowerCase() || "";
    if (topicLower.includes("math") || topicLower.includes("fraction") || topicLower.includes("algebra")) return "📐";
    if (topicLower.includes("science") || topicLower.includes("physics")) return "🔬";
    if (topicLower.includes("bio") || topicLower.includes("photo") || topicLower.includes("plant")) return "🌱";
    if (topicLower.includes("chem")) return "⚗️";
    if (topicLower.includes("history") || topicLower.includes("mughal")) return "📜";
    if (topicLower.includes("geo") || topicLower.includes("earth")) return "🌍";
    if (topicLower.includes("english") || topicLower.includes("grammar")) return "📝";
    if (topicLower.includes("hindi")) return "📖";
    if (topicLower.includes("computer") || topicLower.includes("coding")) return "💻";
    return "📚";
  };

  if (!explanation) return null;

  return (
    <div className={styles.explanationCard} ref={cardRef} id="explanation-display">
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.topicSection}>
            <div className={styles.topicIcon}>{getTopicIcon()}</div>
            <h2 className={styles.topicName}>{topic}</h2>
          </div>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.langBadge}`}>
              🌐 {language}
            </span>
            <span className={`${styles.badge} ${styles.gradeBadge}`}>
              🎓 Class {grade}
            </span>
          </div>
        </div>

        <div className={styles.explanationText}>
          {displayedText}
          {isTyping && <span className={styles.cursor} />}
        </div>

        <div className={styles.cardFooter}>
          <button
            className={styles.speakBtn}
            onClick={handleSpeak}
            data-speaking={isSpeaking}
          >
            {isSpeaking ? "⏹️ Stop" : "🔊 Read Aloud"}
          </button>
          <button className={styles.dismissBtn} onClick={onDismiss}>
            ✕ Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
