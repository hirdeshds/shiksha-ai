"use client";
import { useEffect, useCallback, useRef } from "react";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import WaveformVisualizer from "./WaveformVisualizer";
import styles from "./VoiceButton.module.css";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function VoiceButton({ onCommand, isProcessing, language, onListeningChange }) {
  const recognitionLang = language === "Hindi" ? "hi-IN" : "en-IN";

  const {
    isListening,
    transcript,
    finalTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({ lang: recognitionLang });

  const { playPop } = useSoundEffects();
  const magneticRef = useRef(null);
  const wrapperRef = useRef(null);

  // Notify parent of listening state changes
  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  // Magnetic button effect
  useEffect(() => {
    const magnetic = magneticRef.current;
    const wrapper = wrapperRef.current;
    if (!magnetic || !wrapper) return;

    if (window.matchMedia("(hover: none)").matches) return;

    const handleMouseMove = (e) => {
      const rect = magnetic.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Move the button slightly towards the cursor (magnetic pull)
      wrapper.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    };

    const handleMouseLeave = () => {
      wrapper.style.transform = "translate(0px, 0px)";
    };

    magnetic.addEventListener("mousemove", handleMouseMove);
    magnetic.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      magnetic.removeEventListener("mousemove", handleMouseMove);
      magnetic.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (finalTranscript && !isProcessing) {
      onCommand(finalTranscript);
      setTimeout(() => resetTranscript(), 500);
    }
  }, [finalTranscript, isProcessing, onCommand, resetTranscript]);

  const handleClick = useCallback(() => {
    if (isProcessing) return;
    playPop();

    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }, [isListening, isProcessing, startListening, stopListening, resetTranscript, playPop]);

  if (!isSupported) {
    return (
      <div style={{ color: "var(--danger)", textAlign: "center" }}>
        Voice recognition is not supported in this browser.
      </div>
    );
  }

  const state = isProcessing ? "processing" : isListening ? "listening" : "idle";

  return (
    <div className={styles.voiceSection} id="voice-section">
      <div className={styles.magneticArea} ref={magneticRef}>
        <div className={styles.buttonWrapper} ref={wrapperRef}>
          <div className={`${styles.ring} ${styles.ring1}`} data-listening={isListening} />
          <div className={`${styles.ring} ${styles.ring2}`} data-listening={isListening} />
          <div className={`${styles.ring} ${styles.ring3}`} data-listening={isListening} />
          <button
            className={styles.micButton}
            data-state={state}
            onClick={handleClick}
          >
            {isProcessing ? (
              <div className={styles.processingSpinner} />
            ) : (
              <span className={styles.micIcon}>{isListening ? "🔴" : "🎤"}</span>
            )}
          </button>
        </div>
      </div>

      <WaveformVisualizer isActive={isListening} />

      <p className={styles.statusText} data-listening={isListening} data-processing={isProcessing}>
        {isProcessing
          ? "Processing your command..."
          : isListening
            ? "Listening... speak now"
            : "Tap the mic to start"}
      </p>

      {(transcript || finalTranscript) && (
        <div className={styles.transcript}>
          {transcript || finalTranscript}
          {isListening && <span className={styles.transcriptCursor} />}
        </div>
      )}

      {!isListening && !isProcessing && (
        <p className={styles.hint}>
          Try: &quot;Explain photosynthesis in Hinglish&quot;
        </p>
      )}
    </div>
  );
}
