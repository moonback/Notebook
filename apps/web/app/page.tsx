import { redirect } from "next/navigation";
import { BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/feedback";
import { Card } from "@/components/ui/surfaces";
import { createUserClient, getUser } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function HomePage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createUserClient();
  const [{ data: profile }, { data: workspaces }] = await Promise.all([
    supabase.from("profiles").select("display_name, output_language, theme, web_notifications").eq("id", user.id).single(),
    supabase.from("workspaces").select("id, kind, name, plan_id").order("created_at"),
  ]);

  return (
    <div className="min-h-dvh">
      <header className="flex h-[var(--header-h)] items-center justify-between border-b bg-surface-raised px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-accent text-on-accent"><BookOpen className="size-4" /></span>
          <span className="font-serif text-lg">Notebook</span>
        </div>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="ghost" size="sm"><LogOut aria-hidden /> Se déconnecter</Button>
        </form>
      </header>

      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-2xl">Bonjour{profile?.display_name ? `, ${profile.display_name}` : ""}</h1>
          <p className="text-sm text-text-muted">Connecté·e avec {user.email}</p>
        </div>

        <Card className="grid gap-3 p-5">
          <h2 className="text-lg">Espace de travail</h2>
          {workspaces?.length ? (
            <ul className="grid gap-2">
              {workspaces.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>{w.name}</span>
                  <span className="flex gap-2">
                    <Badge>{w.kind === "personal" ? "Personnel" : "Équipe"}</Badge>
                    <Badge tone="accent">Offre {w.plan_id === "free" ? "gratuite" : w.plan_id}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p role="alert" className="text-sm text-danger">Aucun espace de travail trouvé pour ce compte. Contactez le support.</p>
          )}
        </Card>

        <Card className="grid gap-4 p-5">
          <h2 className="text-lg">Préférences</h2>
          {profile ? (
            <ProfileForm initial={{ ...profile, theme: profile.theme as "light" | "dark" | "system" }} />
          ) : (
            <p role="alert" className="text-sm text-danger">Profil introuvable.</p>
          )}
        </Card>
      </main>
    </div>
  );
}
