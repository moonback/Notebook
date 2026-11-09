"use client";
import * as React from "react";
import { Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { Dialog, DialogContent } from "@/components/ui/overlay";
import { ListRow } from "@/components/ui/surfaces";
import { toast } from "@/components/ui/toast";

type Person = { member_id: string | null; user_id: string | null; email: string; display_name: string | null; role: "owner" | "editor" | "viewer"; pending: boolean };
const ROLES = [["viewer", "Lecteur"], ["editor", "Éditeur"]] as const;
const select = "h-9 rounded-md border border-border-input bg-surface-raised px-2 text-sm";
const ERRORS: Record<string, string> = {
  already_member: "Cette personne a déjà accès.",
  already_owner: "C’est le propriétaire du notebook.",
  max_members: "Nombre maximal de personnes atteint pour votre offre.",
};

/** H01 : partage privé par email (propriétaire). Rôles appliqués côté serveur. */
export function ShareButton({ notebookId }: { notebookId: string }) {
  const [open, setOpen] = React.useState(false);
  const [people, setPeople] = React.useState<Person[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"viewer" | "editor">("viewer");
  const [error, setError] = React.useState<string>();
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const r = await fetch(`/api/v1/notebooks/${notebookId}/members`);
      if (!r.ok) throw new Error();
      setPeople((await r.json()).people); setFailed(false);
    } catch { setFailed(true); }
  }, [notebookId]);
  React.useEffect(() => { if (open) void load(); }, [open, load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setError(undefined);
    const r = await fetch(`/api/v1/notebooks/${notebookId}/members`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, role }) }).catch(() => null);
    setSending(false);
    const j = await r?.json().catch(() => ({}));
    if (!r?.ok) { setError(j?.fields?.email ?? ERRORS[j?.error] ?? "Invitation impossible. Réessayez."); return; }
    toast({ title: j.member.pending ? "Invitation enregistrée" : "Accès accordé", description: j.member.pending ? "Le notebook apparaîtra dès que cette personne créera son compte avec cette adresse." : "Le notebook apparaît dans « Partagés avec moi » pour cette personne.", tone: "success" });
    setEmail(""); void load();
  }
  async function changeRole(p: Person, next: string) {
    const r = await fetch(`/api/v1/notebook-members/${p.member_id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ role: next }) });
    if (r.ok) setPeople((xs) => xs?.map((x) => (x.member_id === p.member_id ? { ...x, role: next as Person["role"] } : x)) ?? null);
    else toast({ title: "Rôle non modifié", tone: "error" });
  }
  async function remove(p: Person) {
    if (!confirm(`Retirer l’accès de ${p.email} ?`)) return;
    const r = await fetch(`/api/v1/notebook-members/${p.member_id}`, { method: "DELETE" });
    if (r.ok) setPeople((xs) => xs?.filter((x) => x.member_id !== p.member_id) ?? null);
    else toast({ title: "Retrait impossible", tone: "error" });
  }

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Share2 aria-hidden /> Partager</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Partager le notebook" description="Les lecteurs consultent et posent des questions ; les éditeurs ajoutent des sources et génèrent du contenu.">
          <form onSubmit={invite} className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <Field id="share-email" label="Adresse email" error={error}>
              <Input type="email" required value={email} maxLength={320} autoComplete="off" onChange={(e) => { setEmail(e.target.value); setError(undefined); }} placeholder="prenom@exemple.fr" />
            </Field>
            <select aria-label="Rôle" className={`${select} h-10`} value={role} onChange={(e) => setRole(e.target.value as "viewer" | "editor")}>
              {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <Button type="submit" loading={sending}>Inviter</Button>
          </form>
          <p className="mt-2 text-xs text-text-subtle">Aucun email n’est envoyé pour l’instant : prévenez la personne vous-même.</p>
          <h3 className="mb-1 mt-5 text-sm font-medium text-text-muted">Personnes ayant accès</h3>
          {failed ? <Alert tone="danger" title="Liste indisponible" action={<Button size="sm" variant="secondary" onClick={() => void load()}>Réessayer</Button>} />
            : !people ? <div className="grid gap-2" aria-busy="true" aria-label="Chargement"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
            : (
              <ul className="grid max-h-72 gap-0.5 overflow-y-auto">
                {people.map((p) => (
                  <li key={p.member_id ?? "owner"}>
                    <ListRow
                      title={p.display_name || p.email}
                      meta={p.display_name ? p.email : undefined}
                      trailing={p.role === "owner" ? <Badge>Propriétaire</Badge> : (
                        <span className="flex items-center gap-1">
                          {p.pending && <Badge tone="warning">En attente d’inscription</Badge>}
                          <select aria-label={`Rôle de ${p.email}`} className={select} value={p.role} onChange={(e) => void changeRole(p, e.target.value)}>
                            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                          <Button size="icon-sm" variant="ghost" aria-label={`Retirer ${p.email}`} onClick={() => void remove(p)}><Trash2 aria-hidden /></Button>
                        </span>
                      )}
                    />
                  </li>
                ))}
              </ul>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
