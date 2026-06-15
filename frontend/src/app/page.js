"use client";
import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import VoiceButton from "@/components/VoiceButton";
import ExplanationDisplay from "@/components/ExplanationDisplay";
import QuizDisplay from "@/components/QuizDisplay";
import SessionHistory from "@/components/SessionHistory";
import { parseCommand, explainTopic, generateQuiz } from "@/lib/api";

export default function Home() {
  const [mode, setMode] = useState("explain");
  const [language, setLanguage] = useState("Hinglish");
  const [grade, setGrade] = useState("6");
  const [isProcessing, setIsProcessing] = useState(false);

  const [explanation, setExplanation] = useState(null);
  const [explanationMeta, setExplanationMeta] = useState({});
  const [quizData, setQuizData] = useState(null);
  const [quizTopic, setQuizTopic] = useState("");

  const [history, setHistory] = useState([]);

  const addToHistory = useCallback((entry) => {
    setHistory((prev) => [{ ...entry, timestamp: Date.now() }, ...prev]);
  }, []);

  const handleCommand = useCallback(
    async (transcript) => {
      if (!transcript.trim() || isProcessing) return;

      setIsProcessing(true);

      try {
        let commandData;
        try {
          commandData = await parseCommand(transcript);
        } catch {
          commandData = {
            intent: mode,
            topic: transcript,
            grade: grade,
            language: language,
          };
        }

        const intent = commandData.intent || mode;
        const topic = commandData.topic || transcript;
        const cmdLanguage = commandData.language || language;
        const cmdGrade = commandData.grade || grade;

        addToHistory({
          command: transcript,
          intent,
          topic,
          language: cmdLanguage,
          grade: cmdGrade,
        });

        if (intent === "quiz") {
          setMode("quiz");
          setExplanation(null);
          const quiz = await generateQuiz(topic);
          setQuizData(quiz);
          setQuizTopic(topic);
        } else {
          setMode("explain");
          setQuizData(null);
          const result = await explainTopic(topic, cmdLanguage, cmdGrade);
          setExplanation(result);
          setExplanationMeta({ topic, language: cmdLanguage, grade: cmdGrade });
        }
      } catch (error) {
        console.error("Command processing failed:", error);
        setExplanation(
          "⚠️ Sorry, something went wrong. Please check if the backend is running and try again."
        );
        setExplanationMeta({ topic: "Error", language, grade });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, mode, language, grade, addToHistory]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__simulateCommand = (text) => {
        window.__lastCommandPromise = handleCommand(text);
      };
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.__simulateCommand;
      }
    };
  }, [handleCommand]);

  const handleReplay = useCallback(
    (item) => {
      handleCommand(item.command || item.topic);
    },
    [handleCommand]
  );

  const handleQuizRetry = useCallback(async () => {
    if (!quizTopic) return;
    setIsProcessing(true);
    try {
      const quiz = await generateQuiz(quizTopic);
      setQuizData(quiz);
    } catch (error) {
      console.error("Quiz retry failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [quizTopic]);

  const dismissExplanation = useCallback(() => {
    setExplanation(null);
    setExplanationMeta({});
  }, []);

  const dismissQuiz = useCallback(() => {
    setQuizData(null);
    setQuizTopic("");
  }, []);

  return (
    <>
      <Header
        mode={mode}
        onModeChange={setMode}
        language={language}
        onLanguageChange={setLanguage}
        grade={grade}
        onGradeChange={setGrade}
      />

      <main className="mainContent" data-has-content={!!(explanation || quizData)}>
        {/* Dark Hero Section */}
        <section className="heroContainer">
          <div className="heroContent">
            <h1 className="heroTitle">
              Your AI Powered Future, <br /> Starts in the Classroom
            </h1>
            <p className="heroSubtitle">
              Voice-powered teaching assistant for smart classrooms. Just speak
              — AI samjhayega! 🎙️
            </p>

            {/* Voice Command Hub inside hero */}
            <div style={{ marginTop: "4rem" }}>
              <VoiceButton
                onCommand={handleCommand}
                isProcessing={isProcessing}
                language={language}
              />
            </div>
          </div>
        </section>

        {/* Light Content Section */}
        <div className="dashboard">
          <div className="displayArea" id="display-area">
            {explanation && (
              <ExplanationDisplay
                explanation={explanation}
                topic={explanationMeta.topic}
                language={explanationMeta.language}
                grade={explanationMeta.grade}
                onDismiss={dismissExplanation}
              />
            )}

            {quizData && (
              <QuizDisplay
                quizData={quizData}
                topic={quizTopic}
                onDismiss={dismissQuiz}
                onRetry={handleQuizRetry}
              />
            )}
          </div>
        </div>
      </main>

      <SessionHistory history={history} onReplay={handleReplay} />
    </>
  );
}
