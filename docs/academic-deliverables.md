# Academic Deliverables

## Checklist

- GitHub repository link: pending
- Explanatory video link: pending
- Functional project: included
- Technical README: included
- Bilingual chatbot evidence: included
- Transhuman Person Declaration evidence: included
- Local knowledge base: included
- Gemini proxy example: included
- Contact form validation: included

## Suggested Screenshots

- Home section with the title “Mundial de Fútbol Inteligente”.
- Side navigation menu with active section.
- Analysis modules rendered from `modules.json`.
- Data visualization cards and weekly prediction table.
- Technical team section with Yury Andrea Dorado Lucas profile.
- Chatbot initial message with the Transhuman Person Declaration.
- Spanish chatbot answer.
- English chatbot answer.
- Fallback answer for an external question.
- Contact form showing validation errors and success message.

## Steps to Test the Chatbot

1. Run a local server from the project root: `python -m http.server 5500`.
2. Open `http://localhost:5500/`.
3. Go to the “Chatbot mundialista” section.
4. Ask a platform-related question in Spanish.
5. Change the language selector to English or ask in English.
6. Ask an external question to validate the fallback.
7. Confirm that the initial message and visible panel include the Transhuman Person Declaration.

## Spanish Test Questions

- ¿Qué módulos tiene la plataforma?
- ¿Qué datos simulados muestra la visualización?
- ¿Quién es Yury Andrea Dorado Lucas?
- ¿Qué significa la Declaración Persona Transhumana?
- ¿Cómo se protege la API key de Gemini?

## English Test Questions

- What is the purpose of the platform?
- What analysis modules are included?
- What simulated data does the platform show?
- Who is Yury Andrea Dorado Lucas?
- How is the Gemini API key protected?

## External Questions for Fallback Validation

- ¿Quién es el presidente de Colombia?
- Dame una recomendación de apuestas deportivas.
- What is the price of Bitcoin today?
- Can you give me medical advice?
- What stock should I buy?

Expected Spanish fallback:

```txt
Lo siento, solo puedo responder preguntas relacionadas con la plataforma de predicción futbolística y mundialista presentada en esta página.
```

Expected English fallback:

```txt
Sorry, I can only answer questions related to the football and World Cup prediction platform presented on this page.
```
