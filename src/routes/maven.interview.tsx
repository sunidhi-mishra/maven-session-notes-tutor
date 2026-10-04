import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/maven/interview")({
  head: () => ({ meta: [{ title: "Interview Prep — Maven" }] }),
  component: Interview,
});

function Interview() {
  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <h2 className="text-2xl font-bold">🎤 Interview Prep</h2>
      <p className="mt-1 text-sm text-muted-foreground">Practice what you've learned in a real PM interview format</p>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="flex flex-col rounded-xl border p-6 shadow-card">
          <div className="text-3xl">🤖</div>
          <h3 className="mt-3 text-lg font-bold">Interview Maestro</h3>
          <p className="text-[13px] text-muted-foreground">by Malay Krishna</p>
          <p className="mt-3 text-sm">
            Malay's custom GPT built for PM interview practice. Works on the free ChatGPT plan. Tell it which topic you
            want to practice and it adapts to your level.
          </p>
          <div className="mb-5 mt-4 rounded-lg bg-brand-soft p-3 text-sm">
            💡 Try typing: 'I want to practice Basics of Generative AI as a PM interview topic'
          </div>
          <a
            href="https://bit.ly/4dfFYgv"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Open Interview Maestro ↗
          </a>
        </div>
        <div className="flex flex-col rounded-xl border p-6 shadow-card">
          <div className="text-3xl">📂</div>
          <h3 className="mt-3 text-lg font-bold">PM Interview Guides</h3>
          <p className="text-[13px] text-muted-foreground">Curated from Ayuda resources</p>
          <p className="mt-3 text-sm">
            Framework guides for every PM interview type — Product Improvement, Root Cause Analysis, Estimation,
            Go-to-Market, Metrics & more. All in one place.
          </p>
          <p className="mb-5 mt-2 text-[13px] text-muted-foreground">
            Consolidated from the broader resource library to streamline your prep. Curated here for easy access.
          </p>
          <a
            href="https://drive.google.com/drive/folders/1JKfVTGVzyT4iRKgl1HQaAuUW2UV3Nu_W?usp=sharing"
            target="_blank"
            rel="noreferrer"
            className="mt-auto flex h-11 items-center justify-center rounded-lg border border-primary text-sm font-semibold text-primary hover:bg-brand-soft"
          >
            Open Drive ↗
          </a>
        </div>
      </div>
      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        ℹ️ Interview Prep links to external resources. No transcript processing occurs in this view.
      </p>
    </div>
  );
}
