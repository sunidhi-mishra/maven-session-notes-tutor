import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMaven } from "@/lib/maven-store";
import { generateQuiz } from "@/lib/maven.functions";
import { Locked } from "@/components/maven/Locked";

export const Route = createFileRoute("/maven/quiz")({
  head: () => ({ meta: [{ title: "Take Quiz — Maven" }] }),
  component: QuizPage,
});

const L = ["A", "B", "C", "D"] as const;

function QuizPage() {
  const { transcript, quizState, setQuizState, triggerFeedback } = useMaven();
  const gen = useServerFn(generateQuiz);
  const [loading, setLoading] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);

  if (!transcript) return <Locked />;

  const run = async () => {
    setLoading(true);
    try {
      const quiz = await gen({ data: { transcript: transcript.text } });
      setQuizState({ quiz, index: 0, answers: quiz.questions.map(() => null), revealed: false, done: false });
      setChoice(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't generate quiz");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm font-medium">
        <Loader2 className="h-8 w-8 animate-spin text-primary" /> Generating quiz from your transcript...
      </div>
    );

  if (!quizState)
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold">🎯 Knowledge Check</h2>
        <p className="mt-2 text-sm">Test your understanding of this session.</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          3–5 multiple choice questions based strictly on what was covered in your uploaded transcript.
        </p>
        <button onClick={run} className="mt-5 h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Generate Quiz
        </button>
      </div>
    );

  const { quiz, index, answers, revealed, done } = quizState;
  const N = quiz.questions.length;

  if (done) {
    const missed = quiz.questions.filter((q, i) => answers[i] !== q.correct).map((q) => q.topic);
    const score = N - missed.length;
    const topics = missed.join(", ");
    const comment =
      missed.length === 0
        ? "Outstanding! You've got a strong grasp of every concept from this session."
        : missed.length === 1
          ? `Great work! One concept to revisit — check your session notes on ${topics}.`
          : missed.length === 2
            ? `Good foundation! Review your notes on ${topics}.`
            : `These are foundational concepts worth revisiting. Focus on ${topics} before retrying.`;
    return (
      <div className="h-full overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-xl rounded-xl border p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold">🎯 Quiz Complete!</h2>
          <p className="mt-4 text-3xl font-bold text-primary">Your Score: {score}/{N}</p>
          <p className="mt-3 text-sm">{comment}</p>
          {missed.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Review your notes on: {topics}</p>}
          <div className="my-6 border-t" />
          <p className="text-sm">Ready to go deeper on these concepts?</p>
          <p className="text-sm font-semibold">→ Practice Interview Questions based on what you've learned.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/maven/notes" className="flex h-11 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">📝 Review Notes</Link>
            <Link to="/maven/interview" className="flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">🎤 Practice Interviews →</Link>
          </div>
          <button onClick={run} className="mt-4 text-xs text-muted-foreground underline">Retake with new questions</button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[index]!;
  const asked = revealed ? index + 1 : index;
  const scoreSoFar = answers.slice(0, asked).filter((a, i) => a === quiz.questions[i]?.correct).length;
  const correct = revealed && answers[index] === q.correct;

  const submit = () => {
    if (!choice) return;
    setQuizState((s) => s && { ...s, answers: s.answers.map((a, i) => (i === index ? choice : a)), revealed: true });
  };
  const next = () => {
    setChoice(null);
    if (index + 1 >= N) {
      setQuizState((s) => s && { ...s, done: true });
      triggerFeedback();
    } else setQuizState((s) => s && { ...s, index: s.index + 1, revealed: false });
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="mx-auto max-w-2xl">
        {index === 0 && !revealed && (
          <p className="mb-4 text-sm text-muted-foreground">Let's test your understanding! You'll get {N} questions.</p>
        )}
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Question {index + 1} of {N}</span>
          <span>Score so far: {scoreSoFar}/{asked}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((index + (revealed ? 1 : 0)) / N) * 100}%` }} />
        </div>
        <h2 className="mt-6 text-lg font-bold">{q.question}</h2>
        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const letter = L[i]!;
            const picked = (revealed ? answers[index] : choice) === letter;
            const isRight = revealed && letter === q.correct;
            const isWrong = revealed && picked && letter !== q.correct;
            return (
              <label
                key={letter}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                  isRight ? "border-success bg-success-soft" : isWrong ? "border-danger bg-danger/5" : picked ? "border-primary bg-brand-soft" : "hover:bg-muted"
                } ${revealed ? "cursor-default" : ""}`}
              >
                <input
                  type="radio"
                  name="opt"
                  disabled={revealed}
                  checked={picked}
                  onChange={() => setChoice(letter)}
                  className="mt-0.5 accent-primary"
                />
                <span><strong>{letter})</strong> {opt}</span>
              </label>
            );
          })}
        </div>
        {revealed && (
          <div className={`slide-down mt-4 rounded-lg p-4 text-sm ${correct ? "bg-success-soft" : "bg-danger/5"}`}>
            {correct ? (
              <p>✅ Correct! {q.explanation}</p>
            ) : (
              <p>❌ Not quite. The correct answer is {q.correct}: {q.options[L.indexOf(q.correct)]}. {q.explanation}</p>
            )}
          </div>
        )}
        <div className="mt-5 flex justify-end">
          {!revealed ? (
            <button onClick={submit} disabled={!choice} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              Submit Answer
            </button>
          ) : (
            <button onClick={next} className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
              {index + 1 >= N ? "See Results →" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
