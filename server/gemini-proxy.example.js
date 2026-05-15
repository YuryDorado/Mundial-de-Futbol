const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");

loadEnvFile();

const PORT = Number(process.env.PORT || 8787);
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;
const KNOWLEDGE_BASE_PATH = path.join(__dirname, "..", "src", "data", "knowledge-base.json");
const WORLD_CUP_PATH = path.join(__dirname, "..", "src", "data", "world-cup-2026.json");
const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501"
]);

const blockedKeywords = [
  "apuesta",
  "apostar",
  "bet",
  "odds",
  "dinero",
  "money",
  "politica",
  "presidente",
  "president",
  "medical",
  "medico",
  "salud",
  "diagnostico",
  "diagnosis",
  "finance",
  "stock",
  "bitcoin",
  "buy",
  "investment",
  "inversion"
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env");

  try {
    const envContent = fsSync.readFileSync(envPath, "utf8");

    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return;
      }

      const separatorIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  } catch {
    // The .env file is optional. Terminal environment variables still work.
  }
}

async function loadKnowledgeBase() {
  const file = await fs.readFile(KNOWLEDGE_BASE_PATH, "utf8");
  const knowledgeBase = JSON.parse(file);

  try {
    const worldCupFile = await fs.readFile(WORLD_CUP_PATH, "utf8");
    knowledgeBase.world_cup_2026 = JSON.parse(worldCupFile);
  } catch {
    knowledgeBase.world_cup_2026 = null;
  }

  return knowledgeBase;
}

function getAllowedOrigin(requestOrigin) {
  if (allowedOrigins.has(requestOrigin)) {
    return requestOrigin;
  }

  // Desarrollo local: Live Server puede abrir 5500, 5501 u otro puerto cercano.
  // No se usa "*" porque el frontend puede trabajar con credenciales o cabeceras controladas.
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin || "")) {
    return requestOrigin;
  }

  return "http://localhost:5500";
}

