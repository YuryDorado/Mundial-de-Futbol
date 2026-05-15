const fs = require("fs");
const path = require("path");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed. Use POST.",
    });
  }

  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GOOGLE_AI_STUDIO_API_KEY environment variable.",
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const userMessage =
      body.message || body.question || body.prompt || "";

    const language = body.language || "es";

    if (!userMessage.trim()) {
      return res.status(400).json({
        error: "Message is required.",
      });
    }

    const knowledgePath = path.join(
      process.cwd(),
      "src",
      "data",
      "knowledge-base.json"
    );

    let knowledgeBase = {};

    try {
      const rawKnowledge = fs.readFileSync(knowledgePath, "utf8");
      knowledgeBase = JSON.parse(rawKnowledge);
    } catch (error) {
      knowledgeBase = {
        platform: "Mundial de Fútbol Inteligente",
        fallback_response_es:
          "Lo siento, solo puedo responder preguntas relacionadas con la plataforma de predicción futbolística y mundialista presentada en esta página.",
        fallback_response_en:
          "Sorry, I can only answer questions related to the football and World Cup prediction platform presented on this page.",
      };
    }

    const fallbackEs =
      knowledgeBase.fallback_response_es ||
      "Lo siento, solo puedo responder preguntas relacionadas con la plataforma de predicción futbolística y mundialista presentada en esta página.";

    const fallbackEn =
      knowledgeBase.fallback_response_en ||
      "Sorry, I can only answer questions related to the football and World Cup prediction platform presented on this page.";

    const systemPrompt = `
You are the chatbot of the web project "Mundial de Fútbol Inteligente".

You must answer only using the following local knowledge base:

${JSON.stringify(knowledgeBase, null, 2)}

Rules:
- Answer only about the platform.
- Answer only about the home section, World Cup history, football analysis modules, simulated data, technical team, contact information, chatbot functionality, and the Transhuman Person Declaration.
- If the user asks something outside the platform, answer with the fallback message.
- If language is "es", answer in Spanish.
- If language is "en", answer in English.
- Do not invent real match results.
- Do not provide betting advice.
- Do not expose API keys.
- Keep answers short, clear, educational, and professional.

Spanish fallback:
${fallbackEs}

English fallback:
${fallbackEn}

User language: ${language}
User question: ${userMessage}
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: "Gemini API error",
        details: data,
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (language === "en" ? fallbackEn : fallbackEs);

    return res.status(200).json({
      reply: answer,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};