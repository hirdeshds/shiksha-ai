"use client";
import { useEffect, useRef } from "react";
import styles from "./WaveformVisualizer.module.css";

export default function WaveformVisualizer({ isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 60;

    const bars = 24;
    const barWidth = 4;
    const gap = (canvas.width - bars * barWidth) / (bars + 1);

    let phase = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const x = gap + i * (barWidth + gap);

        let height;
        if (isActive) {
          // Dynamic waveform when listening
          height =
            8 +
            Math.sin(phase + i * 0.4) * 15 +
            Math.sin(phase * 1.5 + i * 0.7) * 8 +
            Math.random() * 5;
        } else {
          // Flat idle state
          height = 3;
        }

        height = Math.max(3, Math.min(height, canvas.height - 4));

        const y = (canvas.height - height) / 2;

        // Gradient color for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + height);
        if (isActive) {
          gradient.addColorStop(0, "#818cf8");
          gradient.addColorStop(0.5, "#6366f1");
          gradient.addColorStop(1, "#c084fc");
        } else {
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.1)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }

      phase += isActive ? 0.12 : 0.02;
      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className={styles.waveformContainer}>
      <canvas ref={canvasRef} className={styles.waveformCanvas} />
    </div>
  );
}
