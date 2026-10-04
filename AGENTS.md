<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Maven transcript state lives in a client-side React context mounted in __root (no persistence); retrieval is in-browser BM25 top-4 chunks sent to a server function — keeps the prototype backend-free apart from AI calls.
- All AI calls go through `src/lib/maven.functions.ts` (server functions, Responses API); quiz JSON is extracted by regex rather than json_object format, because the gateway rejected that format.
