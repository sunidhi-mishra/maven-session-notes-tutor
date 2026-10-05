# 📚 Maven - AI Session Tutor

Maven is an AI learning layer for Ayuda LMS. It turns an Ayuda session transcript into a reusable learning context so learners can revisit concepts, generate notes, test their understanding, and move from learning to interview preparation without rewatching an entire session.

Built for the Ayuda AI Build Hackathon using React, TanStack Start, BM25 retrieval, prompt engineering, and Lovable AI.

## 🔗 Project Links / Resources

- **Live Lovable Link:** [Open the live application](https://maven-ayuda-chatbot.lovable.app/)
- **Loom Video:** [Watch the screen recording demonstrating the working of the application](https://www.loom.com/share/849269bfb59d4ac3b42a4bdaf980fb4c)
- **Presentation:** [View the product presentation](https://docs.google.com/presentation/d/1twdfwrjxC9edTzb__W8RPky4XjsDGspcYzi9uxl0fcw/edit?usp=sharing)

## 🎯 Problem and Purpose

Ayuda sessions can last two to three hours. Afterward, learners may remember that a topic was discussed but not where to find it, and a generic chatbot may answer from outside knowledge instead of the instructor’s material.

Maven treats the uploaded transcript as the source of truth:

> Revisit → Understand → Validate → Apply


## ✨ Core Features

### 💬 Ask Maven

- Upload an Ayuda `.txt` transcript or load the bundled demo transcript.
- Ask questions about the session.
- Retrieve relevant transcript evidence with browser-based BM25 ranking.
- Return grounded answers with transcript citations when evidence is sufficient.
- Refuse unsupported, out-of-scope, or transcript-only questions rather than using general model knowledge.
- Offer an instructor escalation path when a question cannot be answered.

The system distinguishes between a concept that is directly explained and one that is merely mentioned.

### 📝 Generate Notes

Notes use the full transcript rather than selective retrieval so that the output can cover the entire session. The generated Markdown includes:

- Session title, date, and instructor
- Overview and core concepts
- Detailed notes and Q&A
- Key takeaways
- Glossary

Notes can be rendered, copied, downloaded as Markdown, and regenerated.

### 🧠 Take a Quiz

The full transcript is used to generate a multiple-choice quiz. Learners answer one question at a time and receive:

- Correct/incorrect feedback
- Explanations
- Running score
- Final performance feedback
- Topics to revisit
- Interview-preparation handoff

### 🚀 Interview Preparation

Maven links to the existing Interview Maestro and curated interview resources instead of rebuilding a separate interview-practice product.

### 💡 Feedback

After the first successful AI interaction, Maven offers lightweight positive/negative feedback with an optional comment. Feedback is persisted in Supabase with the session, rating, comment, and database timestamp.

## ⚙️ How It Works

```text
Upload transcript
      │
      ├── Ask Maven ──> chunk ──> BM25 ──> top 4 chunks ──> grounded answer
      │
      ├── Notes ──────> full transcript ──> structured Markdown
      │
      └── Quiz ───────> full transcript ──> validated MCQ JSON
```

### Ask Maven retrieval

1. The uploaded transcript is validated for `.txt` format, minimum size, and transcript-like markers.
2. It is chunked at approximately 1,200 characters with approximately 200 characters of overlap, while attempting to preserve newline boundaries.
3. The browser tokenizes the question and chunks, removes stop words, and ranks them with BM25-style TF/IDF scoring.
4. Up to four positive-scoring chunks are sent to the AI server function.
5. The model answers using the supplied transcript context, recent conversation history, and session title.

This prototype has no embeddings, vector database, server-side retrieval, or similarity threshold. BM25 was chosen to keep the hackathon implementation lightweight and browser-based; semantic server-side retrieval is a future production direction.

### Grounding and failure behavior

| Situation | Maven behavior |
|---|---|
| Directly explained | Answer with transcript evidence and citation. |
| Mentioned but not explained | Avoid manufacturing an explanation. |
| Not covered | Return a not-found response and provide instructor escalation. |
| Outside scope | Do not answer from general model knowledge. |

This behavior is intentional for an educational product: a confident unsupported answer can create a wrong mental model.

### Notes and quiz generation

Notes and quizzes intentionally send the complete transcript to the AI layer because selective retrieval could omit important concepts, examples, or Q&A. Inputs are limited to 400,000 characters.

Quiz output is extracted from model text, parsed as JSON, and validated with Zod. Each question must contain exactly four options, a correct answer from `A`–`D`, an explanation, and a topic. JSON text extraction is used because the gateway rejected `json_object` mode.

## 🏗️ Architecture

### 🎨 Frontend

- React 19 with TypeScript
- TanStack Start and file-based TanStack Router
- Tailwind CSS v4 with custom properties and `tw-animate-css`
- Radix/shadcn-style UI components
- `react-markdown` and `remark-gfm` for AI-generated Markdown
- Sonner notifications
- `MavenProvider` for transcript, chat, notes, quiz, and feedback state

The main routes are:

| Route | Purpose |
|---|---|
| `/` | Mock Ayuda announcements and schedule dashboard |
| `/maven` | Transcript upload/demo loading and grounded chat |
| `/maven/notes` | Notes generation, rendering, copy, download, and regeneration |
| `/maven/quiz` | Quiz generation, interaction, scoring, and feedback |
| `/maven/interview` | External interview-preparation resources |
| `/maven/admin` | Static AI-transparency and prototype/admin screen |

### 🤖 Backend and AI

TanStack Start server functions form the backend boundary:

- `askSession`
- `generateNotes`
- `generateQuiz`

All three are POST-only and validate input with Zod. They are centralized in [`src/lib/maven.functions.ts`](src/lib/maven.functions.ts) and call the Lovable AI gateway at `https://ai.gateway.lovable.dev/v1/responses` using the server-side `LOVABLE_API_KEY`. The configured model is `openai/gpt-6-luna` with low reasoning effort.

The Ask Maven prompt requires transcript-grounded answers, handles greetings and out-of-scope requests, distinguishes direct explanation from a passing mention, and requests quote/speaker/timestamp/title citations where supported. HTTP 429 and 402 responses are surfaced explicitly; other failed gateway responses are logged and reported as errors.

The server startup registers Supabase client middleware, CSRF protection for server functions, and error handling for unexpected failures. There are no application-specific REST API routes; the TanStack server functions are the application API boundary.

### 💾 State, Storage, and Authentication

- Active transcript, chunks, chat, notes, quiz state, and feedback-modal state live in React context.
- The active learning session is not persisted to local storage, a database, or the URL; reloading loses it.
- The demo transcript is bundled in the client.
- Supabase stores feedback in the `maven_feedback` table.
- Supabase auth middleware and token attachment exist in the repository, but the current Maven server functions do not enforce authentication. The prototype UI is explicitly “No auth required.”
- The admin page is a static transparency prototype; it does not read live feedback, inspect live AI calls, or change prompts.

## ⚠️ Product Decisions and Limitations

- **Standalone prototype:** Maven validates the learning experience without deep Ayuda LMS integration.
- **Manual upload:** The prototype does not automatically retrieve transcripts from Ayuda.
- **Single-session context:** The current workflow uses one transcript held in browser memory.
- **Desktop-first:** Mobile support is outside the prototype scope.
- **External interview prep:** Interview application is handled through linked resources.
- **Limited analytics:** Feedback is stored, but the admin page currently shows placeholder totals and does not provide live analytics.
- **Approximate timestamps:** Some transcript chunks do not contain complete speaker or timestamp headers.
- **Prototype security:** Production admin authentication is not implemented.

## 📈 Measuring Success

The intended North Star is the percentage of active learners who complete a Maven learning loop within a session:

```text
Ask Maven or Notes → Quiz or Interview Prep
```

Supporting measures include grounded-answer accuracy, correct citation and refusal behavior, feature progression, and learner helpfulness. The current implementation persists Ask Maven feedback; broader event instrumentation would be a future step.

## 🧪 Evaluation and Lessons

The product evaluation focused on:

- Paraphrased and applied questions
- Source attribution and citation quality
- Prompt-injection and general-knowledge requests
- False premises and instruction conflicts
- Out-of-scope questions

The documented test cases were used to verify that Maven stays within the uploaded transcript, preserves transcript nuance, and refuses unsupported answers.

Three implementation issues shaped the prototype:

1. **Notes timeout:** Large transcripts and extended reasoning exceeded the gateway timeout. The implementation moved to `openai/gpt-6-luna` with low reasoning effort.
2. **Speaker attribution:** Retrieved chunks could begin mid-speech without a speaker header. The prompt includes a fallback attribution rule for the documented instructor.
3. **Misleading admin metric:** An initial similarity-threshold display implied vector retrieval. It was replaced with the actual BM25 retrieval method.

## 🔮 Future Directions

The documented production direction includes:

1. Populate transcripts directly from Ayuda LMS.
2. Replace browser BM25 with server-side semantic retrieval.
3. Generate and store reusable session notes in Supabase.
4. Surface unanswered questions and learner feedback in a live admin view.
5. Add more precise video references for transcript chunks.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, TanStack Start, TanStack Router |
| Styling and UI | Tailwind CSS v4, Radix/shadcn-style components |
| AI | Lovable AI gateway, Responses API, `openai/gpt-6-luna` |
| Retrieval | Browser-based BM25-style keyword retrieval |
| Validation | Zod |
| Persistence | Supabase (`maven_feedback`) |
| Markdown | `react-markdown`, `remark-gfm` |
| Build and deployment tooling | Vite, Nitro/TanStack Start, Lovable configuration |

## ☁️ Deployment

The application is available through the [Live Lovable Link](https://maven-ayuda-chatbot.lovable.app/). The repository contains Lovable/Vite/TanStack Start configuration and Supabase configuration, but no separate Docker, Wrangler, Netlify, or Vercel deployment setup. It should be treated as a hackathon prototype rather than a production deployment.

## 💻 Local Development

The repository defines these scripts in [`package.json`](package.json):

```bash
bun run dev
bun run build
bun run build:dev
bun run preview
bun run lint
bun run format
bun run test
bun run test:watch
```

The project expects the environment variables used by the checked-in integrations:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LOVABLE_API_KEY` (server-side AI gateway access)

Use the package manager and environment configuration appropriate to your local setup. The repository includes Supabase configuration under [`supabase/`](supabase/) and Vite/TanStack Start configuration in [`vite.config.ts`](vite.config.ts).

## ✅ Testing

The visible test suite includes a routing smoke test in [`src/test/app-routing.test.tsx`](src/test/app-routing.test.tsx). It covers the index and not-found route mounts. Retrieval scoring, prompt behavior, server functions, quiz parsing, feedback persistence, and authentication do not currently have visible automated tests.

## 📂 Repository Structure

```text
src/
  components/              Shared brand, Maven, and UI components
  integrations/supabase/   Supabase clients, types, and auth plumbing
  lib/
    demo-transcript.ts     Bundled demo transcript
    maven-store.tsx        Client-side Maven state and feedback
    maven.functions.ts     AI server functions
    rag.ts                 Browser-side chunking and BM25 retrieval
  routes/                  Dashboard, Maven features, and admin prototype
  server.ts                TanStack Start server entry
  start.ts                 Server middleware and error handling
  test/                    Vitest tests
public/                    Static assets
supabase/                  Supabase project configuration
```

## 🙌 Credits

**Sunidhi Mishra**
Built as part of the Ayuda AI Build Hackathon.

Product: Maven - Session Notes Tutor
Focus: AI product management, RAG, prompt engineering, product design, and evaluation.