function sendJson(request, response, statusCode, payload) {
  const origin = getAllowedOrigin(request.headers.origin);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function detectLanguage(question) {
  const text = normalizeText(question);
  const englishSignals = ["what", "who", "how", "why", "can", "should", "hello", "president", "price", "buy", "team", "contact", "data", "history", "prediction", "world cup"];
  const spanishSignals = ["que", "quien", "como", "hola", "precio", "comprar", "equipo", "contacto", "datos", "historia", "prediccion", "mundial", "futbol"];
  const englishScore = englishSignals.filter((word) => text.includes(word)).length;
  const spanishScore = spanishSignals.filter((word) => text.includes(word)).length;
  return englishScore > spanishScore ? "en" : "es";
}

function isAllowedQuestion(question, knowledgeBase) {
  const text = normalizeText(question);

  if (blockedKeywords.some((keyword) => text.includes(keyword))) {
    return false;
  }

  const allowedTerms = [
    ...(knowledgeBase.world_cup_2026?.groups ? Object.values(knowledgeBase.world_cup_2026.groups).flat() : []),
    ...(knowledgeBase.world_cup_2026?.group_stage_fixtures
      ? knowledgeBase.world_cup_2026.group_stage_fixtures.map((fixture) => fixture.match)
      : []),
    knowledgeBase.platform.name,
    knowledgeBase.platform.description,
    ...knowledgeBase.sections,
    ...knowledgeBase.allowed_topics,
    ...knowledgeBase.modules.map((module) => module.title),
    ...knowledgeBase.team.map((member) => member.name),
    "gemini",
    "google ai",
    "api",
    "proxy",
    "chatbot",
    "chat",
    "asistente",
    "ayuda",
    "quien eres",
    "que puedes hacer",
    "futbol",
    "mundial",
    "copa mundial",
    "grupo",
    "grupos",
    "calendario",
    "hoy",
    "primer",
    "primero",
    "primera",
    "primeras",
    "primer partido",
    "partido inaugural",
    "apertura",
    "fixture",
    "fixtures",
    "fecha",
    "hora",
    "sede",
    "cuando juega",
    "cuando es",
    "modulo",
    "modulos",
    "analisis",
    "historia",
    "historico",
    "historica",
    "goleador",
    "goleadores",
    "latinoamerica",
    "latinoamericano",
    "latinoamericanos",
    "sudamerica",
    "sudamericano",
    "tendencia",
    "tendencias",
    "tactica",
    "tacticas",
    "titulos",
    "campeonatos",
    "continente",
    "continentes",
    "prediccion",
    "predicciones",
    "prediccion asistida",
    "probabilidad",
    "probalidad",
    "probabilidades",
    "analiza",
    "gane",
    "ganar",
    "ganara",
    "ganador",
    "victoria",
    "ia",
    "inteligencia artificial",
    "datos",
    "estadistica",
    "visualizacion",
    "partido",
    "equipo tecnico",
    "contacto",
    "declaracion",
    "transhumana",
    "etica",
    "autonomia",
    "football",
    "world cup",
    "module",
    "modules",
    "analysis",
    "ai",
    "artificial intelligence",
    "statistics",
    "visualization",
    "match",
    "today",
    "opening match",
    "first match",
    "technical team",
    "contact",
    "declaration",
    "transhuman",
    "ethics",
    "autonomy",
    "football",
    "world cup",
    "data",
    "prediction",
    "platform",
    "probability",
    "chance",
    "chances",
    "win",
    "winner",
    "chat",
    "assistant",
    "help",
    "who are you",
    "what can you do"
  ].map(normalizeText);

  return allowedTerms.some((term) => term && text.includes(term));
}

function fallbackFor(language, knowledgeBase) {
  return language === "en" ? knowledgeBase.fallback_response_en : knowledgeBase.fallback_response_es;
}

function buildPrompt(question, language, knowledgeBase) {
  const fallback = fallbackFor(language, knowledgeBase);

  return [
    "You are the chatbot for the academic platform Mundial de Fútbol Inteligente.",
    "Answer only with information contained in the local knowledge base JSON below.",
    "Do not invent live sports data. Do not provide betting, financial, medical, political or personal advice.",
    `Respond in ${language === "en" ? "English" : "Spanish"}.`,
    `If the question is outside the platform scope, answer exactly: ${fallback}`,
    "Local knowledge base JSON:",
    JSON.stringify(knowledgeBase),
    "User question:",
    question
  ].join("\n\n");
}

async function askGemini(question, language, knowledgeBase) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": API_KEY
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildPrompt(question, language, knowledgeBase)
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || fallbackFor(language, knowledgeBase);
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(request, response, 204, {});
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/chat") {
    sendJson(request, response, 404, { error: "Endpoint not found" });
    return;
  }

  try {
    const knowledgeBase = await loadKnowledgeBase();
    const payload = JSON.parse(await readBody(request));
    const question = String(payload.question || "").trim();
    const language = payload.language === "en" ? "en" : detectLanguage(question);

    if (!question) {
      sendJson(request, response, 400, { error: "Question is required" });
      return;
    }

    if (!isAllowedQuestion(question, knowledgeBase)) {
      sendJson(request, response, 200, { answer: fallbackFor(language, knowledgeBase), source: "scope-guard" });
      return;
    }

    if (!API_KEY) {
      const answer =
        language === "en"
          ? "The Gemini proxy example is ready, but GOOGLE_AI_STUDIO_API_KEY is not configured. Store the API key as an environment variable before production testing."
          : "El proxy de Gemini está listo, pero GOOGLE_AI_STUDIO_API_KEY no está configurada. Guarda la API key como variable de entorno antes de probar en producción.";
      sendJson(request, response, 200, { answer, source: "local-proxy-example" });
      return;
    }

    const answer = await askGemini(question, language, knowledgeBase);
    sendJson(request, response, 200, { answer, source: "gemini-proxy" });
  } catch (error) {
    sendJson(request, response, 500, {
      answer: `No se pudo consultar Gemini desde el proxy. Detalle técnico: ${error.message}`,
      error: error.message,
      source: "proxy-error"
    });
  }
});

server.listen(PORT, () => {
  console.log(`Gemini proxy example running at http://localhost:${PORT}`);
});
