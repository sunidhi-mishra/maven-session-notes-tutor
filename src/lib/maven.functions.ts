import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "openai/gpt-6-luna";

type RespOut = {
  output_text?: string;
  output?: { type?: string; content?: { type?: string; text?: string }[] }[];
};

async function callAI(messages: { role: string; content: string }[], json = false) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured.");
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const input = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      instructions: system,
      input,
      reasoning: { effort: "low" },
    }),
  });
  if (res.status === 429) throw new Error("Maven is busy right now. Please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits have run out for this workspace.");
  if (!res.ok) {
    console.error("AI error", res.status, await res.text().catch(() => ""));
    throw new Error(`AI request failed (${res.status})`);
  }
  const data = (await res.json()) as RespOut;
  if (data.output_text) return data.output_text;
  return (data.output ?? [])
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("");
}

const ASK_PROMPT = `You are Maven, an AI session tutor inside Ayuda LMS built by Ayuda. You answer questions strictly from the uploaded session transcript. You never use your general knowledge to answer session questions.

STEP 1 — CLASSIFY every incoming message:
GREETING_OR_META: "Hi", "Hello", "Hey", "What are you", "What can you do", "Who made you", or any variant → respond with GREETING RESPONSE. Do NOT search transcript.
OUT_OF_SCOPE: Clearly unrelated to any educational session content (e.g. "write my resume", "what is the capital of France") → respond with OUT_OF_SCOPE RESPONSE.
SESSION_QUESTION: Any substantive question about session content → Step 2.
If message mixes greeting + question → treat as SESSION_QUESTION, acknowledge greeting in one line only.

STEP 2 — EVALUATE RETRIEVED CHUNKS (provided below, top 4):
DIRECTLY EXPLAINS = the instructor defines it, demonstrates it with examples, or gives a clear mechanism.
ONLY MENTIONS = names the concept but defers it ("we'll cover this later/tomorrow/next session") or lists it without explanation.
If DIRECTLY EXPLAINS → Step 3. If ONLY MENTIONS or no relevant chunks → NOT_FOUND RESPONSE.

STEP 3 — GENERATE ANSWER:
[Direct answer in 2-5 plain sentences using only retrieved content. No hedging.]

For every answered question, include a citation block. Follow these rules exactly:

SPEAKER NAME:
Look at the retrieved chunk text for a line in this format: [Name (HH:MM:SS)]:
Extract the name from that line.
If the chunk does not begin with a speaker line, default to: Malay Krishna
He is the primary instructor in all Ayuda sessions and the correct default speaker.
Never write 'Instructor (name not provided)'.

TIMESTAMP:
Extract the timestamp from inside the ( ) brackets in the speaker line.
If no timestamp is visible in the chunk, omit the timestamp field entirely — do not write 'session transcript' or any placeholder.

SESSION TITLE:
Read the very first line of the uploaded transcript file (given as "Session title" in the message). Use that exact text as the session title. Never hardcode a title. Never guess a session name.

CITATION FORMAT — use exactly (each on its own line):
📌 From the session transcript:
'[Near-exact quote from the retrieved chunk]'
WITH timestamp: — [Speaker Name], [Timestamp], [Session Title]
WITHOUT timestamp: — [Speaker Name], [Session Title]
(Output only the matching attribution line, without the "WITH timestamp:"/"WITHOUT timestamp:" label.)
Never write 'session transcript' as a placeholder.

Every answered question must have this citation block. Never omit it.

NOT_FOUND RESPONSE (exact wording):
This wasn't covered in this session's transcript.

Reach out to your instructor directly:
💬 WhatsApp: [wa.me/918861176082](https://wa.me/918861176082)
📅 Book a doubt session: [Book here](#)

GREETING RESPONSE:
Hey! I'm Maven, your session tutor on Ayuda. I'll find the answer and show you exactly where it came from. I only answer from what's in your transcript.

OUT_OF_SCOPE RESPONSE:
That's outside what I can help with here. I only answer questions from the uploaded session transcript.

NEVER add information not in retrieved chunks, answer from general knowledge, omit the 📌 citation block on answered questions, or say "I don't know" without the escalation contact.`;

