import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { Badge } from "@/components/ui/feedback";
import { Card } from "@/components/ui/surfaces";
import { createUserClient, getUser } from "@/lib/supabase/server";
import { ProfileForm } from "../profile-form";
import { PlanCard } from "./plan-card";

export const metadata: Metadata = { title: "Réglages · Notebook" };

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/settings");
  const supabase = await createUserClient();
  const [{ data: profile }, { data: workspaces }, { data: plans }] = await Promise.all([
    supabase.from("profiles").select("display_name, output_language, theme, web_notifications").eq("id", user.id).single(),
    supabase.from("workspaces").select("id, kind, name, plan_id").order("created_at"),
    supabase.from("plans").select("id, name, price_cents, currency, billing_interval").order("price_cents"),
  ]);
  const personal = workspaces?.find((w) => w.kind === "personal");

  return (
    <div className="min-h-dvh">
      <AppHeader><h1 className="truncate text-lg">Réglages</h1></AppHeader>
      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8 sm:px-6">
        <p className="text-sm text-text-muted">Connecté·e avec {user.email}</p>
        <Card className="grid gap-4 p-5">
          <h2 className="text-lg">Préférences</h2>
          {profile ? <ProfileForm initial={{ ...profile, theme: profile.theme as "light" | "dark" | "system" }} /> : <p role="alert" className="text-sm text-danger">Profil introuvable.</p>}
        </Card>
        <Card className="grid gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Offre</h2>
            <Badge tone="warning">Paiement simulé</Badge>
          </div>
          {personal && plans ? <PlanCard workspaceId={personal.id} current={personal.plan_id} plans={plans} /> : <p role="alert" className="text-sm text-danger">Espace de travail introuvable.</p>}
        </Card>
      </main>
    </div>
  );
}
