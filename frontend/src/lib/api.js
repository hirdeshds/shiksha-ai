const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCacheKey(type, topic, language, grade) {
  return `shiksha-ai:${type}:${String(topic).trim().toLowerCase()}:${language}:${grade}`;
}

function readCachedData(key) {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, expiresAt } = JSON.parse(cached);
    if (!expiresAt || Date.now() > expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCachedData(key, data) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      })
    );
  } catch {
    // If storage is unavailable or full, keep the app working without cache.
  }
}

export async function parseCommand(text) {
  const res = await fetch(`${API_BASE}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Command parsing failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

export async function explainTopic(topic, language, grade) {
  const cacheKey = getCacheKey("explain", topic, language, grade);
  const cached = readCachedData(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language, grade }),
  });

  if (!res.ok) {
    throw new Error(`Explanation failed: ${res.status}`);
  }

  const json = await res.json();
  writeCachedData(cacheKey, json.data);
  return json.data;
}

export async function generateQuiz(topic, language, grade) {
  const cacheKey = getCacheKey("quiz", topic, language, grade);
  const cached = readCachedData(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language, grade }),
  });

  if (!res.ok) {
    throw new Error(`Quiz generation failed: ${res.status}`);
  }

  const json = await res.json();
  let quizData = json.data;

  // The backend returns the quiz as a JSON string, parse it
  if (typeof quizData === "string") {
    try {
      quizData = JSON.parse(quizData);
    } catch {
      // Try to extract JSON from markdown code blocks
      const match = quizData.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        quizData = JSON.parse(match[1].trim());
      } else {
        throw new Error("Failed to parse quiz data");
      }
    }
  }

  writeCachedData(cacheKey, quizData);
  return quizData;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
