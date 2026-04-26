#### QadamGraph

Mobile-first offline-first PWA skeleton for rural school students in Kazakhstan.

```bash
npm install
npm run dev
```

Demo registration/login is local-only. App data is saved as one JSON object in
`localStorage` under `qadamgraph:app-json`.

### AI portfolio API

Run the frontend and backend in two terminals:

```bash
npm run dev
npm run dev:backend
```

The portfolio screen calls `/api/portfolio`; Vite proxies it to the local backend, and the backend
calls the OpenAI Responses API. Create `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-5.2
```

Restart `npm.cmd run dev:backend` after changing `.env.local`. If the key is missing or the request
fails, the app still creates a local fallback draft for the hackathon demo.

The prompt is shaped around public university portfolio guidance: curated evidence, recent work,
the student's personal role, project context, program fit, and missing proof to collect next.
