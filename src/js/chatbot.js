import { clearElement, createElement, fetchJson, normalizeText } from "./utils.js";

/*
  Chatbot Mundialista
  ----------------------------------------------------
  Funciona en dos modos:

  1. Local:
     Usa la base de conocimiento JSON del proyecto.

  2. Con Gemini:
     Usa un proxy backend local o una API serverless en Vercel.

  Local:
     http://127.0.0.1:8787/api/chat

  Vercel:
     /api/chat
*/

const LOCAL_CHAT_PROXY_URL = "http://127.0.0.1:8787/api/chat";
const VERCEL_CHAT_PROXY_URL = "/api/chat";

const DEFAULT_FALLBACK_ES =
  "Lo siento, solo puedo responder preguntas relacionadas con la plataforma de predicción futbolística y mundialista presentada en esta página.";

const DEFAULT_FALLBACK_EN =
  "Sorry, I can only answer questions related to the football and World Cup prediction platform presented on this page.";

const TRANSHUMAN_DECLARATION_ES =
  "Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes.";

const TRANSHUMAN_DECLARATION_EN =
  "I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction, as a regulatory ideal; I direct, control and dictate my own laws.";

const fallbackKnowledgeBase = {
  platform: {
    name: "Mundial de Fútbol Inteligente",
    description:
      "Plataforma web informativa para análisis, visualización de datos y predicción simulada de partidos relacionados con fútbol y el Mundial.",
  },
  home: {
    summary:
      "El fútbol ha evolucionado desde la observación táctica tradicional hasta el uso de datos, sensores, modelos estadísticos e inteligencia artificial.",
  },
  initial_message_es:
    "Hola, soy el asistente de Mundial de Fútbol Inteligente. " +
    TRANSHUMAN_DECLARATION_ES +
    " Puedo ayudarte en español o inglés con información de esta plataforma.",
  initial_message_en:
    "Hello, I am the assistant of Mundial de Fútbol Inteligente. " +
    TRANSHUMAN_DECLARATION_EN +
    " I can help you in Spanish or English with information from this platform.",
  fallback_response_es: DEFAULT_FALLBACK_ES,
  fallback_response_en: DEFAULT_FALLBACK_EN,
  modules: [],
  module_details: [],
  metrics: [],
  weekly_prediction_details: [],
  team: [],
  contact: {},
  declaration: {
    text_es: TRANSHUMAN_DECLARATION_ES,
    text_en: TRANSHUMAN_DECLARATION_EN,
  },
};

const blockedKeywords = [
  "presidente",
  "president",
  "política",
  "politica",
  "politics",
  "apuesta",
  "apostar",
  "bet",
  "odds",
  "dinero",
  "money",
  "inversión",
  "inversion",
  "investment",
  "bitcoin",
  "salud médica",
  "medical",
  "diagnóstico",
  "diagnosis",
  "contraseña",
  "password",
];

const topicKeywords = {
  greeting: [
    "hola",
    "hello",
    "hi",
    "buenos dias",
    "buenas tardes",
    "good morning",
    "good afternoon",
  ],
  overview: [
    "plataforma",
    "proyecto",
    "objetivo",
    "inicio",
    "home",
    "purpose",
    "platform",
    "about",
    "qué es",
    "que es",
    "what is",
    "quien eres",
    "quién eres",
    "who are you",
    "chatbot",
    "asistente",
    "assistant",
  ],
  history: [
    "historia",
    "histórico",
    "historico",
    "origen",
    "evolución",
    "evolucion",
    "mundial",
    "world cup",
    "football history",
    "fútbol",
    "futbol",
    "copa mundial",
  ],
  modules: [
    "módulo",
    "modulo",
    "módulos",
    "modulos",
    "analysis modules",
    "module",
    "modules",
    "análisis",
    "analisis",
    "predicción",
    "prediccion",
    "prediction",
    "partido actual",
    "fases",
    "semanal",
    "inteligencia artificial",
    "ia",
    "ai",
  ],
  data: [
    "datos",
    "data",
    "estadística",
    "estadistica",
    "statistics",
    "visualización",
    "visualizacion",
    "visualization",
    "goles",
    "posesión",
    "posesion",
    "remates",
    "pases",
    "probabilidad",
    "rendimiento",
  ],
  team: [
    "equipo",
    "team",
    "yury",
    "andrea",
    "dorado",
    "lucas",
    "hoja de vida",
    "cv",
    "perfil",
    "developer",
    "desarrolladora",
    "frontend",
  ],
  contact: [
    "contacto",
    "contact",
    "correo",
    "email",
    "whatsapp",
    "teléfono",
    "telefono",
    "phone",
    "ubicación",
    "ubicacion",
    "location",
    "horario",
    "schedule",
  ],
  declaration: [
    "transhumana",
    "transhuman",
    "declaración",
    "declaracion",
    "declaration",
    "libre",
    "autónomo",
    "autonomo",
    "autonomous",
    "responsable",
    "responsible",
    "ética",
    "etica",
    "ethics",
    "bienestar",
    "wellbeing",
  ],
  gemini: [
    "gemini",
    "google ai",
    "api",
    "proxy",
    "clave",
    "api key",
    "inteligencia artificial",
    "artificial intelligence",
  ],
};

