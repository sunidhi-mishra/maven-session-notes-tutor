import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CloudUpload, ArrowUp, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMaven } from "@/lib/maven-store";
import { askSession } from "@/lib/maven.functions";
import { retrieve } from "@/lib/rag";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DEMO_TRANSCRIPT, DEMO_TRANSCRIPT_NAME } from "@/lib/demo-transcript";

export const Route = createFileRoute("/maven/")({ component: AskSession });

const looksLikeTranscript = (s: string) =>
  /Session date:/i.test(s) || /Transcript source:/i.test(s) || /^.{1,60}\(\d{1,2}:\d{2}:\d{2}\):/m.test(s);

function AskSession() {
  const { transcript } = useMaven();
  return transcript ? <Chat /> : <Upload />;
}

function Upload() {
  const { loadTranscript } = useMaven();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; text: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const ingest = async (name: string, text: string) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    loadTranscript(name, text);
    setProcessing(false);
    toast.success("✅ Transcript loaded!");
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (input.current) input.current.value = "";
    if (!f.name.toLowerCase().endsWith(".txt")) {
      toast.error("Only .txt files are supported. Download your transcript from the Ayuda session sidebar.");
      return;
    }
    if (f.size <= 500) {
      toast.error("This file appears to be empty. Please check your transcript file.");
      return;
    }
    const text = await f.text();
    if (looksLikeTranscript(text.slice(0, 400))) ingest(f.name, text);
    else setPending({ name: f.name, text });
  };

  if (processing)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> Processing transcript...
      </div>
    );

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
        className="flex h-[240px] w-full max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed border-input px-6 text-center transition-colors hover:border-brand-line hover:bg-brand-soft/40"
      >
        <CloudUpload className="h-10 w-10 text-muted-foreground" />
        <h2 className="mt-2 font-semibold">Upload your session transcript</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Download the .txt file from your Ayuda session sidebar, then upload it here.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Accepts .txt files only</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => input.current?.click()}
            className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse Files
          </button>
          <button
            onClick={() => ingest(DEMO_TRANSCRIPT_NAME, DEMO_TRANSCRIPT)}
            className="h-11 rounded-lg border border-primary px-5 text-sm font-semibold text-primary hover:bg-brand-soft"
          >
            ⚡ Load Demo Transcript
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          'Load Demo' uses the Understanding Basics of Generative AI session (Sep 5, 2026)
        </p>
        <input ref={input} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="max-w-[440px] rounded-2xl shadow-modal">
          <DialogTitle className="text-base font-bold">Unrecognised file</DialogTitle>
          <p className="text-sm">This doesn't look like an Ayuda session transcript. It may not produce useful answers.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPending(null)} className="h-11 rounded-lg border px-4 text-sm hover:bg-muted">Cancel</button>
            <button
              onClick={() => {
                const p = pending!;
                setPending(null);
                ingest(p.name, p.text);
              }}
              className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Upload Anyway
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chat() {
  const { transcript, messages, setMessages, triggerFeedback } = useMaven();
  const ask = useServerFn(askSession);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const q = text.trim();
    if (!q || busy || !transcript) return;
    setText("");
    const history = messages.slice(1).slice(-8);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const { answer } = await ask({
        data: { question: q, chunks: retrieve(transcript.chunks, q, 4), sessionTitle: transcript.text.split(/\r?\n/).find((l) => l.trim())?.trim().slice(0, 300) || transcript.title, history },
      });
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
      triggerFeedback();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="max-w-[75%] self-end rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {m.content}
              </div>
            ) : (
              <div key={i} className="prose-maven max-w-[80%] self-start rounded-2xl rounded-bl-sm border bg-card px-4 py-2.5 shadow-card">
                <AnswerBody content={m.content} />
              </div>
            ),
          )}
          {busy && (
            <div className="flex items-center gap-2 self-start rounded-2xl border bg-card px-4 py-2.5 text-sm text-muted-foreground shadow-card">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching the transcript...
            </div>
          )}
          <div ref={end} />
        </div>
      </div>
      <div className="border-t bg-background px-8 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about this session..."
            className="h-11 flex-1 rounded-lg border px-4 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy}
            aria-label="Send"
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function AnswerBody({ content }: { content: string }) {
  const idx = content.indexOf("📌");
  const main = idx >= 0 ? content.slice(0, idx) : content;
  const cite = idx >= 0 ? content.slice(idx).trim() : "";
  const onLink = (e: MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (href?.includes("wa.me")) {
      e.preventDefault();
      toast("💬 Reach your instructor on WhatsApp: wa.me/918861176082", {
        duration: 3000,
        position: "bottom-center",
        style: { background: "#10B981", color: "#fff", border: "none" },
      });
    } else if (href === "#" || /book/i.test(String(e.currentTarget.textContent))) {
      e.preventDefault();
      toast("📅 In the full build, this opens the Connect section in Ayuda LMS to schedule a 1:1 with your instructor.", {
        duration: 4000,
        position: "bottom-center",
        style: { background: "#7C3AED", color: "#fff", border: "none" },
      });
    }
  };
  const lines = cite.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: ({ node: _n, ...p }) => <a {...p} target="_blank" rel="noreferrer" onClick={(e) => onLink(e, p.href)} /> }}
      >
        {main}
      </ReactMarkdown>
      {cite && (
        <div style={{ borderTop: "1px solid #E5E7EB", marginTop: 12, background: "#F9FAFB", borderRadius: 6, padding: "10px 12px", color: "#6B7280", fontSize: 13 }}>
          {lines.map((l, i) => {
            const dash = l.search(/\s—\s|^—/);
            if (l.startsWith("—")) return <div key={i} style={{ fontWeight: 500, fontStyle: "normal" }}>{l}</div>;
            if (l.startsWith("📌")) {
              const head = "From the session transcript:";
              const rest = l.includes(head) ? l.slice(l.indexOf(head) + head.length).trim() : "";
              return (
                <div key={i}>
                  <div>📌 {head}</div>
                  {rest && <CiteRest text={rest} />}
                </div>
              );
            }
            return dash > 0 ? <CiteRest key={i} text={l} /> : <div key={i} style={{ fontStyle: "italic" }}>{l}</div>;
          })}
        </div>
      )}
    </>
  );
}

function CiteRest({ text }: { text: string }) {
  const d = text.search(/\s—\s/);
  if (d < 0) return <div style={{ fontStyle: "italic" }}>{text}</div>;
  return (
    <>
      <div style={{ fontStyle: "italic" }}>{text.slice(0, d).trim()}</div>
      <div style={{ fontWeight: 500, fontStyle: "normal" }}>{text.slice(d).trim()}</div>
    </>
  );
}
