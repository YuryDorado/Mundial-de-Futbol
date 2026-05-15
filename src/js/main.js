import { initChatbot } from "./chatbot.js";
import { initContactValidation } from "./contact-validation.js";
import { initDataRendering } from "./data-render.js";
import { initNavigation } from "./navigation.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initContactValidation();

  initDataRendering().catch((error) => {
    console.error("Error cargando datos locales:", error);
  });

  initChatbot().catch((error) => {
    console.error("Error iniciando chatbot:", error);
  });
});
