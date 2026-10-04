import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { chunkTranscript } from "./rag";
import type { Quiz } from "./maven.functions";
import { supabase } from "@/integrations/supabase/client";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Transcript = { name: string; text: string; title: string; chunks: string[] };
export type QuizState = {
  quiz: Quiz;
  index: number;
  answers: (string | null)[];
  revealed: boolean;
  done: boolean;
};
export type Feedback = {
  session: string | null;
  rating: "positive" | "negative";
  comment: string | null;
  timestamp: string;
};

type Ctx = {
  transcript: Transcript | null;
  loadTranscript: (name: string, text: string) => void;
  clearTranscript: () => void;
  messages: ChatMsg[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  notes: string | null;
  setNotes: (n: string | null) => void;
  quizState: QuizState | null;
  setQuizState: React.Dispatch<React.SetStateAction<QuizState | null>>;
  feedbackOpen: boolean;
  setFeedbackOpen: (o: boolean) => void;
  triggerFeedback: () => void;
  submitFeedback: (f: Feedback) => Promise<boolean>;
};

const MavenCtx = createContext<Ctx | null>(null);

const WELCOME =
  "✅ Transcript loaded. Ask me anything from this session — I'll find the answer and show you exactly where it came from.";

function deriveTitle(name: string, text: string) {
  const first = text.split("\n").map((l) => l.trim()).find(Boolean) ?? "";
  if (first && first.length < 140 && !/\(\d{1,2}:\d{2}(:\d{2})?\)/.test(first) && !/^session date/i.test(first))
    return first;
  return name.replace(/\.txt$/i, "").replace(/[-_]+/g, " ");
}

export function MavenProvider({ children }: { children: ReactNode }) {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [notes, setNotes] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackShown, setFeedbackShown] = useState(false);
  const [, setFeedbackList] = useState<Feedback[]>([]);

  const loadTranscript = useCallback((name: string, text: string) => {
    setTranscript({ name, text, title: deriveTitle(name, text), chunks: chunkTranscript(text) });
    setMessages([{ role: "assistant", content: WELCOME }]);
    setNotes(null);
    setQuizState(null);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript(null);
    setMessages([]);
    setNotes(null);
    setQuizState(null);
  }, []);

  const triggerFeedback = useCallback(() => {
    setFeedbackShown((shown) => {
      if (!shown) setFeedbackOpen(true);
      return true;
    });
  }, []);

  const submitFeedback = useCallback(async (f: Feedback) => {
    console.log("[Maven feedback]", f);
    const { error } = await supabase
      .from("maven_feedback")
      .insert({ session: f.session, rating: f.rating, comment: f.comment });
    if (error) {
      console.error("[Maven feedback] save failed", error);
      return false;
    }
    setFeedbackList((l) => [...l, f]);
    return true;
  }, []);

  void feedbackShown;

  return (
    <MavenCtx.Provider
      value={{
        transcript,
        loadTranscript,
        clearTranscript,
        messages,
        setMessages,
        notes,
        setNotes,
        quizState,
        setQuizState,
        feedbackOpen,
        setFeedbackOpen,
        triggerFeedback,
        submitFeedback,
      }}
    >
      {children}
    </MavenCtx.Provider>
  );
}

export function useMaven() {
  const c = useContext(MavenCtx);
  if (!c) throw new Error("useMaven outside provider");
  return c;
}
