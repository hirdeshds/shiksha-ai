"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTilt } from "@/hooks/useTilt";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import styles from "./QuizDisplay.module.css";

const TIMER_SECONDS = 15;
const CIRCUMFERENCE = 2 * Math.PI * 22;

function Confetti() {
  const pieces = Array.from({ length: 80 }, (_, i) => {
    const colors = ["#ED0331", "#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 2.5 + Math.random() * 2;
    const width = 8 + Math.random() * 8;
    const height = 15 + Math.random() * 15;
    const rotation = Math.random() * 360;

    return (
      <div
        key={i}
        className={styles.confettiPiece}
        style={{
          left: `${left}%`,
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? "50%" : "4px",
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  });

  return <div className={styles.confettiContainer}>{pieces}</div>;
}

export default function QuizDisplay({ quizData, topic, onDismiss, onRetry, language, grade, isMicListening }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showConfetti, setShowConfetti] = useState(false);

  const timerRef = useRef(null);
  const cardRef = useTilt({ max: 5, scale: 1.01 });
  const { playPop, playCorrect, playWrong } = useSoundEffects();
  const { speak, stop } = useSpeechSynthesis();

  const questions = quizData?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Reset state when new quiz data is received (e.g. on Try Again)
  useEffect(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsFinished(false);
    setTimeLeft(TIMER_SECONDS);
    setShowConfetti(false);
    stop(); // Stop any ongoing speech
  }, [quizData, stop]);

  // Read question and options aloud
  useEffect(() => {
    stop(); // Always stop previous speech when state changes

    if (isFinished || showResult || !currentQuestion || isMicListening) return;

    const labels = ["A", "B", "C", "D"];
    let textToSpeak = `Question ${currentIndex + 1}. ${currentQuestion.question}. `;
    if (currentQuestion.options) {
      currentQuestion.options.forEach((opt, idx) => {
        textToSpeak += `Option ${labels[idx]}: ${opt}. `;
      });
    }

    const timeout = setTimeout(() => {
      const lang = language === "Hindi" ? "hi-IN" : language === "English" ? "en-IN" : "hi-IN";
      speak(textToSpeak, lang);
    }, 500);

    return () => clearTimeout(timeout);
  }, [currentIndex, currentQuestion, isFinished, showResult, speak, stop, language, isMicListening]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (isFinished || showResult) return;

    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          playWrong();
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isFinished, showResult, playWrong]);

  const handleOptionClick = useCallback(
    (e, option) => {
      if (showResult || isFinished) return;
      clearInterval(timerRef.current);

      // Add Ripple
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const circle = document.createElement("span");
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const radius = diameter / 2;
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${x - radius}px`;
      circle.style.top = `${y - radius}px`;
      circle.classList.add(styles.ripple);

      const existingRipple = btn.querySelector(`.${styles.ripple}`);
      if (existingRipple) existingRipple.remove();
      btn.appendChild(circle);

      // Check answer
      setSelectedOption(option);
      setShowResult(true);

      if (option === currentQuestion?.answer) {
        setScore((prev) => prev + 1);
        playCorrect();
      } else {
        playWrong();
      }
    },
    [showResult, isFinished, currentQuestion, playCorrect, playWrong]
  );

  useEffect(() => {
    if (!showResult) return;

    const timeout = setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setShowResult(false);
      } else {
        setIsFinished(true);
        if (score >= 3) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      }
    }, 2000); // Wait 2s to show correct answer

    return () => clearTimeout(timeout);
  }, [showResult, currentIndex, questions.length, score]);

  const getResultForOption = (option) => {
    if (!showResult) return undefined;
    if (option === currentQuestion?.answer) return "correct";
    if (option === selectedOption && option !== currentQuestion?.answer) return "wrong";
    if (option === currentQuestion?.answer && selectedOption !== option) return "reveal";
    return undefined;
  };

  const timerProgress = timeLeft / TIMER_SECONDS;
  const dashOffset = CIRCUMFERENCE * (1 - timerProgress);
  const timerColor =
    timeLeft > 10 ? "#10b981" : timeLeft > 5 ? "#f59e0b" : "#ef4444";

  const isHindi = language === "Hindi";

  if (!questions.length) {
    return (
      <div className={styles.questionCard} style={{ textAlign: "center" }}>
        <p style={{ color: "var(--danger)" }}>
          {isHindi 
            ? "⚠️ कोई क्विज़ प्रश्न नहीं बने। कृपया फिर से प्रयास करें।" 
            : "⚠️ No quiz questions were generated. Please try again."}
        </p>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 60 ? "⭐" : percentage >= 40 ? "👍" : "📚";
    
    let message = "";
    if (language === "English") {
      message =
        percentage >= 80 ? "Outstanding! Well done!"
          : percentage >= 60 ? "Good job! Well done!"
            : percentage >= 40 ? "Keep trying! Work harder!"
              : "Let's practice more!";
    } else if (isHindi) {
      message =
        percentage >= 80 ? "शानदार! बहुत बढ़िया!"
          : percentage >= 60 ? "अच्छा प्रयास! बहुत अच्छा!"
            : percentage >= 40 ? "कोशिश करते रहें! और मेहनत करें!"
              : "चलो और अभ्यास करें! और पढ़ें!";
    } else {
      message =
        percentage >= 80 ? "Outstanding! Bahut badhiya!"
          : percentage >= 60 ? "Good job! Accha kiya!"
            : percentage >= 40 ? "Keep trying! Aur mehnat karo!"
              : "Let's practice more! Aur padho!";
    }

    return (
      <>
        {showConfetti && <Confetti />}
        <div className={styles.resultsCard} ref={cardRef}>
          <div className={styles.resultsEmoji}>{emoji}</div>
          <h2 className={styles.resultsTitle}>
            {isHindi ? "क्विज़ समाप्त!" : "Quiz Complete!"}
          </h2>
          <div className={styles.resultsScore}>
            {score}/{questions.length}
          </div>
          <p className={styles.resultsSubtext}>{message}</p>
          <div className={styles.resultsActions}>
            <button className={styles.retryBtn} onClick={() => { playPop(); onRetry(); }}>
              {isHindi ? "फिर से खेलें" : "Try Again"}
            </button>
            <button className={styles.closeBtn} onClick={() => { playPop(); onDismiss(); }}>
              {isHindi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>
            {isHindi 
              ? `प्रश्न ${currentIndex + 1} / ${questions.length}` 
              : `Question ${currentIndex + 1} of ${questions.length}`}
          </span>
          <span className={styles.scoreLabel}>
            {isHindi ? `स्कोर: ${score}` : `Score: ${score}`}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.questionCard} ref={cardRef} key={currentIndex}>
        <div className={styles.cardContent}>
          <div className={styles.questionHeader}>
            <span className={styles.questionNumber}>
              {isHindi ? `प्रश्न ${currentIndex + 1}` : `Question ${currentIndex + 1}`}
            </span>
            <div className={styles.timer}>
              <svg className={styles.timerSvg} viewBox="0 0 48 48">
                <circle className={styles.timerBg} cx="24" cy="24" r="22" />
                <circle
                  className={styles.timerFill}
                  cx="24"
                  cy="24"
                  r="22"
                  stroke={timerColor}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <span className={styles.timerText} data-warning={timeLeft <= 5}>
                {timeLeft}
              </span>
            </div>
          </div>

          <h3 className={styles.questionText}>{currentQuestion?.question}</h3>

          <div className={styles.optionsGrid}>
            {currentQuestion?.options?.map((option, idx) => {
              const labels = ["A", "B", "C", "D"];
              return (
                <button
                  key={idx}
                  className={styles.optionBtn}
                  data-result={getResultForOption(option)}
                  onClick={(e) => handleOptionClick(e, option)}
                  disabled={showResult}
                >
                  <div className={styles.optionContent}>
                    <span className={styles.optionLabel}>{labels[idx]}</span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
