import { clearElement, createElement, fetchJson, normalizeText } from "./utils.js";

const CHAT_PROXY_URL = "http://127.0.0.1:8787/api/chat";

const fallbackKnowledgeBase = {
  platform: {
    name: "Mundial de Fútbol Inteligente",
    description:
      "Plataforma web informativa para análisis, visualización de datos y predicción simulada de partidos relacionados con fútbol y el Mundial.",
  },
  initial_message_es:
    "Hola, soy el asistente de Mundial de Fútbol Inteligente. Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes. Puedo ayudarte en español o inglés con información de esta plataforma.",
  initial_message_en:
    "Hello, I am the assistant of Mundial de Fútbol Inteligente. I am FREE, AUTONOMOUS AND RESPONSIBLE through dialogue and construction, as a regulatory ideal; I direct, control and dictate my own laws. I can help you in Spanish or English with information from this platform.",
  fallback_response_es:
    "Lo siento, solo puedo responder preguntas relacionadas con la plataforma de predicción futbolística y mundialista presentada en esta página.",
  fallback_response_en:
    "Sorry, I can only answer questions related to the football and World Cup prediction platform presented on this page.",
  modules: [],
  module_details: [],
  metrics: [],
  historical: {},
  weekly_prediction_details: [],
  match_predictions: [],
  team: [],
  contact: {},
  declaration: {},
  gemini: {},
  world_cup_2026: null,
};

const topicKeywords = {
  overview: [
    "plataforma",
    "proyecto",
    "objetivo",
    "inicio",
    "home",
    "purpose",
    "platform",
    "about",
    "que es",
    "quien eres",
    "que puedes",
    "ayuda",
    "asistente",
    "chatbot",
    "what can you",
    "who are you",
    "help",
    "assistant",
  ],
  history: [
    "historia",
    "historico",
    "historica",
    "origen",
    "evolucion",
    "copa mundial",
    "world cup history",
    "football history",
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
  ],
  worldCup: [
    "mundial",
    "world cup",
    "grupo",
    "grupos",
    "group",
    "groups",
    "calendario",
    "fixture",
    "fixtures",
    "partido",
    "partidos",
    "hoy",
    "today",
    "primer",
    "primero",
    "primera",
    "primeras",
    "inaugural",
    "apertura",
    "artido",
    "cuando juega",
    "cuando es",
    "fecha",
    "hora",
    "sede",
    "schedule",
    "when",
    "mexico",
    "colombia",
    "portugal",
    "argentina",
    "brasil",
    "brazil",
    "espana",
    "spain",
    "francia",
    "france",
    "alemania",
    "germany",
    "inglaterra",
    "england",
    "estados unidos",
    "usa",
    "probabilidad",
    "probalidad",
    "probabilidades",
    "gane",
    "ganar",
    "ganara",
    "ganador",
    "victoria",
    "analiza",
    "chance",
    "chances",
    "win",
  ],
  modules: [
    "modulo",
    "modulos",
    "analisis",
    "prediccion",
    "prediction",
    "fase",
    "partido actual",
    "semanal",
    "weekly",
    "modelo",
    "ai",
    "ia",
  ],
  data: [
    "dato",
    "datos",
    "estadistica",
    "visualizacion",
    "goles",
    "posesion",
    "remates",
    "pases",
    "data",
    "stats",
    "visualization",
  ],
  team: [
    "equipo",
    "yury",
    "andrea",
    "dorado",
    "cv",
    "hoja de vida",
    "desarrolladora",
    "team",
    "developer",
  ],
  contact: ["contacto", "correo", "whatsapp", "telefono", "ubicacion", "horario", "contact", "email", "phone", "location"],
  declaration: [
    "transhumana",
    "transhuman",
    "autonomia",
    "autonomo",
    "responsable",
    "etica",
    "bienestar",
    "declaracion",
    "ethics",
    "autonomous",
    "responsible",
    "wellbeing",
  ],
  gemini: ["gemini", "google ai", "api", "proxy", "seguridad", "security", "api key", "clave"],
};

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
  "financiero",
  "stock",
  "bitcoin",
  "buy",
  "investment",
  "inversion",
  "personal password",
  "contraseña",
];

