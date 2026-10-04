import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

export const Route = createFileRoute("/maven/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Maven" },
      { name: "description", content: "Maven admin panel: AI holes, system prompts, parameters, retrieved chunks and feedback overview." },
      { property: "og:title", content: "Admin Panel — Maven" },
      { property: "og:description", content: "Maven admin panel: AI holes, system prompts, parameters, retrieved chunks and feedback overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "ask" | "notes" | "quiz";
const DOC = "https://docs.google.com/document/d/1Uua_k65yJxGfuiaEkUlcjFhTJ5jN_GKZ0kl53DgSzcM/edit?usp=sharing";

const TABS: { id: Tab; label: string }[] = [
  { id: "ask", label: "Ask Maven" },
  { id: "notes", label: "Generate Notes" },
  { id: "quiz", label: "Take Quiz" },
];

const HOLES: Record<Tab, { name: string; color: string; desc: string }[]> = {
  ask: [
    { name: "Classify", color: "border-l-hole-blue", desc: "Fires twice: validates the uploaded .txt file as VALID_TRANSCRIPT, EMPTY_FILE, or UNRELATED_CONTENT before ingestion; then routes every user message into SESSION_QUESTION, GREETING_OR_META, or OUT_OF_SCOPE before retrieval" },
    { name: "Extract", color: "border-l-hole-purple", desc: "Retrieves the top-K most semantically similar chunks from the ingested transcript via Lovable's RAG connector" },
    { name: "Judge", color: "border-l-hole-green", desc: "Evaluates whether retrieved chunks directly explain the concept asked — being mentioned is not enough; being explained is required" },
    { name: "Generate", color: "border-l-hole-red", desc: "Fires thrice; produces the answer with citation block, the not-found escalation to instructor, or the greeting/meta response — based on upstream verdict" },
  ],
  notes: [
    { name: "Transform", color: "border-l-hole-blue", desc: "Converts the full spoken transcript into clean written language — removes fillers and repetition while preserving every concept, analogy, and Q&A exchange" },
    { name: "Summarise", color: "border-l-hole-purple", desc: "Groups the cleaned content into structured categories: session overview, core concepts, detailed notes by topic, Q&A pairs, key takeaways, and glossary terms" },
    { name: "Generate", color: "border-l-hole-red", desc: "Produces the complete session notes as a single Markdown document in the exact prescribed format, ready to copy or download as a .md file" },
  ],
  quiz: [
    { name: "Generate", color: "border-l-hole-red", desc: "Fires twice: creates 3–5 questions sampled across distinct concept areas at quiz start, then produces the final score screen with performance-band comment at quiz end" },
    { name: "Converse", color: "border-l-hole-blue", desc: "Manages the quiz as a live turn-by-turn conversation — presents one question at a time, tracks question position and score using conversation history as state" },
    { name: "Judge", color: "border-l-hole-green", desc: "Evaluates each student answer, returns a correct/incorrect verdict with a single session-grounded explanation sentence, then signals Converse to advance" },
  ],
};

const PIPELINE: Record<Tab, string> = {
  ask: "Pipeline: Classify → Extract → Judge → Generate (4 calls total in production architecture)",
  notes: "Pipeline: Transform → Summarise → Generate (3 calls total in production architecture) · Context method: Full transcript passed directly — no RAG retrieval, gated by feature 1",
  quiz: "Pipeline: Generate (question bank) → Converse (turn management) → Judge (per answer) → Generate (score screen) (3 calls total in production architecture) · Context method: Full transcript passed directly — no RAG retrieval, gated by feature 1",
};

const CHUNKS = [
  { pct: 80, score: "0.87", quote: "...so tokenization is basically breaking down your massive text data set into smaller units. These are called tokens — they can be words, characters, whatever, but the smallest unit...", at: "~58 min mark" },
  { pct: 65, score: "0.74", quote: "...a standard tokenization length is around two and a half words, which is why I said the two and a half words earlier...", at: "~61 min mark" },
  { pct: 52, score: "0.61", quote: "...byte pair encoding is basically an algorithm that merges the most common occurring pairs and tries to create a very simple method of tokenization...", at: "~65 min mark" },
];

const Note = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 text-[13px] italic text-muted-foreground">{children}</p>
);

