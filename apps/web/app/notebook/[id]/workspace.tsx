"use client";
import * as React from "react";
import { AlertTriangle, ArrowUp, BookmarkPlus, FileText, Globe, Inbox, Lock, NotebookPen, Plus, Square, Sparkles, Trash2, Type, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert, Badge, EmptyState, Progress, Skeleton } from "@/components/ui/feedback";
import { Dialog, DialogClose, DialogContent, Tooltip } from "@/components/ui/overlay";
import { Checkbox, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/controls";
import { ListRow, Panel } from "@/components/ui/surfaces";
import { Citation } from "@/components/ui/citation";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export type Role = "chat" | "viewer" | "editor" | "owner";
type Source = { id: string; kind: string; title: string; status: string; error_code: string | null; word_count: number | null };
type Cite = { marker: number; source_id: string; quote_text: string; char_start: number; char_end: number; verified: boolean };
type Message = { id: string; role: "user" | "assistant"; content: string; status: string; citations?: Cite[] };

const ERRORS: Record<string, string> = {
  protected_pdf: "PDF protégé : retirez la protection puis réimportez-le.",
  needs_ocr: "PDF scanné sans texte : la reconnaissance de texte n’est pas encore disponible.",
  unreadable_file: "Fichier illisible ou corrompu.",
  empty_content: "Aucun texte exploitable dans cette source.",
  too_many_words: "Source trop longue (plus de 500 000 mots).",
  paywall: "Page réservée aux abonnés : contenu inaccessible.",
  url_refused: "Adresse refusée ou injoignable.",
  unsupported_type: "Type de fichier non pris en charge.",
  embeddings_config: "Indexation impossible : configuration des embeddings invalide.",
  file_missing: "Fichier introuvable : réimportez-le.",
  temporary_error: "Erreur temporaire : nouvelle tentative en cours.",
  lease_expired: "Le traitement a été interrompu. Supprimez puis réimportez la source.",
  archive_too_large: "Fichier compressé trop volumineux une fois décompressé.",
};
const KIND_ICON: Record<string, React.ReactNode> = { web: <Globe />, text: <Type />, note: <NotebookPen /> };
const busyStatus = (s: string) => s === "pending" || s === "processing";

/** Vrai si la requête média correspond (suit le redimensionnement). Rendu serveur : vue bureau. */
function useMediaQuery(query: string): boolean {
  return React.useSyncExternalStore(
    (cb) => { const m = window.matchMedia(query); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

export function Workspace({ notebookId, initialTitle, role }: { notebookId: string; initialTitle: string; role: Role }) {
  const canEdit = role === "editor" || role === "owner";
  const [title, setTitle] = React.useState(initialTitle);
  const [sources, setSources] = React.useState<Source[] | null>(null);
  const [deselected, setDeselected] = React.useState<Set<string>>(new Set());
  const [loadError, setLoadError] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const [viewer, setViewer] = React.useState<{ sourceId: string; range?: [number, number] } | null>(null);
  const [noteEditor, setNoteEditor] = React.useState<{ id?: string } | null>(null);
  const [mobileTab, setMobileTab] = React.useState("chat");
  const desktop = useMediaQuery("(min-width: 1024px)");

  const load = React.useCallback(async () => {
    if (role === "chat") return setSources([]);
    try {
      const res = await fetch(`/api/v1/notebooks/${notebookId}/sources`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSources(json.sources);
      setDeselected(new Set(json.deselected));
      setLoadError(false);
    } catch { setLoadError(true); }
  }, [notebookId, role]);
  React.useEffect(() => { void load(); }, [load]);

  // Statuts persistants : on rafraîchit tant qu'une source est en traitement.
  const processing = sources?.some((s) => busyStatus(s.status));
  React.useEffect(() => {
    if (!processing) return;
    const t = setInterval(() => void load(), 2500);
    return () => clearInterval(t);
  }, [processing, load]);

  async function saveSelection(next: Set<string>) {
    setDeselected(next);
    const res = await fetch(`/api/v1/notebooks/${notebookId}/selection`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ deselectedSourceIds: [...next] }) });
    if (!res.ok) toast({ title: "Sélection non enregistrée", tone: "error" });
  }

  async function rename(next: string) {
    const clean = next.trim();
    if (clean === title) return;
    const res = await fetch(`/api/v1/notebooks/${notebookId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: clean }) });
    if (res.ok) setTitle(clean); else toast({ title: "Renommage impossible", tone: "error" });
  }

  async function removeSource(s: Source) {
    if (!confirm(`Supprimer la source « ${s.title} » ? Les réponses passées gardent leurs extraits cités.`)) return;
    const res = await fetch(`/api/v1/sources/${s.id}`, { method: "DELETE" });
    if (res.ok) { setSources((xs) => xs?.filter((x) => x.id !== s.id) ?? null); toast({ title: "Source supprimée", tone: "success" }); }
    else toast({ title: "Suppression impossible", tone: "error" });
  }

  const ready = (sources ?? []).filter((s) => s.status === "ready");
  const selectedCount = ready.filter((s) => !deselected.has(s.id)).length;
  const allSelected = ready.length > 0 && selectedCount === ready.length;

  const sourcesPanel = (
    <Panel id="sources" title="Sources" className="h-full" actions={canEdit && <span className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => setNoteEditor({})}><NotebookPen aria-hidden /> Note</Button><Button size="sm" variant="soft" onClick={() => setAdding(true)}><Plus aria-hidden /> Ajouter</Button></span>}>
      {loadError ? (
        <div className="p-4"><Alert tone="danger" title="Sources indisponibles" action={<Button size="sm" variant="secondary" onClick={load}>Réessayer</Button>} /></div>
      ) : sources === null ? (
        <div className="grid gap-3 p-4" aria-busy="true" aria-label="Chargement des sources">
          {[0, 1, 2].map((i) => <div key={i} className="flex gap-3"><Skeleton className="size-7" /><Skeleton className="h-4 flex-1" /></div>)}
        </div>
      ) : role === "chat" ? (
        <p className="p-4 text-sm text-text-muted">Les sources de ce notebook ne sont pas consultables avec votre lien. Vous pouvez poser des questions.</p>
      ) : sources.length === 0 ? (
        <EmptyState icon={<Inbox />} title="Aucune source" action={canEdit && <Button onClick={() => setAdding(true)}><Plus aria-hidden /> Ajouter des sources</Button>}>
          Importez un PDF, une page web ou un texte : les réponses citeront ces documents.
        </EmptyState>
      ) : (
        <div className="grid gap-0.5 p-2">
          {ready.length > 0 && (
            <label className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-text-muted">
              <span>{selectedCount}/{ready.length} sélectionnée{selectedCount > 1 ? "s" : ""}</span>
              <span className="flex items-center gap-2">Tout
                <Checkbox checked={allSelected ? true : selectedCount === 0 ? false : "indeterminate"} aria-label="Tout sélectionner"
                  onCheckedChange={() => saveSelection(allSelected ? new Set(ready.map((s) => s.id)) : new Set())} />
              </span>
            </label>
          )}
          {sources.map((s) => (
            <div key={s.id} className="grid gap-1">
              <ListRow
                icon={KIND_ICON[s.kind] ?? <FileText />}
                title={s.kind === "note" ? <button className="w-full truncate text-left hover:underline" onClick={() => setNoteEditor({ id: s.id })}>{s.title}</button> : s.status === "ready" ? <button className="w-full truncate text-left hover:underline" onClick={() => setViewer({ sourceId: s.id })}>{s.title}</button> : s.title}
                meta={s.status === "failed" ? <span className="text-danger">{ERRORS[s.error_code ?? ""] ?? "Échec du traitement."}</span> : busyStatus(s.status) ? (s.status === "pending" ? "En attente de traitement…" : "Extraction et indexation…") : s.word_count ? `${s.word_count.toLocaleString("fr-FR")} mots` : undefined}
                trailing={
                  <span className="flex items-center gap-1">
                    {s.status === "failed" && <Badge tone="danger">Échec</Badge>}
                    {busyStatus(s.status) && <Badge tone="accent">En cours</Badge>}
                    {canEdit && <Button size="icon-sm" variant="ghost" aria-label={`Supprimer ${s.title}`} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100" onClick={() => removeSource(s)}><Trash2 aria-hidden /></Button>}
                    {s.status === "ready" && (
                      <Checkbox checked={!deselected.has(s.id)} aria-label={`Utiliser ${s.title} dans les réponses`}
                        onCheckedChange={(v) => { const n = new Set(deselected); if (v) n.delete(s.id); else n.add(s.id); void saveSelection(n); }} />
                    )}
                  </span>
                }
              />
              {busyStatus(s.status) && <div className="px-3 pb-1"><Progress label={`Traitement de ${s.title}`} /></div>}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );

  const titles = new Map((sources ?? []).map((s) => [s.id, s.title]));
  const chatPanel = <Chat notebookId={notebookId} readyCount={selectedCount} sourceTitle={(id) => titles.get(id)} canSaveNote={canEdit} onNoteSaved={() => void load()} onOpenCitation={(c) => setViewer({ sourceId: c.source_id, range: [c.char_start, c.char_end] })} canViewSources={role !== "chat"} />;

  const studioPanel = (
    <Panel id="studio" title="Studio" className="h-full">
      <EmptyState icon={<Sparkles />} title="Bientôt disponible">
        Résumés audio, cartes mentales, fiches et quiz générés à partir de vos sources arriveront dans une prochaine version.
      </EmptyState>
    </Panel>
  );

  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-5">
        {canEdit ? (
          <input aria-label="Titre du notebook" defaultValue={title} placeholder="Notebook sans titre" maxLength={200}
            onBlur={(e) => void rename(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="min-w-0 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-lg font-semibold hover:bg-surface focus-visible:bg-surface" />
        ) : <h1 className="truncate text-lg font-semibold">{title || "Notebook sans titre"}</h1>}
      </div>

      {/* ≥ lg : 3 panneaux ; < lg : un onglet à la fois. Une SEULE disposition montée (un seul chat). */}
      {desktop ? (
      <div className="grid min-h-0 flex-1 grid-cols-[var(--panel-sources-w)_1fr] gap-3 p-3 xl:grid-cols-[var(--panel-sources-w)_1fr_var(--panel-studio-w)]">
        {sourcesPanel}{chatPanel}<div className="hidden xl:block">{studioPanel}</div>
      </div>
      ) : (
      <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 p-2">
          <TabsContent value="sources" className="h-full">{sourcesPanel}</TabsContent>
          <TabsContent value="chat" className="h-full">{chatPanel}</TabsContent>
          <TabsContent value="studio" className="h-full">{studioPanel}</TabsContent>
        </div>
        <TabsList aria-label="Panneaux" className="grid h-14 shrink-0 grid-cols-3 border-t bg-surface-raised px-2">
          <TabsTrigger value="sources">Sources</TabsTrigger><TabsTrigger value="chat">Chat</TabsTrigger><TabsTrigger value="studio">Studio</TabsTrigger>
        </TabsList>
      </Tabs>
      )}

      <AddSourcesDialog open={adding} onOpenChange={setAdding} notebookId={notebookId} onAdded={() => void load()} />
      <SourceViewer state={viewer} onClose={() => setViewer(null)} />
      <NoteEditor state={noteEditor} notebookId={notebookId} canEdit={canEdit} onClose={() => setNoteEditor(null)} onSaved={() => void load()} />
    </>
  );
}

/* ---------------------------------------------------------------- Chat ---- */

function Chat({ notebookId, readyCount, onOpenCitation, canViewSources, sourceTitle, canSaveNote, onNoteSaved }: { notebookId: string; readyCount: number; onOpenCitation: (c: Cite) => void; canViewSources: boolean; sourceTitle: (id: string) => string | undefined; canSaveNote: boolean; onNoteSaved: () => void }) {
  const [saved, setSaved] = React.useState<Set<string>>(new Set());
  async function saveNote(id: string) {
    const res = await fetch(`/api/v1/messages/${id}/save-note`, { method: "POST" });
    if (res.status === 409) { setSaved((s) => new Set(s).add(id)); toast({ title: "Cette réponse est déjà dans vos notes" }); return; }
    if (!res.ok) { toast({ title: "Enregistrement impossible", tone: "error" }); return; }
    setSaved((s) => new Set(s).add(id));
    toast({ title: "Réponse enregistrée en note", description: "Elle apparaît dans vos sources et peut être citée.", tone: "success" });
    onNoteSaved();
  }
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[] | null>(null);
  const [text, setText] = React.useState("");
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<{ title: string; body?: string } | null>(null);
  const abort = React.useRef<AbortController | null>(null);
  const bottom = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const list = await (await fetch(`/api/v1/notebooks/${notebookId}/conversations`)).json();
        let id = list.conversations?.[0]?.id as string | undefined;
        if (!id) id = (await (await fetch(`/api/v1/notebooks/${notebookId}/conversations`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json()).conversation.id;
        setConversationId(id!);
        const hist = await (await fetch(`/api/v1/conversations/${id}/messages`)).json();
        setMessages(hist.messages ?? []);
      } catch { setError({ title: "Conversation indisponible", body: "Rechargez la page." }); setMessages([]); }
    })();
  }, [notebookId]);
  React.useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const q = text.trim();
    if (!q || streaming || !conversationId) return;
    setText(""); setError(null); setStreaming(true);
    const tmp: Message = { id: "pending", role: "assistant", content: "", status: "streaming" };
    setMessages((m) => [...(m ?? []), { id: crypto.randomUUID(), role: "user", content: q, status: "complete" }, tmp]);
    abort.current = new AbortController();
    try {
      const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: q }), signal: abort.current.signal });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        const map: Record<string, { title: string; body?: string }> = {
          ai_not_configured: { title: "L’assistant n’est pas encore configuré", body: "La clé OpenRouter et le modèle de chat doivent être renseignés côté serveur." },
          no_sources: { title: "Aucune source prête et sélectionnée", body: "Ajoutez une source ou cochez-en au moins une." },
          quota_daily_exceeded: { title: "Limite quotidienne atteinte", body: "Réessayez demain ou changez d’offre dans les réglages." },
          quota_monthly_exceeded: { title: "Crédits du mois épuisés", body: "Changez d’offre dans les réglages pour continuer." },
          validation: { title: "Question invalide", body: "4 000 caractères maximum." },
        };
        setError(map[j.error] ?? { title: "Réponse impossible", body: "Réessayez dans un instant." });
        setMessages((m) => m?.filter((x) => x.id !== "pending").slice(0, -1) ?? []);
        setText(q);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, i); buf = buf.slice(i + 2);
          const event = /^event: (.*)$/m.exec(block)?.[1];
          const data = JSON.parse(/^data: (.*)$/m.exec(block)?.[1] ?? "null");
          if (event === "delta") setMessages((m) => m!.map((x) => x.id === "pending" ? { ...x, content: x.content + data.text } : x));
          if (event === "done") setMessages((m) => m!.map((x) => x.id === "pending" ? { id: data.messageId, role: "assistant", content: data.text, status: "complete", citations: data.citations } : x));
          if (event === "error") { setError({ title: "La réponse a échoué", body: "Votre crédit a été restitué. Réessayez." }); setMessages((m) => m!.map((x) => x.id === "pending" ? { ...x, status: "failed" } : x)); }
        }
      }
    } catch {
      setMessages((m) => m?.map((x) => x.id === "pending" ? { ...x, status: "stopped" } : x) ?? []);
    } finally { setStreaming(false); abort.current = null; }
  }

  return (
    <section aria-label="Conversation" className="flex h-full min-h-0 flex-col rounded-xl border bg-surface-raised">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto grid max-w-[var(--chat-max-w)] gap-6" aria-live="polite" aria-busy={streaming}>
          {messages === null ? (
            <div className="grid gap-2" aria-busy="true" aria-label="Chargement"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>
          ) : messages.length === 0 ? (
            <EmptyState icon={<Sparkles />} title={readyCount ? "Posez votre première question" : "Ajoutez une source pour commencer"}>
              {readyCount ? "Les réponses s’appuient uniquement sur vos sources sélectionnées et citent leurs passages." : "Dès qu’une source est prête, vous pourrez l’interroger ici."}
            </EmptyState>
          ) : messages.map((m) => m.role === "user" ? (
            <div key={m.id} className="max-w-[85%] justify-self-end whitespace-pre-wrap rounded-xl rounded-br-xs bg-surface px-4 py-2.5 text-sm">{m.content}</div>
          ) : (
            <div key={m.id} className="grid gap-2">
              {m.content ? <Answer text={m.content} citations={m.citations ?? []} sourceTitle={sourceTitle} onOpen={canViewSources ? onOpenCitation : undefined} /> : <div className="grid gap-2" aria-label="Réponse en cours"><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-9/12" /></div>}
              {canSaveNote && m.status === "complete" && m.id !== "pending" && m.content && (
                <div><Button size="sm" variant="ghost" disabled={saved.has(m.id)} onClick={() => void saveNote(m.id)}><BookmarkPlus aria-hidden /> {saved.has(m.id) ? "Enregistrée en note" : "Enregistrer en note"}</Button></div>
              )}
              {m.status === "stopped" && <p className="text-xs text-text-subtle">Réponse interrompue.</p>}
              {m.status === "failed" && <p className="flex items-center gap-1.5 text-xs text-danger"><AlertTriangle className="size-3.5" aria-hidden /> Réponse incomplète.</p>}
            </div>
          ))}
          <div ref={bottom} />
        </div>
      </div>
      <div className="border-t p-3">
        {error && <div className="mx-auto mb-2 max-w-[var(--chat-max-w)]"><Alert tone="warning" title={error.title}>{error.body}</Alert></div>}
        <form onSubmit={send} className="mx-auto flex max-w-[var(--chat-max-w)] items-end gap-2 rounded-xl border border-border-input bg-surface-raised p-2 focus-within:border-focus">
          <textarea rows={1} value={text} maxLength={4000} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            aria-label="Votre question" placeholder={readyCount ? "Posez une question sur vos sources…" : "Ajoutez d’abord une source"}
            className="max-h-40 min-h-8 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-text-subtle" />
          <span className="hidden pb-2 text-xs text-text-subtle sm:inline">{readyCount} source{readyCount > 1 ? "s" : ""}</span>
          {streaming ? (
            <Tooltip label="Arrêter"><Button type="button" size="icon-sm" variant="secondary" aria-label="Arrêter la réponse" onClick={() => abort.current?.abort()}><Square aria-hidden /></Button></Tooltip>
          ) : (
            <Button type="submit" size="icon-sm" aria-label="Envoyer" disabled={!text.trim() || !conversationId}><ArrowUp aria-hidden /></Button>
          )}
        </form>
        <p className="mt-2 text-center text-xs text-text-subtle">Les réponses peuvent contenir des erreurs : vérifiez les citations.</p>
      </div>
    </section>
  );
}

/** Réponse : paragraphes + pastilles de citation à la place des marqueurs [n]. */
function Answer({ text, citations, onOpen, sourceTitle }: { text: string; citations: Cite[]; onOpen?: (c: Cite) => void; sourceTitle: (id: string) => string | undefined }) {
  const byMarker = new Map(citations.map((c) => [c.marker, c]));
  return (
    <div className="grid gap-3 font-serif text-reading">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {para.split(/(\[\d+\])/g).map((part, j) => {
            const m = /^\[(\d+)\]$/.exec(part);
            const c = m && byMarker.get(Number(m[1]));
            if (!m) return <React.Fragment key={j}>{part}</React.Fragment>;
            if (!c) return <span key={j} className="font-mono text-xs text-text-subtle">{part}</span>; // pendant le flux
            return <Citation key={j} n={c.marker} source={sourceTitle(c.source_id) ?? "Source supprimée"} quote={c.quote_text} verified={c.verified} onOpen={onOpen ? () => onOpen(c) : undefined} />;
          })}
        </p>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- Ajout source ---- */

function AddSourcesDialog({ open, onOpenChange, notebookId, onAdded }: { open: boolean; onOpenChange: (o: boolean) => void; notebookId: string; onAdded: () => void }) {
  const [tab, setTab] = React.useState("file");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [url, setUrl] = React.useState("");
  const [paste, setPaste] = React.useState({ title: "", text: "" });
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function post(items: object[]) {
    const res = await fetch(`/api/v1/notebooks/${notebookId}/sources`, { method: "POST", headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ items }) });
    const j = await res.json().catch(() => ({}));
    if (res.status === 409 && j.error === "max_sources") throw new Error("Nombre maximal de sources atteint pour votre offre.");
    if (res.status === 422) throw new Error(Object.values(j.fields ?? {})[0] as string ?? "Données invalides.");
    if (!res.ok) throw new Error("Ajout impossible. Réessayez.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(undefined);
    try {
      if (tab === "file") {
        const files = [...(fileRef.current?.files ?? [])];
        if (!files.length) throw new Error("Choisissez au moins un fichier.");
        const items = [];
        for (const f of files) {
          const r = await fetch(`/api/v1/notebooks/${notebookId}/uploads`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ filename: f.name, size: f.size }) });
          const j = await r.json().catch(() => ({}));
          if (r.status === 415) throw new Error(`« ${f.name} » : format non pris en charge (PDF, DOCX, PPTX, EPUB, TXT, MD, CSV).`);
          if (r.status === 422) throw new Error(`« ${f.name} » : fichier trop volumineux (200 Mo maximum).`);
          if (!r.ok) throw new Error("Préparation de l’envoi impossible.");
          const up = await fetch(j.uploadUrl, { method: "PUT", headers: { "content-type": j.contentType }, body: f });
          if (!up.ok) throw new Error(`Envoi de « ${f.name} » échoué.`);
          items.push({ type: "upload", storagePath: j.storagePath, title: f.name.slice(0, 300) });
        }
        await post(items);
      } else if (tab === "url") {
        const urls = url.split(/\s+/).filter(Boolean);
        if (!urls.length) throw new Error("Collez au moins une adresse.");
        await post(urls.map((u) => ({ type: "url", url: u })));
      } else {
        if (!paste.title.trim() || !paste.text.trim()) throw new Error("Titre et texte sont requis.");
        await post([{ type: "text", title: paste.title, text: paste.text }]);
      }
      toast({ title: "Source ajoutée", description: "Le traitement continue en arrière-plan.", tone: "success" });
      setUrl(""); setPaste({ title: "", text: "" }); if (fileRef.current) fileRef.current.value = "";
      onAdded(); onOpenChange(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Ajout impossible."); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Ajouter des sources" description="Les réponses s’appuieront uniquement sur ces documents.">
        <form onSubmit={submit} className="grid gap-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="Type de source">
              <TabsTrigger value="file"><Upload className="mr-1.5 inline size-3.5" aria-hidden />Fichier</TabsTrigger>
              <TabsTrigger value="url"><Globe className="mr-1.5 inline size-3.5" aria-hidden />Page web</TabsTrigger>
              <TabsTrigger value="text"><Type className="mr-1.5 inline size-3.5" aria-hidden />Texte</TabsTrigger>
            </TabsList>
            <TabsContent value="file" className="pt-4">
              <Field id="files" label="Fichiers" hint="PDF, DOCX, PPTX, EPUB, TXT, MD ou CSV — 200 Mo maximum par fichier.">
                <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.pptx,.epub,.txt,.md,.csv" className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-2 file:text-sm file:font-medium file:text-on-accent-soft" />
              </Field>
            </TabsContent>
            <TabsContent value="url" className="pt-4">
              <Field id="urls" label="Adresses web" hint="Une par ligne. Seul le texte principal de la page est importé.">
                <Textarea value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
              </Field>
            </TabsContent>
            <TabsContent value="text" className="grid gap-3 pt-4">
              <Field id="paste-title" label="Titre"><Input value={paste.title} maxLength={300} onChange={(e) => setPaste({ ...paste, title: e.target.value })} /></Field>
              <Field id="paste-text" label="Texte"><Textarea value={paste.text} onChange={(e) => setPaste({ ...paste, text: e.target.value })} className="min-h-40" /></Field>
            </TabsContent>
          </Tabs>
          {error && <Alert tone="danger" title={error} />}
          <div className="flex justify-end gap-2">
            <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
            <Button type="submit" loading={busy}>Ajouter</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- Visionneuse ---- */

function SourceViewer({ state, onClose }: { state: { sourceId: string; range?: [number, number] } | null; onClose: () => void }) {
  const [source, setSource] = React.useState<{ title: string; extracted_text: string | null } | null>(null);
  const [failed, setFailed] = React.useState(false);
  const mark = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!state) return;
    setSource(null); setFailed(false);
    fetch(`/api/v1/sources/${state.sourceId}`).then(async (r) => { if (!r.ok) throw new Error(); setSource((await r.json()).source); }).catch(() => setFailed(true));
  }, [state]);
  React.useEffect(() => { mark.current?.scrollIntoView({ block: "center" }); }, [source]);

  const text = source?.extracted_text ?? "";
  const [a, b] = state?.range ?? [0, 0];
  return (
    <Dialog open={Boolean(state)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg" title={source?.title ?? "Source"} description={state?.range ? "Le passage cité est surligné." : undefined}>
        <div className="max-h-[65dvh] overflow-y-auto rounded-lg bg-surface p-5">
          {failed ? <Alert tone="danger" title="Source indisponible" /> : !source ? (
            <div className="grid gap-2" aria-busy="true"><Skeleton className="h-4" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-4/6" /></div>
          ) : (
            <p className={cn("whitespace-pre-wrap font-serif text-reading")}>
              {state?.range ? <>{text.slice(0, a)}<mark ref={mark} className="rounded-xs bg-highlight px-0.5 text-on-highlight">{text.slice(a, b)}</mark>{text.slice(b)}</> : text}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------- Éditeur de note ---- */

function NoteEditor({ state, notebookId, canEdit, onClose, onSaved }: { state: { id?: string } | null; notebookId: string; canEdit: boolean; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = React.useState("");
  const [text, setText] = React.useState("");
  const [locked, setLocked] = React.useState(false);
  const [citations, setCitations] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const editing = Boolean(state?.id);

  React.useEffect(() => {
    if (!state) return;
    setErrors({});
    if (!state.id) { setTitle(""); setText(""); setLocked(false); setCitations(0); return; }
    setLoading(true);
    fetch(`/api/v1/notes/${state.id}`).then(async (r) => {
      if (!r.ok) throw new Error();
      const j = await r.json();
      setTitle(j.note.title); setText(j.note.text); setLocked(j.note.locked); setCitations(j.citations.length);
    }).catch(() => setErrors({ form: "Note introuvable." })).finally(() => setLoading(false));
  }, [state]);

  async function unlock() {
    if (!state?.id || !confirm("Retirer les citations de cette note pour pouvoir la modifier ? Les liens vers les passages cités seront perdus.")) return;
    const r = await fetch(`/api/v1/notes/${state.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ unlock: true }) });
    if (r.ok) { setLocked(false); setCitations(0); } else toast({ title: "Action impossible", tone: "error" });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErrors({});
    const r = await fetch(editing ? `/api/v1/notes/${state!.id}` : `/api/v1/notebooks/${notebookId}/notes`, {
      method: editing ? "PATCH" : "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(locked ? { title } : { title, text }),
    });
    setSaving(false);
    const j = await r.json().catch(() => ({}));
    if (r.status === 422) { setErrors(j.fields ?? { form: "Données invalides." }); return; }
    if (r.status === 409) { setErrors({ form: "Cette note est verrouillée par ses citations." }); return; }
    if (!r.ok) { setErrors({ form: "Enregistrement impossible. Réessayez." }); return; }
    toast({ title: editing ? "Note mise à jour" : "Note créée", description: "Elle sera indexée dans quelques secondes.", tone: "success" });
    onSaved(); onClose();
  }

  const readOnly = !canEdit;
  return (
    <Dialog open={Boolean(state)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg" title={editing ? (readOnly ? "Note" : "Modifier la note") : "Nouvelle note"} description="Une note est une source : elle peut être sélectionnée et citée dans les réponses.">
        {loading ? (
          <div className="grid gap-2" aria-busy="true"><Skeleton className="h-9" /><Skeleton className="h-40" /></div>
        ) : (
          <form onSubmit={save} className="grid gap-4" noValidate>
            {locked && (
              <Alert tone="accent" title={`Note issue du chat, avec ${citations} citation${citations > 1 ? "s" : ""}`}
                action={canEdit && <Button type="button" size="sm" variant="secondary" onClick={unlock}><Lock aria-hidden /> Retirer les citations</Button>}>
                Le texte est verrouillé pour que les extraits cités restent exacts. Le titre reste modifiable.
              </Alert>
            )}
            <Field id="note-title" label="Titre" error={errors.title}>
              <Input value={title} maxLength={300} readOnly={readOnly} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field id="note-text" label="Contenu" error={errors.text}>
              <Textarea value={text} readOnly={readOnly || locked} onChange={(e) => setText(e.target.value)} className="min-h-64 font-serif text-reading" />
            </Field>
            {errors.form && <Alert tone="danger" title={errors.form} />}
            <div className="flex justify-end gap-2">
              <DialogClose asChild><Button type="button" variant="secondary">{readOnly ? "Fermer" : "Annuler"}</Button></DialogClose>
              {!readOnly && <Button type="submit" loading={saving}>{editing ? "Enregistrer" : "Créer la note"}</Button>}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