export async function initChatbot() {
  const panel = document.getElementById("chatbot-panel");
  const messages = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const languageSelect = document.getElementById("chat-language");

  if (!panel || !messages || !form || !input || !languageSelect) {
    return;
  }

  let knowledgeBase = fallbackKnowledgeBase;

  try {
    knowledgeBase = await fetchJson("src/data/knowledge-base.json");
  } catch (error) {
    console.warn(error);
  }

  try {
    knowledgeBase.world_cup_2026 = await fetchJson("src/data/world-cup-2026.json");
  } catch (error) {
    console.warn(error);
  }

  try {
    const stats = await fetchJson("src/data/stats.json");
    knowledgeBase.weekly_prediction_details = stats.weekly_predictions || [];
    knowledgeBase.historical = stats.historical || knowledgeBase.historical || {};
  } catch (error) {
    console.warn(error);
  }

  try {
    const modulesData = await fetchJson("src/data/modules.json");
    knowledgeBase.module_details = modulesData.modules || [];
    knowledgeBase.current_match = modulesData.current_match || null;
  } catch (error) {
    console.warn(error);
  }

  clearElement(messages);
  addMessage(messages, knowledgeBase.initial_message_es, "bot");

  languageSelect.addEventListener("change", () => {
    const lang = languageSelect.value;
    input.placeholder =
      lang === "en" ? "Ask about modules, data, team or ethics..." : "Pregunta por módulos, datos, equipo o ética...";
    addMessage(messages, lang === "en" ? knowledgeBase.initial_message_en : knowledgeBase.initial_message_es, "bot");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      return;
    }

    const lang = resolveLanguage(question, languageSelect.value);
    addMessage(messages, question, "user");
    input.value = "";

    const waitingMessage = addMessage(
      messages,
      lang === "en" ? "Checking the platform knowledge base..." : "Consultando la base de conocimiento de la plataforma...",
      "bot",
    );

    const answer = await getAnswerWithProxyFallback(question, lang, knowledgeBase);
    waitingMessage.querySelector("p").textContent = answer;
    messages.scrollTop = messages.scrollHeight;
  });
}

function addMessage(container, text, type) {
  const message = createElement("article", `chat-message chat-message--${type}`);
  message.appendChild(createElement("p", "", text));
  container.appendChild(message);
  container.scrollTop = container.scrollHeight;
  return message;
}

