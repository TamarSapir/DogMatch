// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

function fakeParsePreferences(text) {
  const lower = text.toLowerCase();
  const small =
    lower.includes("קטן") ||
    lower.includes("דירה") ||
    lower.includes("קטנה");
  const highEnergy =
    lower.includes("אנרגטי") ||
    lower.includes("רץ") ||
    lower.includes("ריצה");

  return {
    size: small ? "small" : "any",
    energy: highEnergy ? "high" : "low_or_medium",
  };
}

//check if valid
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function mapToPreferences(raw) {
  const sizeRaw = (raw?.size || "any").toLowerCase();
  const energyRaw = (raw?.energy || "medium").toLowerCase();

  const size = sizeRaw === "small" ? "small" : "any";
  const energy = energyRaw === "high" ? "high" : "low_or_medium";

  return { size, energy };
}

app.post("/api/onboarding", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "missing_text" });
    }

    // return json
    const prompt = `
    Analyze the user's description of what kind of dog they're looking for.
    Extract details and return output strictly in JSON with the following structure:

    {
      "size": "small" | "medium" | "large" | "any",
      "energy": "low" | "medium" | "high"
    }

    User description:
    "${text}"
    `;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",   
      input: prompt
    });

    const aiText = response.output_text;
    let parsed;

    try {
      parsed = JSON.parse(aiText);
    } catch (err) {
      return res.json({ error: "format_error", raw: aiText });
    }

   const preferences = mapToPreferences(parsed);

  res.json({
    preferences,
    ai_raw: aiText,
  });
  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({ error: "server_error" });
  }
});


app.listen(PORT, () => {
  console.log(`DogMatch API running on http://localhost:${PORT}`);
});
