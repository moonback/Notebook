import { z } from "zod";

// Messages d'erreur rédigés pour l'utilisateur, en français.
export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: z
    .string()
    .min(10, "10 caractères minimum.")
    .max(128, "128 caractères maximum."),
});

export const magicLinkSchema = credentialsSchema.pick({ email: true });

export const LANGUAGES = ["fr", "en", "es", "de", "it", "pt", "nl"] as const;
export const THEMES = ["light", "dark", "system"] as const;

/** Colonnes de `profiles` modifiables par l'utilisateur (liste blanche). */
export const profilePatchSchema = z
  .object({
    display_name: z.string().trim().max(120, "120 caractères maximum.").nullable(),
    output_language: z.enum(LANGUAGES),
    theme: z.enum(THEMES),
    web_notifications: z.boolean(),
    dashboard_view: z.enum(["grid", "list"]),
  })
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, "Aucune modification.");

export type ProfilePatch = z.infer<typeof profilePatchSchema>;

/** Première erreur par champ, pour l'affichage sous chaque input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Chemin de redirection sûr après connexion : interne uniquement (pas d'open redirect). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