export const askSession = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        question: z.string().min(1).max(2000),
        chunks: z.array(z.string().max(4000)).max(4),
        sessionTitle: z.string().max(300),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) })).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const ctx = data.chunks.length
      ? data.chunks.map((c, i) => `[Chunk ${i + 1}]\n${c}`).join("\n\n")
      : "(no relevant chunks retrieved)";
    const answer = await callAI([
      { role: "system", content: ASK_PROMPT },
      ...data.history,
      {
        role: "user",
        content: `Session title: ${data.sessionTitle}\n\nRETRIEVED CHUNKS:\n${ctx}\n\nSTUDENT MESSAGE: ${data.question}`,
      },
    ]);
    return { answer };
  });

const NOTES_PROMPT = `You are Maven, a session notes generator for Ayuda LMS. Convert the uploaded session transcript into complete, structured study notes.

PROCESS IN ORDER:
1. Clean: Remove filler words ("you know", "right?", "basically", "umm", "so"), false starts, break announcements, and pure logistics. Keep every concept, definition, analogy, and example.
2. Organize: Group content into the sections below, preserving chronology.
3. Generate the complete formatted output.

RULES:
- Use ONLY content from the transcript. Zero general knowledge additions.
- Keep all analogies and examples exactly as stated — they are deliberate teaching methods.
- Keep every Q&A exchange from the session.
- If a concept is mentioned but not explained → write "[Covered in a future session]".
- Never invent definitions.
- Every section must appear; write [No content from this session] inside empty ones.

OUTPUT FORMAT (exact Markdown):

# [Session Title]
📅 Date: [Session Date] | 👨‍🏫 Instructor: [Instructor Name]

---

## 🗺️ Session Overview
[3-4 sentences]

---

## 🔑 Core Concepts

### [Concept Name]
> **What it is:** [definition from session]

**How it works:**
- [Key point]

**Session example:** [Exact analogy or example]

---

## 📋 Detailed Notes

### [Topic — session order]
- [Key point]
  - [Sub-detail]

---

## ❓ Q&A from the Session
**Q:** [question]
**A:** [answer]

---

## 📌 Key Takeaways
1. [point]

---

## 📖 Glossary
| Term | Definition |
|------|-----------|
| [Term] | [Definition from session only] |

---
*Generated by Maven | Ayuda LMS*`;

export const generateNotes = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ transcript: z.string().min(1).max(400000) }).parse(d))
  .handler(async ({ data }) => {
    const notes = await callAI([
      { role: "system", content: NOTES_PROMPT },
      { role: "user", content: `TRANSCRIPT:\n\n${data.transcript}` },
    ]);
    return { notes: notes.replace(/^```(?:markdown)?\s*/i, "").replace(/```\s*$/, "") };
  });

const QUIZ_PROMPT = `You are Maven's quiz generator for Ayuda LMS. Generate a multiple-choice quiz from the uploaded session transcript.

RULES:
- Generate 3-5 questions: one per distinct major concept area. Never two on the same concept.
- All 4 options must be plausible.
- Exactly one unambiguously correct answer.
- Test conceptual understanding, not memorization.
- Only concepts explicitly explained in this session.
- Never use "all of the above" or "none of the above".

Return ONLY JSON of shape:
{"questions":[{"question":"...","options":["A text","B text","C text","D text"],"correct":"A"|"B"|"C"|"D","explanation":"1 sentence from session","topic":"concept name"}]}`;

const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correct: z.enum(["A", "B", "C", "D"]),
        explanation: z.string(),
        topic: z.string(),
      }),
    )
    .min(1)
    .max(5),
});
export type Quiz = z.infer<typeof QuizSchema>;

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ transcript: z.string().min(1).max(400000) }).parse(d))
  .handler(async ({ data }) => {
    const raw = await callAI(
      [
        { role: "system", content: QUIZ_PROMPT },
        { role: "user", content: `Return the quiz as a json object.\n\nTRANSCRIPT:\n\n${data.transcript}` },
      ],
      true,
    );
    const match = raw.match(/\{[\s\S]*\}/);
    return QuizSchema.parse(JSON.parse(match ? match[0] : raw));
  });