function getChatProxyUrl() {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return LOCAL_CHAT_PROXY_URL;
  }

  return VERCEL_CHAT_PROXY_URL;
}

export async function initChatbot() {
  const messages = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const languageSelect = document.getElementById("chat-language");

  if (!messages || !form || !input || !languageSelect) {
    console.warn("Chatbot elements were not found in the HTML.");
    return;
  }

  const knowledgeBase = await loadKnowledgeBase();

  clearElement(messages);

  addMessage(messages, getInitialMessage("es", knowledgeBase), "bot");

  languageSelect.addEventListener("change", () => {
    const lang = getSelectedLanguage(languageSelect);

    input.placeholder =
      lang === "en"
        ? "Ask about modules, data, team or ethics..."
        : "Pregunta por módulos, datos, equipo o ética...";

    addMessage(messages, getInitialMessage(lang, knowledgeBase), "bot");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    const lang = getSelectedLanguage(languageSelect);

    addMessage(messages, question, "user");
    input.value = "";

    const waitingMessage = addMessage(
      messages,
      lang === "en"
        ? "Checking the platform knowledge base..."
        : "Consultando la base de conocimiento de la plataforma...",
      "bot",
    );

    const answer = await getAnswer(question, lang, knowledgeBase);

    const paragraph = waitingMessage.querySelector("p");

    if (paragraph) {
      paragraph.textContent = answer;
    }

    messages.scrollTop = messages.scrollHeight;
  });
}

async function loadKnowledgeBase() {
  const knowledgeBase = structuredClone(fallbackKnowledgeBase);

  try {
    const localKnowledge = await fetchJson("src/data/knowledge-base.json");
    Object.assign(knowledgeBase, localKnowledge);
  } catch (error) {
    console.warn("Could not load knowledge-base.json. Using fallback data.", error);
  }

  try {
    const modulesData = await fetchJson("src/data/modules.json");
    knowledgeBase.module_details = modulesData.modules || knowledgeBase.module_details || [];
    knowledgeBase.current_match = modulesData.current_match || null;
  } catch (error) {
    console.warn("Could not load modules.json.", error);
  }

  try {
    const teamData = await fetchJson("src/data/team.json");
    knowledgeBase.team = teamData.team || teamData || knowledgeBase.team || [];
  } catch (error) {
    console.warn("Could not load team.json.", error);
  }

  try {
    const statsData = await fetchJson("src/data/stats.json");
    knowledgeBase.metrics = statsData.metrics || knowledgeBase.metrics || [];
    knowledgeBase.weekly_prediction_details =
      statsData.weekly_predictions || knowledgeBase.weekly_prediction_details || [];
    knowledgeBase.historical = statsData.historical || knowledgeBase.historical || {};
  } catch (error) {
    console.warn("Could not load stats.json.", error);
  }

  return knowledgeBase;
}

function addMessage(container, text, type) {
  const message = createElement("article", `chat-message chat-message--${type}`);
  message.appendChild(createElement("p", "", text));
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  return message;
}

function getSelectedLanguage(languageSelect) {
  return languageSelect.value === "en" ? "en" : "es";
}

function getInitialMessage(lang, knowledgeBase) {
  if (lang === "en") {
    return knowledgeBase.initial_message_en || fallbackKnowledgeBase.initial_message_en;
  }

  return knowledgeBase.initial_message_es || fallbackKnowledgeBase.initial_message_es;
}