function Section({ label, extra, children }: { label: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 border-b border-brand-line pb-1.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{label}</h3>
        {extra}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function AdminPage() {
  const [tab, setTab] = useState<Tab>("ask");
  const feature = TABS.find((t) => t.id === tab)!.label;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[900px] px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning-ink">
            ⚠️ No auth required · Prototype only
          </span>
        </div>

        <div className="mt-5 flex gap-6 border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-2 text-sm font-medium ${
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-8 pt-3">
          <Section label="AI Holes Used">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="w-[180px] px-4 py-2 font-semibold">AI Hole</th>
                    <th className="px-4 py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {HOLES[tab].map((h) => (
                    <tr key={h.name} className="border-t">
                      <td className={`w-[180px] border-l-4 px-4 py-3 align-top font-semibold ${h.color}`}>{h.name}</td>
                      <td className="px-4 py-3 text-foreground/80">{h.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Note>{PIPELINE[tab]}</Note>
          </Section>

          <Section label="System Prompt">
            <div className="rounded-lg border-l-[3px] border-primary bg-brand-soft p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl leading-none">📄</span>
                <div>
                  <p className="text-sm text-foreground/80">
                    The full multi-call system prompts for {feature} are documented in the production architecture reference.
                  </p>
                  <a
                    href={DOC}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-md border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    View detailed system prompts ↗
                  </a>
                </div>
              </div>
            </div>
          </Section>

          <Section label={tab === "ask" ? "RAG Parameters" : "Context Parameters"}>
            {tab === "ask" ? (
              <>
                <div className="flex gap-4">
                  {[
                    { l: "Top-K", v: "4", d: "How many chunks go to the model" },
                    { l: "Retrieval Method", v: "BM25", d: "Keyword-based ranking. Top-K highest-scoring chunks passed to model. No vector embeddings." },
                    { l: "Temperature", v: "0.3", d: "Controls answer creativity vs accuracy" },
                  ].map((c) => (
                    <div key={c.l} className="flex-1 rounded-xl border bg-card p-5">
                      <div className="text-xs text-muted-foreground">{c.l}</div>
                      <div className="mt-1 text-[28px] font-bold text-primary">{c.v}</div>
                      <div className="text-xs text-muted-foreground">{c.d}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-md border bg-muted/60 p-3 text-[13px]">
                  Context method: BM25 keyword retrieval · Top-K highest-ranked chunks passed to model, not full transcript
                </div>
                <Note>Parameters are fixed in this prototype — Lovable uses BM25 keyword retrieval in-browser. In the production build, admins can tune Top-K and switch to server-side vector embeddings with a configurable similarity threshold from this panel.</Note>
              </>
            ) : (
              <div className="divide-y rounded-xl border bg-card p-5 [&>div]:py-2.5">
                <ParamRow label="Context method"><span className="text-sm font-bold">Full transcript passed directly to LLM</span></ParamRow>
                <ParamRow label="Temperature"><span className="text-sm font-bold text-primary">{tab === "notes" ? "0.2" : "0.4"}</span></ParamRow>
                <ParamRow label="Top-K"><span className="text-[13px] italic text-muted-foreground">Not applicable — no vector retrieval</span></ParamRow>
                <ParamRow label="Similarity threshold"><span className="text-[13px] italic text-muted-foreground">Not applicable</span></ParamRow>
              </div>
            )}
          </Section>

          <Section
            label="Retrieved Chunks"
            extra={tab === "ask" && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Illustrative example</span>}
          >
            {tab === "ask" ? (
              <>
                <div className="divide-y rounded-lg border">
                  {CHUNKS.map((c, i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground">Chunk {i + 1}</span>
                        <div className="h-1.5 w-[120px] overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                        </div>
                        <span className="ml-auto text-xs font-medium text-primary">Score: {c.score}</span>
                      </div>
                      <p className="mt-2 text-[13px] italic text-foreground/80">"{c.quote}"</p>
                      <p className="mt-1 text-xs text-muted-foreground">— Malay Krishna, {c.at}</p>
                    </div>
                  ))}
                </div>
                <Note>This is an illustrative example using real transcript content. In the production build, this panel shows live retrieved chunks for the last student query.</Note>
              </>
            ) : (
              <div className="rounded-lg border bg-muted/60 p-4 text-[13px] text-muted-foreground">
                ℹ️{" "}
                {tab === "notes"
                  ? "Chunk retrieval does not apply to Generate Notes. The complete transcript is passed directly to the LLM as context. This is intentional — notes generation requires the full session content, not selective chunk retrieval."
                  : "Chunk retrieval does not apply to Take Quiz. The complete transcript is passed directly to the LLM as context. Quiz questions are generated by sampling across the full session, not from retrieved chunks."}
              </div>
            )}
          </Section>

          <Section label="Feedback Overview">
            <p className="text-[13px] text-muted-foreground">Feedback collected via user-side modal · Stored in Supabase in the production build</p>
            <div className="mb-4 mt-3 flex gap-3">
              {["Total Responses: —", "👍 Positive: —", "👎 Negative: —"].map((p) => (
                <span key={p} className="rounded-full bg-muted px-3.5 py-2 text-sm">{p}</span>
              ))}
            </div>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead className="bg-muted/60 text-left text-xs font-bold text-muted-foreground">
                  <tr>
                    {["Session", "Rating", "Comment", "Time"].map((h) => (
                      <th key={h} className="px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td colSpan={4} className="px-4 py-6 text-center text-[13px] italic text-muted-foreground">
                      Awaiting prototype feedback submissions
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Note>In the production build, this table auto-populates from Supabase and is filterable by session and date range.</Note>
          </Section>
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
