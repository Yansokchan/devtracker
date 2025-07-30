// Utility to call Gemini API for AI tag/step generation
export async function aiGenerate({
  title,
  description,
  tagCount,
  stepCount,
  apiKey,
}: {
  title: string;
  description: string;
  tagCount: number;
  stepCount: number;
  apiKey: string;
}): Promise<{
  tags: string[];
  steps: { title: string; description: string }[];
}> {
  const prompt = `Given the following task title and description, generate:\n1. A list of exactly ${tagCount} relevant tags (as a JSON array of strings).\n2. A list of exactly ${stepCount} step objects (as a JSON array), each with \"title\" and \"description\".\n\nTask Title: ${title}\nTask Description: ${description}\n\nRespond with only valid JSON, no explanation, no markdown, and no code block.\n{\n  \"tags\": [...],\n  \"steps\": [{\"title\": \"...\", \"description\": \"...\"}, ...]\n}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) throw new Error("Failed to fetch AI suggestions");
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  let jsonText = text;
  const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1];
  }
  let suggestions;
  try {
    suggestions = JSON.parse(jsonText);
  } catch (e) {
    throw new Error("AI response was not valid JSON");
  }
  if (!Array.isArray(suggestions.tags) || !Array.isArray(suggestions.steps)) {
    throw new Error("AI response missing tags or steps");
  }
  return suggestions;
}
