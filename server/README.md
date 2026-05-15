# Gemini Proxy Example

This folder contains an optional backend proxy for Google AI Studio / Gemini.

## Purpose

The frontend must never expose a real API key. This proxy reads `GOOGLE_AI_STUDIO_API_KEY` from environment variables or from the local `.env` file, combines the user question with the local knowledge base, and asks Gemini to answer only within the authorized project scope.

## Important security note

Do not upload `.env` to GitHub. Only upload `.env.example`.

If an API key was previously shared in a chat, screenshot, repository or ZIP file, revoke it in Google AI Studio and generate a new one.

## Environment variables

Create a `.env` file in the project root using `.env.example` as reference:

```env
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_api_key_here
GEMINI_MODEL=gemini-flash-latest
FOOTBALL_API_KEY=your_football_api_key_here
APP_ENV=development
PORT=8787
```

`GEMINI_MODEL` can be changed if Google AI Studio shows a different available model name.

## Run the proxy

From the project root:

```bash
node server/gemini-proxy.js
```

or:

```bash
npm start
```

The proxy listens on:

```txt
http://127.0.0.1:8787/api/chat
```

## Run the frontend

In another terminal, run:

```bash
python -m http.server 5500
```

Then open:

```txt
http://127.0.0.1:5500
```

You can also use the Live Server extension in Visual Studio Code.

## Request example

```bash
curl http://127.0.0.1:8787/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"question\":\"What is the purpose of the platform?\",\"language\":\"en\"}"
```

## Security notes

- Do not commit `.env`.
- Do not place API keys in `src/js`.
- Validate the final Gemini model name in Google AI Studio before production.
- Keep the local scope guard even when using Gemini.
- The chatbot local fallback works even if Gemini is unavailable.
