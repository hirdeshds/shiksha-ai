const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
  const res = await fetch(`${API_BASE}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language, grade }),
  });

  if (!res.ok) {
    throw new Error(`Explanation failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

export async function generateQuiz(topic, language, grade) {
  const res = await fetch(`${API_BASE}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, language, grade }),
  });

  if (!res.ok) {
    throw new Error(`Quiz generation failed: ${res.status}`);
  }

  const json = await res.json();

  // The backend returns the quiz as a JSON string, parse it
  if (typeof json.data === "string") {
    try {
      return JSON.parse(json.data);
    } catch {
      // Try to extract JSON from markdown code blocks
      const match = json.data.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        return JSON.parse(match[1].trim());
      }
      throw new Error("Failed to parse quiz data");
    }
  }

  return json.data;
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