async function getAnswer(question, lang, knowledgeBase) {
  /*
    Primero intenta consultar el proxy Gemini.
    Si no existe, falla o está desconectado, usa el chatbot local.
  */

  try {
    const response = await fetch(getChatProxyUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: question,
        question,
        language: lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy response error: ${response.status}`);
    }

    const data = await response.json();

    const proxyAnswer = data.reply || data.answer || data.response;

    if (proxyAnswer) {
      return proxyAnswer;
    }
  } catch (error) {
    console.info("Gemini proxy unavailable. Using local chatbot fallback.", error);
  }

  return getLocalAnswer(question, lang, knowledgeBase);
}

function getLocalAnswer(question, lang, knowledgeBase) {
  const normalizedQuestion = normalizeText(question);

  if (containsBlockedTopic(normalizedQuestion)) {
    return getFallback(lang, knowledgeBase);
  }

  const topic = findTopic(normalizedQuestion);

  switch (topic) {
    case "greeting":
      return getInitialMessage(lang, knowledgeBase);

    case "overview":
      return platformResponse(lang, knowledgeBase);

    case "history":
      return historyResponse(lang, knowledgeBase);

    case "modules":
      return modulesResponse(lang, knowledgeBase, normalizedQuestion);

    case "data":
      return dataResponse(lang, knowledgeBase);

    case "team":
      return teamResponse(lang, knowledgeBase);

    case "contact":
      return contactResponse(lang, knowledgeBase);

    case "declaration":
      return declarationResponse(lang, knowledgeBase);

    case "gemini":
      return geminiResponse(lang);

    default:
      return getFallback(lang, knowledgeBase);
  }
}

function containsBlockedTopic(text) {
  return blockedKeywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function findTopic(text) {
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const found = keywords.some((keyword) => text.includes(normalizeText(keyword)));

    if (found) {
      return topic;
    }
  }

  return null;
}

function getFallback(lang, knowledgeBase) {
  if (lang === "en") {
    return knowledgeBase.fallback_response_en || DEFAULT_FALLBACK_EN;
  }

  return knowledgeBase.fallback_response_es || DEFAULT_FALLBACK_ES;
}

function platformResponse(lang, knowledgeBase) {
  const platformName = knowledgeBase.platform?.name || "Mundial de Fútbol Inteligente";

  if (lang === "en") {
    return `${platformName} is an academic web platform about football and the World Cup. It presents history, analysis modules, simulated data visualization and a bilingual chatbot based only on the local project knowledge base.`;
  }

  return `${platformName} es una plataforma web académica sobre fútbol y Mundial. Presenta historia, módulos de análisis, visualización de datos simulados y un chatbot bilingüe basado únicamente en la base de conocimiento local del proyecto.`;
}

function historyResponse(lang, knowledgeBase) {
  const summary = knowledgeBase.home?.summary;

  if (lang === "en") {
    return (
      "The history section explains how football evolved from traditional tactical observation to the use of statistics, sensors, video analysis, big data and artificial intelligence. It also presents the World Cup as one of the most important international football competitions. The data used in the platform is simulated for academic purposes."
    );
  }

  return (
    summary ||
    "La sección de historia explica cómo el fútbol evolucionó desde la observación táctica tradicional hasta el uso de estadísticas, sensores, videoanálisis, big data e inteligencia artificial. También presenta el Mundial como una de las competiciones internacionales más importantes del fútbol. Los datos de la plataforma son simulados con fines académicos."
  );
}

function modulesResponse(lang, knowledgeBase, normalizedQuestion) {
  const modules = getModules(knowledgeBase);

  if (!modules.length) {
    if (lang === "en") {
      return "The platform includes five modules: current match analysis, World Cup phase prediction, weekly match prediction, historical World Cup data analysis, and AI-assisted prediction.";
    }

    return "La plataforma incluye cinco módulos: análisis del partido actual, predicción por fases del Mundial, predicción semanal de partidos, análisis histórico de datos mundialistas y predicción asistida por inteligencia artificial.";
  }

  const selectedModule = findRequestedModule(modules, normalizedQuestion);

  if (selectedModule) {
    return moduleDetailResponse(lang, selectedModule);
  }

  const moduleNames = modules.map((module) => module.title || module.name).filter(Boolean).join("; ");

  if (lang === "en") {
    return `The platform includes these analysis modules: ${moduleNames}. These modules use simulated data to explain match status, World Cup phases, weekly predictions, historical patterns and AI-assisted prediction.`;
  }

  return `La plataforma incluye estos módulos de análisis: ${moduleNames}. Estos módulos usan datos simulados para explicar estado del partido, fases del Mundial, predicción semanal, patrones históricos y predicción asistida por IA.`;
}

function getModules(knowledgeBase) {
  if (Array.isArray(knowledgeBase.module_details) && knowledgeBase.module_details.length) {
    return knowledgeBase.module_details;
  }

  if (Array.isArray(knowledgeBase.modules) && knowledgeBase.modules.length) {
    return knowledgeBase.modules;
  }

  return [];
}

function findRequestedModule(modules, normalizedQuestion) {
  return modules.find((module) => {
    const title = normalizeText(module.title || module.name || "");
    const id = normalizeText(module.id || "");

    return (
      title && normalizedQuestion.includes(title)
    ) || (
      id && normalizedQuestion.includes(id)
    );
  });
}

function moduleDetailResponse(lang, module) {
  const title = module.title || module.name || "Module";
  const description = module.description || "";
  const content = module.content || "";
  const objective = module.objective || "";

  if (lang === "en") {
    return `${title}: ${description} ${content} Objective: ${objective}`.trim();
  }

  return `${title}: ${description} ${content} Objetivo: ${objective}`.trim();
}

function dataResponse(lang, knowledgeBase) {
  const metrics = Array.isArray(knowledgeBase.metrics) ? knowledgeBase.metrics : [];
  const weekly = Array.isArray(knowledgeBase.weekly_prediction_details)
    ? knowledgeBase.weekly_prediction_details
    : [];

  const metricText = metrics
    .map((metric) => {
      const title = metric.title || metric.name || "Dato";
      const value = metric.value || "";
      return `${title}: ${value}`;
    })
    .filter(Boolean)
    .join("; ");

  const weeklyText = weekly
    .slice(0, 3)
    .map((item) => {
      const match = item.match || item.partido || "";
      const result = item.estimated_result || item.resultado_estimado || "";
      return `${match} (${result})`;
    })
    .filter(Boolean)
    .join("; ");

  if (lang === "en") {
    return `The data visualization section presents simulated football metrics such as average goals, possession, shots on target, passing accuracy, win probability and team performance. ${
      metricText ? `Available metrics: ${metricText}.` : ""
    } ${weeklyText ? `Weekly simulated examples: ${weeklyText}.` : ""}`.trim();
  }

  return `La sección de visualización de datos presenta métricas futbolísticas simuladas como goles promedio, posesión, remates al arco, precisión de pases, probabilidad de victoria y rendimiento del equipo. ${
    metricText ? `Métricas disponibles: ${metricText}.` : ""
  } ${weeklyText ? `Ejemplos semanales simulados: ${weeklyText}.` : ""}`.trim();
}

function teamResponse(lang, knowledgeBase) {
  const team = Array.isArray(knowledgeBase.team) ? knowledgeBase.team : [];

  const yury = team.find((member) =>
    normalizeText(member.name || "").includes("yury")
  );

  if (yury) {
    if (lang === "en") {
      return `${yury.name} is part of the technical team. Her role is ${yury.role || "Frontend Developer"}. She is an eighth-semester Systems Engineering student interested in software development, databases, technology support and digital solutions. She has knowledge of Laravel, MySQL, PHP, HTML, CSS and programming logic.`;
    }

    return `${yury.name} hace parte del equipo técnico. Su rol es ${yury.role || "Desarrolladora Frontend"}. Es estudiante de Ingeniería de Sistemas de octavo semestre, con interés en desarrollo de software, bases de datos, soporte tecnológico y soluciones digitales. Cuenta con conocimientos en Laravel, MySQL, PHP, HTML, CSS y lógica de programación.`;
  }

  if (lang === "en") {
    return "The technical team includes Yury Andrea Dorado Lucas as frontend developer, an Applied Artificial Intelligence Specialist and a Football Data Analyst.";
  }

  return "El equipo técnico incluye a Yury Andrea Dorado Lucas como desarrolladora frontend, un especialista en Inteligencia Artificial Aplicada y un analista de datos futbolísticos.";
}

function contactResponse(lang, knowledgeBase) {
  const contact = knowledgeBase.contact || {};

  const email = contact.email || "contacto@mundialinteligente.com";
  const whatsapp = contact.whatsapp || "+57 300 000 0000";
  const location = contact.location || "Bogotá, Colombia";
  const schedule = contact.schedule || "Lunes a viernes, 8:00 a.m. a 6:00 p.m.";

  if (lang === "en") {
    return `Contact information: email ${email}, WhatsApp ${whatsapp}, location ${location}, schedule ${schedule}. You can also use the contact form on the page.`;
  }

  return `Información de contacto: correo ${email}, WhatsApp ${whatsapp}, ubicación ${location}, horario ${schedule}. También puedes usar el formulario de contacto de la página.`;
}

function declarationResponse(lang, knowledgeBase) {
  const declaration = knowledgeBase.declaration || {};

  if (lang === "en") {
    return `${declaration.text_en || TRANSHUMAN_DECLARATION_EN} In this project, the declaration represents autonomy, responsibility, dialogue, ethics, human development, wellbeing and positive transformation.`;
  }

  return `${declaration.text_es || TRANSHUMAN_DECLARATION_ES} En este proyecto, la declaración representa autonomía, responsabilidad, diálogo, ética, desarrollo humano, bienestar y transformación positiva.`;
}

function geminiResponse(lang) {
  if (lang === "en") {
    return "The project can optionally connect to Google AI Studio / Gemini through a secure proxy. The API key must be stored in environment variables and must never be hardcoded in frontend JavaScript.";
  }

  return "El proyecto puede conectarse opcionalmente con Google AI Studio / Gemini mediante un proxy seguro. La API key debe guardarse en variables de entorno y nunca debe escribirse directamente en el JavaScript del frontend.";
}