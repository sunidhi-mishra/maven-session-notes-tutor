// Lightweight in-browser retrieval: chunk the transcript, score chunks with BM25, return top-K.
const STOP = new Set(
  "a an the and or but if of to in on at for with is are was were be been it this that these those i you we they he she so do does did what how why when where which who can could would should will just about as by from into than then there their our your my me us them not no yes also very really like okay ok um uh".split(
    " ",
  ),
);

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));

export function chunkTranscript(text: string, size = 1200, overlap = 200): string[] {
  const clean = text.replace(/\r/g, "");
  const chunks: string[] = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + size, clean.length);
    if (end < clean.length) {
      const nl = clean.lastIndexOf("\n", end);
      if (nl > i + size / 2) end = nl;
    }
    chunks.push(clean.slice(i, end).trim());
    if (end >= clean.length) break;
    i = end - overlap;
  }
  return chunks.filter(Boolean);
}

export function retrieve(chunks: string[], query: string, k = 4): string[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const docs = chunks.map(tokenize);
  const avg = docs.reduce((s, d) => s + d.length, 0) / Math.max(docs.length, 1);
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const N = docs.length;
  const scored = docs.map((d, idx) => {
    const tf = new Map<string, number>();
    for (const t of d) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const t of q) {
      const f = tf.get(t) ?? 0;
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      score += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.length / avg))));
    }
    return { idx, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => chunks[s.idx]!);
}