async function getAnswerWithProxyFallback(question, lang, knowledgeBase) {
  const localTopic = findTopic(normalizeText(question));

  if (["worldCup", "modules", "history"].includes(localTopic)) {
    return getChatbotAnswer(question, lang, knowledgeBase);
  }

  try {
    const response = await fetch(CHAT_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        language: lang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Proxy response ${response.status}`);
    }

    const data = await response.json();

    if (data.answer && !["scope-guard", "local-proxy-example"].includes(data.source)) {
      return data.answer;
    }
  } catch (error) {
    console.info("Gemini proxy unavailable; using local chatbot fallback.", error);
  }

  return getChatbotAnswer(question, lang, knowledgeBase);
}

function resolveLanguage(question, selectedLanguage) {
  const detected = detectLanguage(question);

  if (detected) {
    return detected;
  }

  return selectedLanguage === "en" ? "en" : "es";
}

function detectLanguage(question) {
  const normalized = normalizeText(question);
  const englishScore = countMatches(normalized, [
    "what",
    "who",
    "how",
    "why",
    "can",
    "should",
    "hello",
    "hi",
    "president",
    "price",
    "buy",
    "today",
    "team",
    "contact",
    "data",
    "history",
    "prediction",
    "world cup",
    "football",
    "purpose",
    "module",
    "modules",
    "english",
  ]);
  const spanishScore = countMatches(normalized, [
    "que",
    "quien",
    "como",
    "por que",
    "hola",
    "precio",
    "comprar",
    "equipo",
    "contacto",
    "datos",
    "historia",
    "prediccion",
    "mundial",
    "futbol",
    "modulo",
    "modulos",
    "espanol",
  ]);

  if (englishScore > spanishScore) {
    return "en";
  }

  if (spanishScore > englishScore) {
    return "es";
  }

  return "";
}

function countMatches(text, words) {
  return words.reduce((total, word) => total + (text.includes(word) ? 1 : 0), 0);
}

function getChatbotAnswer(question, lang, knowledgeBase) {
  const normalized = normalizeText(question);

  if (blockedKeywords.some((keyword) => normalized.includes(keyword))) {
    return getFallback(lang, knowledgeBase);
  }

  if (isGreeting(normalized)) {
    return lang === "en" ? knowledgeBase.initial_message_en : knowledgeBase.initial_message_es;
  }

  const topic = findTopic(normalized);

  if (!topic) {
    return getFallback(lang, knowledgeBase);
  }

  const responses = {
    overview: () => platformResponse(lang, knowledgeBase),
    history: () => historicalDataResponse(lang, knowledgeBase, normalized),
    modules: () => modulesResponse(lang, knowledgeBase, normalized),
    worldCup: () => worldCupResponse(lang, knowledgeBase, normalized, question),
    data: () => dataResponse(lang, knowledgeBase),
    team: () => teamResponse(lang, knowledgeBase, normalized),
    contact: () => contactResponse(lang, knowledgeBase),
    declaration: () => declarationResponse(lang, knowledgeBase),
    gemini: () => geminiResponse(lang, knowledgeBase),
  };

  return responses[topic]?.() || getFallback(lang, knowledgeBase);
}

function isGreeting(text) {
  return ["hola", "hello", "hi", "buenos dias", "buenas tardes", "good morning", "good afternoon"].some(
    (word) => text === word || text.startsWith(`${word} `),
  );
}

function findTopic(text) {
  const asksForWorldCupSchedule = matchesAnyKeyword(text, [
    "grupo",
    "grupos",
    "group",
    "groups",
    "calendario",
    "fixture",
    "fixtures",
    "partido",
    "partidos",
    "primer",
    "primero",
    "primera",
    "primeras",
    "inaugural",
    "apertura",
    "artido",
    "cuando",
    "fecha",
    "hora",
    "sede",
    "hoy",
    "juega",
    "schedule",
    "when",
    "date",
    "venue",
    "today",
  ]);
  const asksForAnalysisModule = matchesAnyKeyword(text, topicKeywords.modules);

  if (asksForAnalysisModule && !asksForWorldCupSchedule) {
    return "modules";
  }

  return Object.entries(topicKeywords).find(([, keywords]) => matchesAnyKeyword(text, keywords))?.[0];
}

function matchesAnyKeyword(text, keywords) {
  return keywords.some((keyword) => keywordMatches(text, keyword));
}

function keywordMatches(text, keyword) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  if (normalizedKeyword.length <= 3 && /^[a-z0-9]+$/.test(normalizedKeyword)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}([^a-z0-9]|$)`).test(text);
  }

  return text.includes(normalizedKeyword);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getFallback(lang, knowledgeBase) {
  return lang === "en" ? knowledgeBase.fallback_response_en : knowledgeBase.fallback_response_es;
}

function platformResponse(lang, knowledgeBase) {
  if (lang === "en") {
    return `${knowledgeBase.platform.name} is an academic web platform for football and World Cup knowledge. It presents history, analysis modules, simulated data visualization and a bilingual chatbot based only on the local project knowledge base.`;
  }

  return `${knowledgeBase.platform.name} es una plataforma web académica sobre fútbol y Mundial. Presenta historia, módulos de análisis, visualización de datos simulados y un chatbot bilingüe basado únicamente en la base de conocimiento local del proyecto.`;
}

function historyResponse(lang, knowledgeBase, normalizedQuestion) {
  const historical = knowledgeBase.historical || {};

  if (includesAny(normalizedQuestion, ["latinoamerica", "latinoamericano", "latinoamericanos", "sudamerica", "sudamericano"])) {
    if (lang === "en") {
      return historical.latin_american_top_scorer
        ? `In the project's historical summary, the highlighted Latin American World Cup scorer is ${historical.latin_american_top_scorer}. ${historical.latin_american_top_scorer_note || ""}`.trim()
        : "The local historical summary does not include a specific Latin American top scorer.";
    }

    return historical.latin_american_top_scorer
      ? `En el resumen histÃ³rico del proyecto, el goleador latinoamericano destacado es ${historical.latin_american_top_scorer}. ${historical.latin_american_top_scorer_note || ""}`.trim()
      : "El resumen histÃ³rico local no incluye un goleador latinoamericano especÃ­fico.";
  }

  if (includesAny(normalizedQuestion, ["goleador", "goleadores", "goles"])) {
    const scorers = historical.historic_scorers?.join(", ");

    if (lang === "en") {
      return scorers
        ? `The historical module highlights these World Cup scorers: ${scorers}.`
        : "The local historical summary does not include a scorer list.";
    }

    return scorers
      ? `El mÃ³dulo histÃ³rico destaca estos goleadores mundialistas: ${scorers}.`
      : "El resumen histÃ³rico local no incluye una lista de goleadores.";
  }

  if (includesAny(normalizedQuestion, ["tendencia", "tendencias", "tactica", "tacticas"])) {
    if (lang === "en") {
      return historical.tactical_trends
        ? `The tactical trends highlighted by the historical module are: ${historical.tactical_trends}`
        : "The local historical summary does not include tactical trends.";
    }

    return historical.tactical_trends
      ? `Las tendencias tÃ¡cticas destacadas por el mÃ³dulo histÃ³rico son: ${historical.tactical_trends}`
      : "El resumen histÃ³rico local no incluye tendencias tÃ¡cticas.";
  }

  if (includesAny(normalizedQuestion, ["continente", "continentes", "rendimiento"])) {
    if (lang === "en") {
      return historical.continent_performance || "The local historical summary does not include continent performance.";
    }

    return historical.continent_performance || "El resumen histÃ³rico local no incluye rendimiento por continente.";
  }

  if (includesAny(normalizedQuestion, ["titulo", "titulos", "campeon", "campeones", "campeonatos"])) {
    const teams = historical.top_title_teams?.join(", ");

    if (lang === "en") {
      return teams
        ? `The historical module highlights these title-winning teams: ${teams}.`
        : "The local historical summary does not include title-winning teams.";
    }

    return teams
      ? `El mÃ³dulo histÃ³rico destaca estas selecciones con mÃ¡s tÃ­tulos: ${teams}.`
      : "El resumen histÃ³rico local no incluye selecciones con tÃ­tulos.";
  }

  if (lang === "en") {
    return `The history section explains how modern football evolved from unified rules and international competitions to tactical analysis, statistics, sensors, video analysis, big data and artificial intelligence for responsible sports decision-making.`;
  }

  return `La sección de historia explica cómo el fútbol moderno evolucionó desde reglas unificadas y competiciones internacionales hasta análisis táctico, estadísticas, sensores, videoanálisis, big data e inteligencia artificial para apoyar decisiones deportivas responsables.`;
}

function historicalDataResponse(lang, knowledgeBase, normalizedQuestion) {
  const historical = knowledgeBase.historical || {};

  if (includesAny(normalizedQuestion, ["latinoamerica", "latinoamericano", "latinoamericanos", "sudamerica", "sudamericano"])) {
    if (lang === "en") {
      return historical.latin_american_top_scorer
        ? `In the project's historical summary, the highlighted Latin American World Cup scorer is ${historical.latin_american_top_scorer}. ${historical.latin_american_top_scorer_note || ""}`.trim()
        : "The local historical summary does not include a specific Latin American top scorer.";
    }

    return historical.latin_american_top_scorer
      ? `En el resumen historico del proyecto, el goleador latinoamericano destacado es ${historical.latin_american_top_scorer}. ${historical.latin_american_top_scorer_note || ""}`.trim()
      : "El resumen historico local no incluye un goleador latinoamericano especifico.";
  }

  if (includesAny(normalizedQuestion, ["goleador", "goleadores", "goles"])) {
    const scorers = historical.historic_scorers?.join(", ");

    if (lang === "en") {
      return scorers
        ? `The historical module highlights these World Cup scorers: ${scorers}.`
        : "The local historical summary does not include a scorer list.";
    }

    return scorers
      ? `El modulo historico destaca estos goleadores mundialistas: ${scorers}.`
      : "El resumen historico local no incluye una lista de goleadores.";
  }

  if (includesAny(normalizedQuestion, ["tendencia", "tendencias", "tactica", "tacticas"])) {
    if (lang === "en") {
      return historical.tactical_trends
        ? `The tactical trends highlighted by the historical module are: ${historical.tactical_trends}`
        : "The local historical summary does not include tactical trends.";
    }

    return historical.tactical_trends
      ? `Las tendencias tacticas destacadas por el modulo historico son: ${historical.tactical_trends}`
      : "El resumen historico local no incluye tendencias tacticas.";
  }

  if (includesAny(normalizedQuestion, ["continente", "continentes", "rendimiento"])) {
    if (lang === "en") {
      return historical.continent_performance || "The local historical summary does not include continent performance.";
    }

    return historical.continent_performance || "El resumen historico local no incluye rendimiento por continente.";
  }

  if (includesAny(normalizedQuestion, ["titulo", "titulos", "campeon", "campeones", "campeonatos"])) {
    const teams = historical.top_title_teams?.join(", ");

    if (lang === "en") {
      return teams
        ? `The historical module highlights these title-winning teams: ${teams}.`
        : "The local historical summary does not include title-winning teams.";
    }

    return teams
      ? `El modulo historico destaca estas selecciones con mas titulos: ${teams}.`
      : "El resumen historico local no incluye selecciones con titulos.";
  }

  if (lang === "en") {
    return "The history section explains how modern football evolved from unified rules and international competitions to tactical analysis, statistics, sensors, video analysis, big data and artificial intelligence for responsible sports decision-making.";
  }

  return "La seccion de historia explica como el futbol moderno evoluciono desde reglas unificadas y competiciones internacionales hasta analisis tactico, estadisticas, sensores, videoanalisis, big data e inteligencia artificial para apoyar decisiones deportivas responsables.";
}

function modulesResponse(lang, knowledgeBase, normalizedQuestion) {
  const requestedModule = findRequestedModule(knowledgeBase, normalizedQuestion);

  if (requestedModule) {
    return moduleDetailResponse(lang, requestedModule);
  }

  const moduleNames = knowledgeBase.modules.map((module) => module.title).join("; ");

  if (lang === "en") {
    return `The platform includes five analysis modules: ${moduleNames}. They are educational modules that use simulated data to explain match status, World Cup phases, weekly predictions, historical patterns and AI-assisted prediction limits.`;
  }

  return `La plataforma incluye cinco módulos de análisis: ${moduleNames}. Son módulos educativos con datos simulados para explicar estado del partido, fases del Mundial, predicción semanal, patrones históricos y límites de la predicción asistida por IA.`;
}

function findRequestedModule(knowledgeBase, normalizedQuestion) {
  const modules = knowledgeBase.module_details?.length ? knowledgeBase.module_details : knowledgeBase.modules;
  const moduleSignals = [
    { id: "analisis-partido-actual", phrases: ["partido actual", "analisis del partido actual", "marcador"] },
    { id: "prediccion-fases-mundial", phrases: ["prediccion por fases", "fases del mundial", "por fases"] },
    { id: "prediccion-semanal", phrases: ["prediccion semanal", "tabla semanal", "semanal"] },
    { id: "analisis-historico", phrases: ["analisis historico", "historico"] },
    { id: "prediccion-asistida-ia", phrases: ["prediccion asistida", "inteligencia artificial", " ia ", " ai "] },
  ];

  const byTitle = modules.find((module) => normalizedQuestion.includes(normalizeText(module.title)));

  if (byTitle) {
    return byTitle;
  }

  const signal = moduleSignals.find(({ phrases }) =>
    phrases.some((phrase) => normalizedQuestion.includes(normalizeText(phrase).trim())),
  );

  if (!signal) {
    return null;
  }

  return modules.find((module) => module.id === signal.id || normalizeText(module.title).includes(normalizeText(signal.phrases[0]))) || null;
}

function moduleDetailResponse(lang, module) {
  const content = module.content ? ` ${module.content}` : "";
  const objective = module.objective ? ` Objetivo: ${module.objective}` : "";
  const useCase = module.use_case ? ` Caso de uso: ${module.use_case}` : "";

  if (lang === "en") {
    return `${module.title}: ${module.description}${content}${objective}${useCase}`;
  }

  return `${module.title}: ${module.description}${content}${objective}${useCase}`;
}

function worldCupResponse(lang, knowledgeBase, normalizedQuestion, question) {
  const worldCup = knowledgeBase.world_cup_2026;

  if (!worldCup) {
    return getFallback(lang, knowledgeBase);
  }

  const groupLetter = findGroupLetter(normalizedQuestion);
  const mentionedTeams = findMentionedTeams(question, worldCup);
  const asksForGroups = includesAny(normalizedQuestion, ["grupo", "grupos", "group", "groups"]);
  const asksForToday = includesAny(normalizedQuestion, ["hoy", "today"]);
  const asksForOpeningMatch = isOpeningMatchQuestion(normalizedQuestion);
  const asksForProbability = includesAny(normalizedQuestion, [
    "probabilidad",
    "probalidad",
    "probabilidades",
    "prediccion",
    "analiza",
    "gane",
    "ganar",
    "ganara",
    "ganador",
    "victoria",
    "chance",
    "chances",
    "win",
  ]);
  const asksForSchedule = includesAny(normalizedQuestion, [
    "calendario",
    "fixture",
    "fixtures",
    "partido",
    "partidos",
    "hoy",
    "cuando",
    "fecha",
    "hora",
    "sede",
    "juega",
    "schedule",
    "match",
    "when",
    "date",
    "venue",
    "time",
    "play",
    "today",
  ]);

  if (asksForOpeningMatch && asksForProbability) {
    return openingPredictionResponse(lang, knowledgeBase, worldCup);
  }

  if (asksForOpeningMatch) {
    return openingFixtureResponse(lang, worldCup);
  }

  if (asksForProbability) {
    return predictionResponse(lang, knowledgeBase, worldCup, mentionedTeams);
  }

  if (asksForSchedule) {
    if (asksForToday) {
      return dateFixturesResponse(lang, worldCup, getTodayDateValue(), lang === "en" ? "today" : "hoy");
    }

    if (mentionedTeams.length >= 2) {
      const fixture = findFixtureByTeams(worldCup, mentionedTeams.slice(0, 2));

      if (fixture) {
        return fixtureResponse(lang, fixture, worldCup);
      }
    }

    if (mentionedTeams.length === 1) {
      return teamFixturesResponse(lang, mentionedTeams[0], worldCup);
    }

    if (groupLetter) {
      return groupFixturesResponse(lang, groupLetter, worldCup);
    }
  }

  if (groupLetter) {
    return groupResponse(lang, groupLetter, worldCup);
  }

  if (asksForGroups) {
    return groupsResponse(lang, worldCup);
  }

  return lang === "en"
    ? `${worldCup.tournament} will be hosted by ${worldCup.hosts.join(", ")} from ${formatDate(worldCup.dates.start)} to ${formatDate(worldCup.dates.end)}. It has 48 teams, 12 groups of four, and the group stage runs from ${worldCup.dates.group_stage}. Ask me for a group, a team, or a fixture.`
    : `${worldCup.tournament} se jugará en ${worldCup.hosts.join(", ")} del ${formatDate(worldCup.dates.start)} al ${formatDate(worldCup.dates.end)}. Tiene 48 selecciones, 12 grupos de cuatro equipos y fase de grupos del ${worldCup.dates.group_stage}. Pregúntame por un grupo, una selección o un partido.`;
}

function isOpeningMatchQuestion(text) {
  return (
    includesAny(text, ["primer partido", "primer artido", "partido inaugural", "partido de apertura", "opening match"]) ||
    (includesAny(text, ["primer", "primero", "primera", "primeras", "inaugural", "apertura"]) &&
      includesAny(text, ["partido", "artido", "juega", "fecha", "mundial", "world cup", "match"]))
  );
}

function openingFixtureResponse(lang, worldCup) {
  const fixture = getOpeningFixture(worldCup);

  if (!fixture) {
    return lang === "en" ? "I do not have an opening match registered." : "No tengo registrado el partido inaugural.";
  }

  if (lang === "en") {
    return `The first match of the 2026 World Cup is ${fixture.match}: ${formatDate(fixture.date)}, Group ${fixture.group}, at ${fixture.venue}, ${fixture.city}, ${fixture.local_time} local time.`;
  }

  return `El primer partido del Mundial 2026 es ${fixture.match}: ${formatDate(fixture.date)}, Grupo ${fixture.group}, en ${fixture.venue}, ${fixture.city}, a las ${fixture.local_time} hora local.`;
}

function openingPredictionResponse(lang, knowledgeBase, worldCup) {
  const fixture = getOpeningFixture(worldCup);

  if (!fixture) {
    return lang === "en" ? "I do not have an opening match registered." : "No tengo registrado el partido inaugural.";
  }

  const prediction = findMatchPredictionByTeams(knowledgeBase, fixture.teams);

  if (!prediction) {
    if (lang === "en") {
      return `${openingFixtureResponse(lang, worldCup)} The local knowledge base does not include a simulated prediction for that match yet.`;
    }

    return `${openingFixtureResponse(lang, worldCup)} La base local todavía no incluye una predicción simulada para ese partido.`;
  }

  const teams = splitMatchTeams(prediction.match);

  if (lang === "en") {
    return `${openingFixtureResponse(lang, worldCup)} Simulated prediction: ${teams[0]} ${prediction.team_a_probability}, draw ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Estimated result: ${prediction.estimated_result}. ${prediction.analysis_en}`;
  }

  return `${openingFixtureResponse(lang, worldCup)} Pronóstico simulado: ${teams[0]} ${prediction.team_a_probability}, empate ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Resultado estimado: ${prediction.estimated_result}. ${prediction.analysis_es}`;
}

function groupsResponse(lang, worldCup) {
  const groups = Object.entries(worldCup.groups)
    .map(([group, teams]) => `Grupo ${group}: ${teams.join(", ")}`)
    .join("; ");

  if (lang === "en") {
    return `The World Cup 2026 groups are: ${groups}.`;
  }

  return `Los grupos del Mundial 2026 son: ${groups}.`;
}

function groupResponse(lang, groupLetter, worldCup) {
  const teams = worldCup.groups[groupLetter];

  if (!teams) {
    return lang === "en" ? "I could not find that World Cup group." : "No encontré ese grupo del Mundial.";
  }

  if (lang === "en") {
    return `Group ${groupLetter} includes ${teams.join(", ")}.`;
  }

  return `El Grupo ${groupLetter} está integrado por ${teams.join(", ")}.`;
}

function groupFixturesResponse(lang, groupLetter, worldCup) {
  const fixtures = worldCup.group_stage_fixtures.filter((fixture) => fixture.group === groupLetter);

  if (!fixtures.length) {
    return groupResponse(lang, groupLetter, worldCup);
  }

  const summary = fixtures.map(shortFixtureText).join("; ");

  if (lang === "en") {
    return `Group ${groupLetter} fixtures are: ${summary}. Times are local to each venue.`;
  }

  return `Los partidos del Grupo ${groupLetter} son: ${summary}. Las horas son locales de cada sede.`;
}

function teamFixturesResponse(lang, team, worldCup) {
  const fixtures = worldCup.group_stage_fixtures.filter((fixture) => fixture.teams.includes(team));
  const group = Object.entries(worldCup.groups).find(([, teams]) => teams.includes(team))?.[0];

  if (!fixtures.length) {
    return lang === "en"
      ? `I found ${team}, but I do not have fixtures for that team.`
      : `Encontré ${team}, pero no tengo partidos registrados para esa selección.`;
  }

  const summary = fixtures.map(shortFixtureText).join("; ");

  if (lang === "en") {
    return `${team} is in Group ${group}. Its group-stage fixtures are: ${summary}. Times are local to each venue.`;
  }

  return `${team} está en el Grupo ${group}. Sus partidos de fase de grupos son: ${summary}. Las horas son locales de cada sede.`;
}

function fixtureResponse(lang, fixture) {
  if (lang === "en") {
    return `${fixture.match} is scheduled for ${formatDate(fixture.date)} in Group ${fixture.group}, at ${fixture.venue}, ${fixture.city}, ${fixture.local_time} local time.`;
  }

  return `${fixture.match} está programado para el ${formatDate(fixture.date)} por el Grupo ${fixture.group}, en ${fixture.venue}, ${fixture.city}, a las ${fixture.local_time} hora local.`;
}

function predictionResponse(lang, knowledgeBase, worldCup, mentionedTeams) {
  if (mentionedTeams.length >= 2) {
    const teams = mentionedTeams.slice(0, 2);
    const matchPrediction = findMatchPredictionByTeams(knowledgeBase, teams);

    if (matchPrediction) {
      return storedPredictionResponse(lang, matchPrediction, teams[0]);
    }

    const weeklyPrediction = findWeeklyPredictionByTeams(knowledgeBase, teams);

    if (weeklyPrediction) {
      return weeklyPredictionResponse(lang, weeklyPrediction, teams[0]);
    }

    const fixture = findFixtureByTeams(worldCup, teams);

    if (fixture) {
      if (lang === "en") {
        return `I found the fixture ${fixture.match}: ${formatDate(fixture.date)}, Group ${fixture.group}, ${fixture.venue}, ${fixture.city}, ${fixture.local_time} local time. The local knowledge base does not have a specific win probability for that match, so I cannot invent one. The platform predictions are simulated and academic.`;
      }

      return `Encontre el partido ${fixture.match}: ${formatDate(fixture.date)}, Grupo ${fixture.group}, ${fixture.venue}, ${fixture.city}, ${fixture.local_time} hora local. La base local no tiene una probabilidad especifica de victoria para ese cruce, asi que no debo inventarla. Las predicciones de la plataforma son simuladas y academicas.`;
    }

    if (lang === "en") {
      return `The local knowledge base does not have a registered fixture or specific win probability for ${teams.join(" vs ")}. The platform only shows simulated academic predictions.`;
    }

    return `La base local no tiene un partido registrado ni una probabilidad especifica de victoria para ${teams.join(" vs ")}. La plataforma solo muestra predicciones simuladas con fines academicos.`;
  }

  const probabilityMetric = knowledgeBase.metrics.find((metric) => normalizeText(metric.title).includes("probabilidad"));

  if (lang === "en") {
    return probabilityMetric
      ? `The data section includes a simulated metric called "${probabilityMetric.title}" with value ${probabilityMetric.value}. To answer a match probability, ask with two teams.`
      : "The platform can explain simulated prediction modules, but I need two teams to look for a specific match probability.";
  }

  return probabilityMetric
    ? `La seccion de datos incluye una metrica simulada llamada "${probabilityMetric.title}" con valor ${probabilityMetric.value}. Para responder una probabilidad de partido, preguntame por dos selecciones.`
    : "La plataforma puede explicar modulos de prediccion simulada, pero necesito dos selecciones para buscar una probabilidad especifica.";
}

function weeklyPredictionResponse(lang, prediction, requestedTeam) {
  const teams = splitMatchTeams(prediction.match);
  const requestedTeamIndex = teams.findIndex((team) => normalizeText(team) === normalizeText(requestedTeam));
  const requestedProbability =
    requestedTeamIndex === 0
      ? prediction.team_a_probability
      : requestedTeamIndex === 1
        ? prediction.team_b_probability
        : "";

  if (lang === "en") {
    const requestedText = requestedProbability ? ` ${requestedTeam} has ${requestedProbability} win probability.` : "";
    return `${prediction.match} is in the simulated weekly prediction table: ${teams[0]} ${prediction.team_a_probability}, draw ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Estimated result: ${prediction.estimated_result}.${requestedText}`;
  }

  const requestedText = requestedProbability ? ` ${requestedTeam} tiene ${requestedProbability} de probabilidad de victoria.` : "";
  return `${prediction.match} esta en la tabla semanal simulada: ${teams[0]} ${prediction.team_a_probability}, empate ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Resultado estimado: ${prediction.estimated_result}.${requestedText}`;
}

function storedPredictionResponse(lang, prediction, requestedTeam) {
  const teams = splitMatchTeams(prediction.match);
  const requestedTeamIndex = teams.findIndex((team) => normalizeText(team) === normalizeText(requestedTeam));
  const requestedProbability =
    requestedTeamIndex === 0
      ? prediction.team_a_probability
      : requestedTeamIndex === 1
        ? prediction.team_b_probability
        : "";

  if (lang === "en") {
    const requestedText = requestedProbability ? ` ${requestedTeam} has ${requestedProbability} win probability.` : "";
    const analysis = prediction.analysis_en ? ` ${prediction.analysis_en}` : "";
    return `${prediction.match} has a simulated prediction: ${teams[0]} ${prediction.team_a_probability}, draw ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Estimated result: ${prediction.estimated_result}.${requestedText}${analysis}`;
  }

  const requestedText = requestedProbability ? ` ${requestedTeam} tiene ${requestedProbability} de probabilidad de victoria.` : "";
  const analysis = prediction.analysis_es ? ` ${prediction.analysis_es}` : "";
  return `${prediction.match} tiene una predicción simulada: ${teams[0]} ${prediction.team_a_probability}, empate ${prediction.draw_probability}, ${teams[1]} ${prediction.team_b_probability}. Resultado estimado: ${prediction.estimated_result}.${requestedText}${analysis}`;
}

function dateFixturesResponse(lang, worldCup, dateValue, dateLabel) {
  const fixtures = worldCup.group_stage_fixtures.filter((fixture) => fixture.date === dateValue);

  if (fixtures.length) {
    const summary = fixtures.map(shortFixtureText).join("; ");

    if (lang === "en") {
      return `The fixtures registered for ${dateLabel} (${formatDate(dateValue)}) are: ${summary}. Times are local to each venue.`;
    }

    return `Los partidos registrados para ${dateLabel} (${formatDate(dateValue)}) son: ${summary}. Las horas son locales de cada sede.`;
  }

  const nextFixture = findNextFixture(worldCup, dateValue);

  if (lang === "en") {
    return nextFixture
      ? `There are no fixtures registered for ${dateLabel} (${formatDate(dateValue)}) in the local World Cup calendar. The next recorded fixture is ${shortFixtureText(nextFixture)}.`
      : `There are no fixtures registered for ${dateLabel} (${formatDate(dateValue)}) in the local World Cup calendar.`;
  }

  return nextFixture
    ? `No hay partidos registrados para ${dateLabel} (${formatDate(dateValue)}) en el calendario local del Mundial. El proximo partido registrado es ${shortFixtureText(nextFixture)}.`
    : `No hay partidos registrados para ${dateLabel} (${formatDate(dateValue)}) en el calendario local del Mundial.`;
}

function shortFixtureText(fixture) {
  return `${fixture.match}, ${formatDate(fixture.date)}, ${fixture.venue}, ${fixture.city}, ${fixture.local_time}`;
}

function findGroupLetter(text) {
  const match = text.match(/\b(?:grupo|group)\s+([a-l])\b/i);
  return match?.[1]?.toUpperCase() || "";
}

function findMentionedTeams(question, worldCup) {
  const normalizedQuestion = normalizeText(question);

  return Object.entries(worldCup.aliases)
    .map(([team, aliases]) => {
      const names = [team, ...aliases].map(normalizeText);
      const index = names.reduce((bestIndex, name) => {
        const currentIndex = normalizedQuestion.indexOf(name);

        if (currentIndex === -1) {
          return bestIndex;
        }

        return bestIndex === -1 || currentIndex < bestIndex ? currentIndex : bestIndex;
      }, -1);

      return { team, index };
    })
    .filter(({ index }) => index >= 0)
    .sort((first, second) => first.index - second.index)
    .map(({ team }) => team);
}

function findFixtureByTeams(worldCup, teams) {
  return worldCup.group_stage_fixtures.find((fixture) =>
    teams.every((team) => fixture.teams.includes(team)),
  );
}

function findWeeklyPredictionByTeams(knowledgeBase, teams) {
  return (knowledgeBase.weekly_prediction_details || []).find((prediction) => {
    const predictionTeams = splitMatchTeams(prediction.match).map(normalizeText);
    const requestedTeams = teams.map(normalizeText);
    return requestedTeams.every((team) => predictionTeams.includes(team));
  });
}

function findMatchPredictionByTeams(knowledgeBase, teams) {
  return (knowledgeBase.match_predictions || []).find((prediction) => {
    const predictionTeams = splitMatchTeams(prediction.match).map(normalizeText);
    const requestedTeams = teams.map(normalizeText);
    return requestedTeams.every((team) => predictionTeams.includes(team));
  });
}

function splitMatchTeams(match) {
  return String(match || "")
    .split(/\s+vs\.?\s+/i)
    .map((team) => team.trim())
    .filter(Boolean);
}

function findNextFixture(worldCup, dateValue) {
  return worldCup.group_stage_fixtures.find((fixture) => fixture.date > dateValue) || null;
}

function getOpeningFixture(worldCup) {
  return worldCup.group_stage_fixtures?.[0] || null;
}

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function includesAny(text, values) {
  return values.some((value) => text.includes(value));
}

function formatDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function dataResponse(lang, knowledgeBase) {
  const metrics = knowledgeBase.metrics.map((metric) => `${metric.title}: ${metric.value}`).join("; ");

  if (lang === "en") {
    return `The data visualization section shows simulated indicators only, including ${metrics}. These values are not live match data and should not be used for betting or financial decisions.`;
  }

  return `La sección de visualización muestra únicamente indicadores simulados, incluyendo ${metrics}. Estos valores no son datos en vivo y no deben usarse para apuestas ni decisiones económicas.`;
}

function teamResponse(lang, knowledgeBase, normalizedQuestion) {
  const yury = knowledgeBase.team.find((member) => normalizeText(member.name).includes("yury"));

  if (normalizedQuestion.includes("yury") || normalizedQuestion.includes("cv") || normalizedQuestion.includes("hoja")) {
    if (lang === "en") {
      return `${yury.name} is the frontend developer, technology support and database management profile. She is an eighth-semester Systems Engineering student at Universidad de Cundinamarca, with knowledge in Laravel, MySQL, PHP, HTML, CSS, programming logic and information analysis.`;
    }

    return `${yury.name} es la desarrolladora frontend, soporte tecnológico y perfil de gestión de bases de datos. Es estudiante de Ingeniería de Sistemas de octavo semestre en la Universidad de Cundinamarca, con conocimientos en Laravel, MySQL, PHP, HTML, CSS, lógica de programación y análisis de información.`;
  }

  const members = knowledgeBase.team.map((member) => `${member.name}: ${member.role}`).join("; ");

  if (lang === "en") {
    return `The technical team includes ${members}. Together they cover frontend development, local data organization, AI concepts and football data analysis.`;
  }

  return `El equipo técnico está integrado por ${members}. En conjunto cubre desarrollo frontend, organización de datos locales, conceptos de IA y análisis de datos futbolísticos.`;
}

function contactResponse(lang, knowledgeBase) {
  const contact = knowledgeBase.contact;

  if (lang === "en") {
    return `Contact information: email ${contact.email}, WhatsApp ${contact.whatsapp}, location ${contact.location}, schedule ${contact.schedule}. The contact form validates name, email, phone, subject and a message of at least 10 characters.`;
  }

  return `Información de contacto: correo ${contact.email}, WhatsApp ${contact.whatsapp}, ubicación ${contact.location}, horario ${contact.schedule}. El formulario valida nombre, correo, teléfono, asunto y mensaje de mínimo 10 caracteres.`;
}

function declarationResponse(lang, knowledgeBase) {
  if (lang === "en") {
    return `The Transhuman Person Declaration says: "${knowledgeBase.declaration.en}". In this project it works as an ethical guide for autonomy, dialogue, human development, wellbeing and social responsibility.`;
  }

  return `La Declaración Persona Transhumana dice: "${knowledgeBase.declaration.es}". En este proyecto funciona como guía ética para autonomía, diálogo, desarrollo humano, bienestar y responsabilidad social.`;
}

function geminiResponse(lang, knowledgeBase) {
  if (lang === "en") {
    return `The project includes an optional Gemini proxy example. The API key must stay on the backend as an environment variable, never in public JavaScript. The final model name should be validated in Google AI Studio before production.`;
  }

  return `El proyecto incluye un proxy opcional de Gemini. La API key debe permanecer en el backend como variable de entorno, nunca en JavaScript público. El nombre final del modelo debe validarse en Google AI Studio antes de producción.`;
}
