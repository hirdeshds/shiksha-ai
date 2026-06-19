"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import styles from "./ExplanationDisplay.module.css";

export default function ExplanationDisplay({ explanation, topic, language, grade, onDismiss, isMicListening }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const indexRef = useRef(0);
  const { playPop } = useSoundEffects();
  const wasSpeakingRef = useRef(false);

  const explanationObj = useMemo(() => {
    if (typeof explanation === "string") {
      return {
        title: topic,
        concept: explanation,
        analogy: "",
        key_points: [],
        vocabulary: [],
        fun_fact: "",
      };
    }

    return explanation || {};
  }, [explanation, topic]);

  const { title, concept, analogy, key_points, vocabulary, fun_fact } = explanationObj;
  const explanationText = concept || "";
  const isHindi = language === "Hindi";

  const buildSpeakText = useCallback(() => {
    let textToSpeak = `${title || topic}. `;
    if (concept) textToSpeak += `${concept}. `;

    if (analogy && analogy !== "N/A") {
      textToSpeak += `Analogy: ${analogy}. `;
    }

    if (key_points && key_points.length > 0) {
      textToSpeak += `Key points: ${key_points.join(". ")}. `;
    }

    if (vocabulary && vocabulary.length > 0) {
      textToSpeak += "Vocabulary terms: ";
      vocabulary.forEach((v) => {
        textToSpeak += `${v.word}: ${v.definition}. `;
      });
    }

    if (fun_fact && fun_fact !== "N/A") {
      textToSpeak += `Fun fact: ${fun_fact}. `;
    }

    return textToSpeak;
  }, [analogy, concept, fun_fact, key_points, title, topic, vocabulary]);

  useEffect(() => {
    if (isMicListening) {
      if (isSpeaking) {
        wasSpeakingRef.current = true;
        stop();
      }
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false;
      const lang = language === "Hindi" ? "hi-IN" : language === "English" ? "en-IN" : "hi-IN";
      speak(buildSpeakText(), lang);
    }
  }, [isMicListening, isSpeaking, speak, stop, language, buildSpeakText]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (!explanationText) return;

    indexRef.current = 0;
    const resetTyping = window.setTimeout(() => {
      setDisplayedText("");
      setIsTyping(true);
    }, 0);

    const interval = setInterval(() => {
      if (indexRef.current < explanationText.length) {
        setDisplayedText(explanationText.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => {
      window.clearTimeout(resetTyping);
      clearInterval(interval);
    };
  }, [explanationText]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const lang = language === "Hindi" ? "hi-IN" : language === "English" ? "en-IN" : "hi-IN";
      speak(buildSpeakText(), lang);
    }
  };

  const getTopicIcon = () => {
    const topicLower = topic?.toLowerCase() || "";
    if (topicLower.includes("math") || topicLower.includes("fraction") || topicLower.includes("algebra")) return "M";
    if (topicLower.includes("science") || topicLower.includes("physics")) return "S";
    if (topicLower.includes("bio") || topicLower.includes("photo") || topicLower.includes("plant")) return "B";
    if (topicLower.includes("chem")) return "C";
    if (topicLower.includes("history") || topicLower.includes("mughal")) return "H";
    if (topicLower.includes("geo") || topicLower.includes("earth")) return "G";
    if (topicLower.includes("english") || topicLower.includes("grammar")) return "E";
    if (topicLower.includes("hindi")) return "HI";
    if (topicLower.includes("computer") || topicLower.includes("coding")) return "AI";
    return "AI";
  };

  if (!explanation) return null;

  return (
    <div className={styles.explanationCard} id="explanation-display">
      <div className={styles.cardHeader}>
        <div className={styles.topicSection}>
          <div className={styles.topicIcon}>{getTopicIcon()}</div>
          <div>
            <span className={styles.panelEyebrow}>
              {isHindi ? "Showing lesson" : "Showing explanation"}
            </span>
            <h2 className={styles.topicName}>{title || topic}</h2>
          </div>
        </div>
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles.langBadge}`}>{language}</span>
          <span className={`${styles.badge} ${styles.gradeBadge}`}>Class {grade}</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <section className={styles.primaryPanel}>
          <h3 className={styles.panelTitle} style={{ color: "#38bdf8" }}>
            Concept
          </h3>
          <div className={styles.explanationText}>
            {displayedText}
            {isTyping && <span className={styles.cursor} />}
          </div>
        </section>

        <div className={styles.detailGrid}>
          {key_points && key_points.length > 0 && (
            <section className={styles.panelCard} data-type="key-points">
              <h3 className={styles.panelTitle} style={{ color: "#10b981" }}>
                Key points
              </h3>
              <ul className={styles.pointsList}>
                {key_points.map((point, index) => (
                  <li key={index} className={styles.pointItem}>
                    <span className={styles.pointMarker}>{index + 1}</span>
                    <span className={styles.pointText}>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analogy && analogy !== "N/A" && (
            <section className={styles.panelCard} data-type="analogy">
              <h3 className={styles.panelTitle} style={{ color: "#f43f5e" }}>
                Analogy
              </h3>
              <p className={styles.analogyText}>{`"${analogy}"`}</p>
            </section>
          )}

          {vocabulary && vocabulary.length > 0 && (
            <section className={styles.panelCard} data-type="vocabulary">
              <h3 className={styles.panelTitle} style={{ color: "#a855f7" }}>
                Vocabulary
              </h3>
              <div className={styles.vocabGrid}>
                {vocabulary.map((v, index) => (
                  <div key={index} className={styles.vocabItem}>
                    <strong className={styles.vocabTerm}>{v.word}</strong>
                    <span className={styles.vocabDefinition}>{v.definition}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {fun_fact && fun_fact !== "N/A" && (
            <section className={`${styles.panelCard} ${styles.funFactCard}`}>
              <h3 className={styles.panelTitle} style={{ color: "#facc15" }}>
                Fun fact
              </h3>
              <div className={styles.funFactContent}>{fun_fact}</div>
            </section>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button
          className={styles.speakBtn}
          onClick={() => { playPop(); handleSpeak(); }}
          data-speaking={isSpeaking}
        >
          {isSpeaking ? "Stop" : "Read aloud"}
        </button>
        <button className={styles.dismissBtn} onClick={() => { playPop(); onDismiss(); }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
