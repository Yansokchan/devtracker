require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || "google/flan-t5-large";

// Reusable function for Hugging Face API call
async function getTaskSuggestions(title, description, hfToken, model) {
  const prompt = `Given the following task title and description, suggest a list of relevant tags and a list of steps (subtasks) to complete the task. Respond in JSON: { "tags": [...], "steps": [...] }\nTask: ${title}\nDescription: ${description}`;
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  const data = await response.json();
  let text = "";
  if (Array.isArray(data)) {
    text = data[0]?.generated_text || "";
  } else if (data.generated_text) {
    text = data.generated_text;
  } else if (typeof data === "string") {
    text = data;
  }
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse model output: " + text);
  }
  console.log("Hugging Face raw response:", data);
  return result;
}

app.post("/api/generate-task-suggestions", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required." });
  }
  try {
    const suggestions = await getTaskSuggestions(
      title,
      description,
      HF_TOKEN,
      HF_MODEL
    );
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Hugging Face proxy server running on port ${PORT}`);
});
