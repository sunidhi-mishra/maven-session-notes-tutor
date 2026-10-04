import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, Copy, Download, RotateCcw, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMaven } from "@/lib/maven-store";
import { generateNotes } from "@/lib/maven.functions";
import { Locked } from "@/components/maven/Locked";

export const Route = createFileRoute("/maven/notes")({
  head: () => ({ meta: [{ title: "Generate Notes — Maven" }] }),
  component: NotesPage,
});

const STAGES = ["📖 Reading your transcript...", "🗂️ Organizing concepts...", "✍️ Generating your notes..."];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function NotesPage() {
  const { transcript, notes, setNotes, triggerFeedback } = useMaven();
  const gen = useServerFn(generateNotes);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) return;
    setStage(0);
    const a = setTimeout(() => setStage(1), 8000);
    const b = setTimeout(() => setStage(2), 16000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [loading]);

  if (!transcript) return <Locked />;

  const run = async () => {
    setLoading(true);
    try {
      const { notes } = await gen({ data: { transcript: transcript.text } });
      setNotes(notes);
      triggerFeedback();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate notes");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">{STAGES[stage]}</p>
      </div>
    );

  if (!notes)
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">📝 Session Notes</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Maven reads your full transcript and generates structured study notes — useful if you missed the session or want a quick review.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">(Takes 20–40 seconds for a full session transcript)</p>
        <button onClick={run} className="mt-5 h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Generate Notes
        </button>
      </div>
    );

  const download = () => {
    const blob = new Blob([notes], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slug(transcript.title) || "session"}-notes.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 border-b px-8 py-3">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(notes);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm hover:bg-muted"
        >
          {copied ? <><Check className="h-4 w-4 text-success" /> Copied! ✓</> : <><Copy className="h-4 w-4" /> Copy</>}
        </button>
        <button onClick={download} className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm hover:bg-muted">
          <Download className="h-4 w-4" /> Download .md
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <article className="prose-maven mx-auto max-w-3xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
        </article>
        <div className="mx-auto mt-8 max-w-3xl">
          <button onClick={run} className="flex h-11 items-center gap-2 rounded-lg border px-4 text-sm text-muted-foreground hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> Regenerate Notes
          </button>
        </div>
      </div>
    </div>
  );
}
