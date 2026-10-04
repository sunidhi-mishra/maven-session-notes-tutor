import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileText, NotebookPen, Target, Mic, Settings, Lock, LogOut, Sparkles, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { UnlimitedPill, UserBlock } from "@/components/brand";
import { useMaven } from "@/lib/maven-store";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/maven")({
  head: () => ({
    meta: [
      { title: "Maven — Ask your Ayuda session" },
      { name: "description", content: "Upload your Ayuda session transcript and ask Maven questions, generate notes or take a quiz." },
      { property: "og:title", content: "Maven — Ask your Ayuda session" },
      { property: "og:description", content: "Upload your Ayuda session transcript and ask Maven questions, generate notes or take a quiz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MavenLayout,
});

function MavenLayout() {
  const { transcript, clearTranscript } = useMaven();
  const locked = !transcript;
  const item = "flex h-12 items-center gap-2.5 border-l-[3px] px-3 text-sm";
  const active = { className: `${item} border-primary bg-brand-soft font-medium text-primary` };
  const inactive = { className: `${item} border-transparent text-foreground hover:bg-muted` };

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-[60px] shrink-0 items-center gap-8 border-b px-5">
        <Link to="/" className="flex items-center gap-2" title="Back to Ayuda">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <div className="leading-none">
            <div className="flex items-center gap-1 text-xl font-bold tracking-tight">
              <Sparkles className="h-4 w-4 text-primary" /> maven
            </div>
            <div className="mt-0.5 pl-5 text-[10px] text-muted-foreground">by ayuda</div>
          </div>
        </Link>
        <div>
          <div className="text-sm font-bold">Sunidhi Mishra</div>
          <div className="text-xs text-muted-foreground">Batch: Flagship Cohort 20</div>
        </div>
        <Link to="/" className="ml-auto text-xs font-medium text-primary hover:underline">← Back to Ayuda</Link>
        <button className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </header>

      {transcript && (
        <div className="flex shrink-0 items-center gap-2 border-l-[3px] border-primary bg-brand-soft px-5 py-2 text-sm">
          📄 Loaded: <span className="font-medium">{transcript.name}</span> ·
          <button onClick={clearTranscript} className="flex items-center gap-1 text-muted-foreground hover:text-danger">
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[200px] shrink-0 flex-col border-r py-3">
          <nav className="flex flex-col">
            <Link to="/maven" activeOptions={{ exact: true }} activeProps={active} inactiveProps={inactive}>
              <FileText className="h-4 w-4" /> Ask Maven
            </Link>
            <Link to="/maven/notes" activeProps={active} inactiveProps={inactive}>
              <NotebookPen className="h-4 w-4" /> <span className="flex-1">Generate Notes</span>
              {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Link>
            <Link to="/maven/quiz" activeProps={active} inactiveProps={inactive}>
              <Target className="h-4 w-4" /> <span className="flex-1">Take Quiz</span>
              {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </Link>
            <Link to="/maven/interview" activeProps={active} inactiveProps={inactive}>
              <Mic className="h-4 w-4" /> Interview Prep
            </Link>
            <div className="mx-3 my-2 border-t" />
            <Link to="/maven/admin" activeProps={active} inactiveProps={inactive}>
              <Settings className="h-4 w-4" /> Admin
            </Link>
            <div className="px-4 text-[11px] text-muted-foreground">No auth required · Prototype only</div>
          </nav>
          <div className="mt-auto flex flex-col gap-4 px-3">
            <UnlimitedPill />
            <div className="[&_div]:text-xs"><UserBlock /></div>
          </div>
        </aside>
        <main className="relative min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <FeedbackModal />
    </div>
  );
}

function FeedbackModal() {
  const { feedbackOpen, setFeedbackOpen, submitFeedback, transcript } = useMaven();
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const close = () => setFeedbackOpen(false);

  return (
    <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
      <DialogContent className="max-w-[440px] rounded-2xl shadow-modal">
        <DialogTitle className="text-lg font-bold">How's Maven doing? 👋</DialogTitle>
        <p className="text-sm">We'd love to know if this feature is useful.</p>
        <p className="-mt-2 text-xs text-muted-foreground">Takes 10 seconds. Completely optional.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setRating("positive")}
            className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-sm font-medium ${
              rating === "positive" ? "border-success bg-success text-primary-foreground" : "hover:border-success"
            }`}
          >
            <ThumbsUp className="h-4 w-4" /> Helpful
          </button>
          <button
            onClick={() => setRating("negative")}
            className={`flex h-14 items-center justify-center gap-2 rounded-lg border text-sm font-medium ${
              rating === "negative" ? "border-danger bg-danger text-primary-foreground" : "hover:border-danger"
            }`}
          >
            <ThumbsDown className="h-4 w-4" /> Not helpful
          </button>
        </div>
        {rating && (
          <div className="slide-down">
            <textarea
              value={comment}
              maxLength={300}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any suggestions or thoughts? (optional)"
              className="h-24 w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-primary"
            />
            <div className="text-right text-xs text-muted-foreground">{comment.length}/300</div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={close} className="h-11 rounded-lg px-4 text-sm text-muted-foreground hover:bg-muted">Skip</button>
          <button
            disabled={!rating}
            onClick={async () => {
              if (!rating) return;
              const ok = await submitFeedback({
                session: transcript?.name ?? null,
                rating,
                comment: comment.trim() || null,
                timestamp: new Date().toISOString(),
              });
              if (!ok) {
                toast.error("Feedback could not be saved. Please try again.", {
                  duration: 4000,
                  style: { color: "#EF4444" },
                });
                return;
              }
              toast("Thanks for your feedback! 🙏", { duration: 3000 });
              close();
            }}
            className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Submit Feedback
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
