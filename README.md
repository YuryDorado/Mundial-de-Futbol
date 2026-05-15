# Mundial de Fútbol Inteligente

Landing page académica creada con HTML5, CSS3 modular y JavaScript Vanilla para presentar información histórica, módulos de análisis, visualización de datos simulados y un chatbot bilingüe sobre fútbol y Copa Mundial.

## Objetivo general

Desarrollar una plataforma web informativa y responsive que evidencie una solución de gestión del conocimiento con chatbot multilingüe, base de conocimiento local, datos simulados y una integración ética mediante la Declaración Persona Transhumana.

## Tecnologías utilizadas

- HTML5 semántico
- CSS3 modular
- JavaScript Vanilla con módulos ES
- Archivos JSON locales
- Proxy opcional para Gemini / Google AI Studio en `server/`

No se usan React, Vue, Angular, Bootstrap ni API keys reales en el frontend.

## Arquitectura general

El frontend carga datos desde `src/data/*.json`, renderiza módulos, métricas, equipo técnico y tabla semanal con JavaScript, valida el formulario de contacto en el navegador y ejecuta un chatbot local con restricciones de dominio. La carpeta `server/` contiene un ejemplo de proxy para consultar Gemini de forma segura desde backend.

## Estructura de carpetas

```txt
.
├── index.html
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── academic-deliverables.md
│   └── video-script-en.md
├── server/
│   ├── README.md
│   └── gemini-proxy.example.js
└── src/
    ├── assets/
    │   ├── icons/
    │   └── images/
    │       └── hero-pitch.svg
    ├── css/
    │   ├── styles.css
    │   ├── layout.css
    │   ├── components.css
    │   └── responsive.css
    ├── data/
    │   ├── modules.json
    │   ├── team.json
    │   ├── stats.json
    │   ├── knowledge-base.json
    │   └── world-cup-2026.json
    └── js/
        ├── main.js
        ├── navigation.js
        ├── contact-validation.js
        ├── chatbot.js
        ├── data-render.js
        └── utils.js
```

## Ejecución local

Como el proyecto carga archivos JSON con `fetch`, se recomienda usar un servidor local desde la raíz del proyecto:

```bash
python -m http.server 5500
```

Luego abre:

```txt
http://127.0.0.1:5500/
```

También puedes usar la extensión Live Server de Visual Studio Code.

## Ejecución del proxy de Gemini

El chatbot tiene un modo local que funciona sin Gemini. Para probar la conexión opcional con Google AI Studio / Gemini, abre otra terminal desde la raíz del proyecto y ejecuta:

```bash
node server/gemini-proxy.js
```

o:

```bash
npm start
```

El proxy queda disponible en:

```txt
http://127.0.0.1:8787/api/chat
```

Debes tener dos procesos activos cuando quieras probar Gemini:

```txt
Frontend: http://127.0.0.1:5500
Proxy IA: http://127.0.0.1:8787/api/chat
```

## Variables de entorno

Copia `.env.example` a `.env` si vas a probar integraciones reales:

```env
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_studio_api_key_here
GEMINI_MODEL=gemini-flash-latest
FOOTBALL_API_KEY=your_football_api_key_here
APP_ENV=development
PORT=8787
```



## Funcionamiento del chatbot

El chatbot está integrado en la sección “Chatbot mundialista”. Sus respuestas se basan en `src/data/knowledge-base.json`, que contiene información de:

- Inicio
- Historia del fútbol y del Mundial
- Módulos de análisis
- Visualización de datos simulados
- Grupos y calendario de fase de grupos del Mundial 2026
- Equipo técnico
- Contacto
- Declaración Persona Transhumana
- Filosofía ética del proyecto

El chatbot responde en español o inglés, detecta señales básicas del idioma usado y también incluye selector visible. Si la pregunta está fuera del dominio, responde con el mensaje de restricción definido en la base de conocimiento.

## Restricciones del chatbot

- No responde temas externos a la plataforma.
- No inventa datos reales de partidos actuales.
- No afirma que las predicciones sean reales.
- No entrega apuestas deportivas ni recomendaciones de dinero.
- No responde preguntas políticas, médicas, financieras o personales.
- Indica que los datos son simulados cuando corresponde.

## Integración con Gemini / Google AI Studio

Los archivos `server/gemini-proxy.js` y `server/gemini-proxy.example.js` muestran cómo crear un proxy seguro. El frontend no debe llamar Gemini directamente con una API key real. El backend debe leer `GOOGLE_AI_STUDIO_API_KEY` desde variables de entorno, combinar la pregunta con la base de conocimiento local y pedir a Gemini que responda solo con información autorizada.

Nota técnica: el prompt académico menciona `gemini-flash-latest 1.5`; antes de producción se debe validar en Google AI Studio el nombre exacto del modelo disponible.

## Declaración Persona Transhumana

La declaración está integrada de forma visible en la sección del chatbot y como mensaje inicial del asistente:

> Soy LIBRE, AUTÓNOMO Y RESPONSABLE a través del diálogo y la construcción, como ideal regulativo; me dirijo, controlo y dicto mis propias leyes.

Su propósito dentro del proyecto es orientar el sistema hacia ética, autonomía, desarrollo humano, bienestar, transformación positiva y responsabilidad social.

## Pruebas sugeridas

- Pregunta en español: `¿Qué módulos tiene la plataforma?`
- Pregunta en inglés: `What is the purpose of the platform?`
- Pregunta de equipo: `¿Quién es Yury Andrea Dorado Lucas?`
- Pregunta ética: `¿Qué significa la Declaración Persona Transhumana?`
- Pregunta externa: `¿Quién es el presidente de Colombia?`

La pregunta externa debe activar el fallback del chatbot.


## Futuras mejoras

- Integración con una API real de fútbol
- Dashboard con gráficos
- Filtros por selección, grupo o fase del Mundial
- Sistema de favoritos
- Comparador de equipos
- Modo oscuro
- Internacionalización completa
- Deploy en Netlify, Vercel o GitHub Pages
- Backend seguro para Gemini
- Persistencia de conversaciones del chatbot
