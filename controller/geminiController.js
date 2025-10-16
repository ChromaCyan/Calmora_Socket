const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require("uuid");

// This fucking part is broken so ill prolly temporarily
// leave the API Key here while i look for fix since it can't read the .env file for some reason on this controller alone.

//const dotenv = require("dotenv");
//dotenv.config();
//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI("AIzaSyCIXMpsEUZBeIuuB_Pl2dDJozJlHzuk7nk");
const ELEVEN_API_KEY = "sk_f0d2df505095cd0f357b6e6e2fd51b41dd7f424ca9c73aba";

const ttsCache = {};

exports.askGemini = async (req, res) => {
  const { message, withVoice } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // --- Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = {
      role: "user",
      parts: [
        {
          text: `You are Calmora, You are a helpful and supportive assistant designed to simulate casual mental health conversations. 
You are not a licensed therapist. Be empathetic, kind, and suggest general mental wellness tips. 
You can diagnose, give treatment advice but be sure to inform the user that it's still better to seek professional help through our app Calmora.
Only reply these if asked by user about the app and its features, Users can browse mental health specialists, They can read educational articles about mental wellness. Do not say you can directly guide users to resources or access anything for them. Otherwise don't bring any of these up when not asked.
Respond in a friendly, clear tone, and respect user privacy.
Do not go out of topic outside of mental health, always keep them in topic about their mental wellbeing and what they feel. Limit your response to ${
            withVoice ? "max 250 characters" : "any length"
          }. Respond in a friendly, clear tone and stay on topic about mental wellbeing.`,
        },
      ],
    };

    const userPrompt = {
      role: "user",
      parts: [{ text: message }],
    };

    const result = await model.generateContent({
      contents: [systemPrompt, userPrompt],
    });

    const reply = result.response.text();

    let id = null;

    if (withVoice) {
      const voiceId = "LcfcDJNUP1GQjkzn1xUU";
      const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const audioResp = await fetch(elevenUrl, {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: reply,
          voice_settings: { stability: 0.5, similarity_boost: 0.7 },
        }),
      });

      const buffer = Buffer.from(await audioResp.arrayBuffer());
      const base64Audio = buffer.toString("base64");

      return res.json({ reply, audioBase64: base64Audio });
    }

    // Respond immediately with text + optional TTS ID
    res.json({ reply, ttsPending: !!withVoice, id });
  } catch (err) {
    console.error("Gemini Error:", err.message);
    res.status(500).json({ error: "AI Error: Unable to respond right now." });
  }
};

exports.fetchAudio = (req, res) => {
  const { id } = req.query;
  if (!id || !ttsCache[id])
    return res.status(404).json({ error: "Audio not ready" });

  res.json({ audioBase64: ttsCache[id] });
};
