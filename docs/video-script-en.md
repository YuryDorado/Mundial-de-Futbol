# Video Script - Mundial de Fútbol Inteligente

Hello, my name is Yury Andrea Dorado Lucas. I am an eighth-semester Systems Engineering student at Universidad de Cundinamarca.

The name of my project is Mundial de Fútbol Inteligente. It is a web platform developed with HTML, CSS, and Vanilla JavaScript. The main objective is to present football and World Cup information through analysis modules, simulated data visualization, and a bilingual chatbot.

## Introduction

This project was created for the academic activity called Implementation of a Multilingual Chatbot in a Web Knowledge Management Project. The chatbot helps users understand the platform, its modules, its simulated data, the technical team, contact information, and the ethical orientation of the project.

## Technical Explanation

The project architecture is organized into folders. The main page is `index.html`. The CSS files are located in `src/css`: `styles.css` contains global variables and base styles, `layout.css` defines the page structure, `components.css` styles reusable interface elements, and `responsive.css` adapts the page for tablets and mobile devices.

The JavaScript files are located in `src/js`. The entry point is `main.js`, which initializes navigation, contact form validation, JSON data rendering, and the chatbot. The file `navigation.js` controls the side menu and active section state. The file `contact-validation.js` validates the contact form without reloading the page. The file `data-render.js` loads local JSON files and renders modules, metrics, weekly predictions, and team profiles. The file `chatbot.js` contains the local chatbot logic and bilingual responses. Finally, `utils.js` contains shared helper functions.

The local data files are located in `src/data`. The files `modules.json`, `stats.json`, and `team.json` provide content for the visible sections. The file `knowledge-base.json` is the chatbot knowledge base. It contains the platform description, allowed topics, modules, simulated data, team profiles, contact information, chatbot restrictions, and the Transhuman Person Declaration.

The chatbot workflow starts when the user writes a question in the interface. The JavaScript code validates the message, detects basic language signals or uses the selected language, checks if the question is related to the platform, and returns an answer based only on the local knowledge base. If the question is outside the platform scope, the chatbot returns a fallback message.

For AI integration, the project includes an optional Gemini proxy example inside the `server` folder. This proxy avoids exposing the API key in public frontend code. The API key must be stored as an environment variable called `GOOGLE_AI_STUDIO_API_KEY`. The backend combines the user question with the local knowledge base and asks Gemini to answer only with authorized information. The final Gemini model name should be validated in Google AI Studio before production.

## Demonstration

First, I will open the project in the browser using a local server. The landing page shows a left navigation menu with sections for the home page, football history, analysis modules, data visualization, technical team, chatbot, and contact form.

Now I will demonstrate the chatbot in Spanish. I will ask: “¿Qué módulos tiene la plataforma?” The chatbot should answer in Spanish and list the five analysis modules: current match analysis, World Cup phase prediction, weekly match prediction, historical World Cup data analysis, and AI-assisted prediction.

Now I will demonstrate the chatbot in English. I will ask: “What is the purpose of the platform?” The chatbot should answer in English and explain that the platform presents football and World Cup knowledge with history, simulated data visualization, analysis modules, and a bilingual chatbot.

Next, I will test the domain restriction. I will ask an external question, for example: “Who is the president of Colombia?” The chatbot should not answer that question. It should return the fallback message because it only answers questions related to this platform.

Finally, I will show the Transhuman Person Declaration integrated in the chatbot section. The declaration says: “I am free, autonomous and responsible through dialogue and construction, as a regulatory ideal; I direct, control and dictate my own laws.” In this project, the declaration is used as an ethical component connected with autonomy, human development, wellbeing, positive transformation, and social responsibility.

## Closing

In conclusion, Mundial de Fútbol Inteligente demonstrates a complete academic web project with semantic HTML, modular CSS, Vanilla JavaScript, local JSON data, bilingual chatbot interaction, security awareness for API keys, and an ethical human-centered declaration integrated into the user experience.

Thank you for watching this technical explanation.
