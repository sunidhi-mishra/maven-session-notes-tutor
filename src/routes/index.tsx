import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Megaphone, BookOpen, ClipboardList, Trophy, FileQuestion, MessageCircle, FileUser, Package,
  Users, Gift, Sparkles, ArrowRight, Layers, ChevronDown, LogOut, Calendar, Search,
  ChevronLeft, ChevronRight, Clock, Play, FileText, Download, CircleCheck, Star, Bot, X, Info,
} from "lucide-react";
import { AyudaLogo, UserBlock } from "@/components/brand";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Announcements — Ayuda LMS" },
      { name: "description", content: "Ayuda Flagship Cohort 20 schedule with Ask Maven, the AI session tutor." },
      { property: "og:title", content: "Announcements — Ayuda LMS" },
      { property: "og:description", content: "Ayuda Flagship Cohort 20 schedule with Ask Maven, the AI session tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Kind = "hackathon" | "gen-ai" | "prompt" | "decor";
type Ev = { time: string; label: string; tone: "green" | "purple"; kind: Kind };

// Key: "m-d" (8 = August, 9 = September, 10 = October)
const EVENTS: Record<string, Ev[]> = {
  "8-30": [
    { time: "6:00 PM", label: "Hackathon | Product Teardown | India Batch", tone: "green", kind: "hackathon" },
    { time: "9:00 PM", label: "Hackathon | Product Teardown | US Batch", tone: "green", kind: "hackathon" },
  ],
  "9-5": [
    { time: "9:00 AM", label: "Understanding Basics of Generative AI", tone: "purple", kind: "gen-ai" },
    { time: "6:00 PM", label: "Replay | Understanding Basics of Generative AI", tone: "purple", kind: "decor" },
  ],
  "9-6": [
    { time: "9:00 AM", label: "Introduction to the Basics of Prompt Engineering", tone: "purple", kind: "prompt" },
    { time: "6:00 PM", label: "Replay | Introduction to the Basics of Prompt Engineering", tone: "purple", kind: "decor" },
  ],
  "9-12": [
    { time: "9:00 AM", label: "Technicals of Prompting and Prompt Engineering", tone: "purple", kind: "decor" },
    { time: "6:00 PM", label: "Replay | Technicals of Prompting and Prompt Engineering", tone: "purple", kind: "decor" },
  ],
  "9-13": [
    { time: "9:00 AM", label: "Advanced Technicals of Prompt Engineering", tone: "purple", kind: "decor" },
    { time: "6:00 PM", label: "Replay | Advanced Technicals of Prompt Engineering", tone: "purple", kind: "decor" },
  ],
  "9-19": [
    { time: "9:00 AM", label: "Live Building LLM Apps with Prompt Engineering", tone: "purple", kind: "decor" },
    { time: "6:00 PM", label: "Hackathon | India & US Batch | Building an AI Product using Lovable", tone: "purple", kind: "decor" },
  ],
  "9-20": [
    { time: "9:00 AM", label: "Getting Started with RAG in AI Products", tone: "purple", kind: "decor" },
    { time: "6:00 PM", label: "Hackathon | Building an AI Product using Lovable", tone: "purple", kind: "decor" },
  ],
  "9-26": [
    { time: "9:00 AM", label: "Deep Dive into Technicals of RAG in AI Products", tone: "purple", kind: "decor" },
    { time: "6:00 PM", label: "Replay | Deep Dive into Technicals of RAG in AI Products", tone: "purple", kind: "decor" },
  ],
};

// September 2026 starts on Tuesday → grid starts Sun Aug 30, 5 weeks.
const CELLS = Array.from({ length: 35 }, (_, i) => {
  if (i < 2) return { m: 8, d: 30 + i };
  const d = i - 1;
  return d <= 30 ? { m: 9, d } : { m: 10, d: d - 30 };
});

const NAV = [
  { label: "Announcements", icon: Megaphone, active: true },
  { label: "Content", icon: BookOpen },
  { label: "Assignments", icon: ClipboardList },
  { label: "Hackathons", icon: Trophy, live: true },
  { label: "Tests", icon: FileQuestion },
  { label: "Connect", icon: MessageCircle },
  { label: "Portfolio", icon: FileUser },
  { label: "Artifacts", icon: Package },
  { label: "Community", icon: Users },
  { label: "Refer & Earn", icon: Gift },
  { label: "Resources", icon: Sparkles, arrow: true },
];

const TRANSCRIPT_TXT =
  "Understanding Basics of Generative AI\nSession date: 9/5/2026, 9:00:00 AM\nTranscript source: zoom\n\n[Upload the actual transcript downloaded from your Ayuda session for full Maven functionality.]";

function Dashboard() {
  const [panel, setPanel] = useState<"gen-ai" | "prompt" | null>(null);
  const [hint, setHint] = useState(true);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();

  const onEvent = (e: Ev) => {
    if (e.kind === "hackathon")
      toast("This session has ended. Recordings are not available for hackathon sessions.", { duration: 4000 });
    else if (e.kind === "gen-ai" || e.kind === "prompt") setPanel(e.kind);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-[180px] shrink-0 flex-col bg-navy px-2.5 py-4">
        <div className="px-2 pb-5"><AyudaLogo light /></div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => (
            <div
              key={n.label}
              className={`flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${
                n.active ? "bg-primary font-medium text-primary-foreground" : "text-navy-foreground/85 hover:bg-navy-foreground/5"
              }`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{n.label}</span>
              {n.arrow && <ArrowRight className="h-3.5 w-3.5" />}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-4 px-1">
          <UserBlock dark />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-8 border-b bg-background px-6 py-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-bold">Sunidhi Mishra</div>
              <div className="text-xs text-muted-foreground">Welcome</div>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
            <Layers className="h-3 w-3" /> Flagship Cohort 20 <ChevronDown className="h-3 w-3" />
          </button>
          <button className="ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </header>

        <main className="flex-1 px-6 py-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">📣 Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stay updated with the latest news and session schedule</p>

          <div className="mt-6 flex border-b">
            <button className="px-6 py-2.5 text-sm text-muted-foreground">Updates</button>
            <button className="-mb-px border-b-2 border-primary px-6 py-2.5 text-sm font-semibold text-primary">Schedule</button>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex rounded-lg bg-muted p-1 text-sm">
              <span className="flex items-center gap-1.5 rounded-md bg-background px-3 py-1.5 font-medium shadow-card">
                <Calendar className="h-3.5 w-3.5" /> Calendar
              </span>
              <span className="px-4 py-1.5 text-muted-foreground">List</span>
            </div>
            <div className="flex w-72 items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" /> Search live sessions...
            </div>
          </div>

          {hint && (
            <div className="mb-3 mt-4 flex items-center gap-3 rounded-lg border-l-[3px] border-primary bg-brand-soft px-4 py-3 text-sm text-foreground/80">
              <span>💡</span>
              <span className="flex-1">Click on a highlighted session to explore Maven — try Saturday 5 Sep or Sunday 6 Sep</span>
              <button onClick={() => setHint(false)} aria-label="Dismiss hint" className="text-[18px] leading-none text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center">
            <button className="rounded-lg border px-3 py-1.5 text-sm font-medium">Today</button>
            <div className="mx-auto flex items-center gap-3 text-sm font-medium">
              <ChevronLeft className="h-4 w-4" /> September 2026 <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border">
            <div className="grid grid-cols-7 border-b bg-muted/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-center text-xs text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {CELLS.map((c, i) => {
                const evs = EVENTS[`${c.m}-${c.d}`] ?? [];
                const outside = c.m !== 9;
                return (
                  <div
                    key={i}
                    className={`min-h-[118px] border-b border-r p-1.5 ${i % 7 === 6 ? "border-r-0" : ""} ${outside ? "bg-muted/40" : ""}`}
                  >
                    <div className={`px-1 text-xs ${outside ? "text-muted-foreground/60" : "font-medium"}`}>{c.d}</div>
                    <div className="mt-1 flex flex-col gap-1">
                      {evs.map((e) => {
                        const clickable = e.kind !== "decor";
                        return (
                          <button
                            key={e.label}
                            onClick={() => onEvent(e)}
                            className={`rounded-md px-1.5 py-1 text-left text-[11px] leading-tight ${
                              e.tone === "green" ? "bg-success-soft text-success-ink" : "bg-brand-soft text-primary"
                            } ${clickable ? "ring-primary/40 hover:ring-2" : "cursor-default opacity-80"} ${
                              e.kind === "gen-ai" || (e.kind === "prompt" && e.time === "9:00 AM") ? "pulse-soft" : ""
                            }`}
                          >
                            <div className="font-semibold">{e.time}</div>
                            <div>{e.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-center text-[13px] italic text-muted-foreground">
            Navigation links are non-functional in this prototype.
          </p>
        </main>
      </div>

      {panel && (
        <SessionPanel
          kind={panel}
          onClose={() => setPanel(null)}
          onAskMaven={() => (panel === "gen-ai" ? navigate({ to: "/maven" }) : setModal(true))}
        />
      )}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-[480px] rounded-2xl shadow-modal">
          <DialogTitle className="text-lg font-bold">⚠️ Transcript Not Available</DialogTitle>
          <div className="space-y-3 text-sm text-foreground">
            <p>To use Ask Maven for this session, you'll need the transcript file.</p>
            <p className="font-semibold">Your options:</p>
            <p>📌 <strong>Option 1:</strong> Ask your instructor to share the .txt transcript file directly.</p>
            <p>
              📌 <strong>Option 2:</strong> Click View Recording above → open the YouTube video → click 'Show transcript'
              in the description box → select all text → copy → paste into Google Docs → File → Download → Plain Text (.txt)
            </p>
            <p>Once you have the file, you can upload it inside Ask Maven.</p>
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" /> Phase 2: Transcripts will be auto-populated for every session in the production build.
            </p>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setModal(false)} className="h-11 rounded-lg border px-4 text-sm font-medium hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={() => navigate({ to: "/maven" })}
              className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Open Ask Maven →
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SessionPanel({ kind, onClose, onAskMaven }: { kind: "gen-ai" | "prompt"; onClose: () => void; onAskMaven: () => void }) {
  const isGen = kind === "gen-ai";
  const title = isGen ? "Understanding Basics of Generative AI" : "Introduction to the Basics of Prompt Engineering";
  const date = isGen ? "Saturday, September 5, 2026" : "Sunday, September 6, 2026";

  const download = () => {
    const blob = new Blob([TRANSCRIPT_TXT], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sample-transcript.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const btn = "flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium";
  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/50" onClick={onClose} />
      <aside className="slide-in-right fixed right-0 top-0 z-50 flex h-screen w-[320px] flex-col overflow-y-auto bg-background p-5 shadow-modal">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
        <h2 className="pr-6 text-base font-bold leading-snug">{title}</h2>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-primary">AI Session</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">Done</span>
        </div>
        <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {date}</div>
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> 9:00 AM</div>
        </div>
        <p className="mt-4 border-b pb-4 text-sm text-muted-foreground">
          This session is completed. You can access recordings in the Content section.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button className={`${btn} bg-primary text-primary-foreground hover:opacity-90`}><Play className="h-4 w-4" /> View Recording</button>
          <button className={`${btn} border border-info text-info hover:bg-info/5`}><FileText className="h-4 w-4" /> View Slides</button>
          <button className={`${btn} border border-pink text-pink hover:bg-pink/5`}><FileText className="h-4 w-4" /> View Whimsical</button>
          {isGen && (
            <button onClick={download} className={`${btn} border border-success text-success-ink hover:bg-success/5`}>
              <Download className="h-4 w-4" /> Download Transcript (.txt)
            </button>
          )}
          <button className={`${btn} border hover:bg-muted`}><CircleCheck className="h-4 w-4" /> Mark Done</button>
          <button className={`${btn} text-muted-foreground hover:bg-muted`}><Star className="h-4 w-4" /> Star for quick access{isGen ? " in Content tab" : ""}</button>
        </div>
        <div className="my-4 border-t" />
        <button
          onClick={onAskMaven}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90"
        >
          <Bot className="h-4 w-4" /> Ask Maven
        </button>
      </aside>
    </>
  );
}
