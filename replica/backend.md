# Backend : état et checklist

Date : 2026-11-09. Environnement : Supabase **local** (`supabase start`, ports 583xx).

Les clés présentes dans `.env.local` et `apps/worker/.env` sont les **clés de démonstration publiques** de la CLI Supabase. Elles ne valent qu'en local.

## Ce qui fonctionne (vérifié par des tests)

| domaine | état | preuve |
| --- | --- | --- |
| Authentification | ✅ email + mot de passe, lien magique, callback, déconnexion (POST), middleware de session | parcours testé dans le navigateur, 6 tests Vitest (validation, open redirect) |
| Isolation entre clients | ✅ RLS sur 100 % des tables, clients en lecture seule, `my_notebook_role` comme contrôle unique | 24 tests pgTAP + test d'intégration « B ne voit rien de A » (base, Storage, écriture) |
| Rattachement propriétaire | ✅ chaque notebook appartient à un workspace ; chaque source, chunk, conversation, message, artefact et citation porte `workspace_id` et `notebook_id`, en cascade | schéma + tests |
| Stockage des fichiers | ✅ 3 buckets **privés**, aucune policy client ; upload par URL signée dont le chemin est imposé par le serveur ; préfixe `{workspace}/{notebook}/` vérifié à l'enregistrement | migration `20261109010000_storage.sql` ; test : téléchargement et URL signée refusés à B |
| Traitement asynchrone | ✅ `POST /sources` renvoie **202** immédiatement ; le worker extrait le texte (txt, md, csv, texte collé, pdf, docx, URL), le découpe, l'indexe ; statuts persistants `pending → processing → ready / failed` avec `error_code` | test d'intégration : pending → ready, PDF invalide → `failed / unreadable_file` |
| Tâches et progression | ✅ file `jobs` (claim `SKIP LOCKED`, bail + heartbeat, nouvelles tentatives, échec définitif, annulation, remboursement du quota) ; progression 0–100 et étape | 3 tests worker + pgTAP |
| Sécurité de l'import d'URL | ✅ protection SSRF : DNS résolu une fois, IP privées et métadonnées refusées, ports 80/443, redirections revérifiées, 10 Mo, 15 s | 21 tests |
| Journalisation | 🟡 JSON structuré sans données utilisateur (champs `token`, `key`, `email`… masqués) côté web | `lib/log.ts` ; pas encore Sentry |

## Ce qui reste à faire (ordre proposé)

| domaine | bloquant | ce que je ferai dès que c'est débloqué |
| --- | --- | --- |
| **Connecteur Claude + API de conversation** (SSE, citations natives vérifiées) | **Clé `ANTHROPIC_API_KEY`** à ajouter par vous dans `apps/web/.env.local` | `POST /conversations/:id/messages` en streaming, quota `chat` réservé puis réglé, citations vérifiées et stockées |
| **Embeddings** (recherche vectorielle) | Choix D1 + clé (`EMBEDDINGS_PROVIDER` / `MODEL` / `API_KEY` dans `apps/worker/.env`) | Sans clé, la recherche est en **plein texte uniquement** (journalisé, sans faux vecteurs) |
| **Abonnements et paiements** | Compte Stripe **en mode test** + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, prix créés | Checkout, Customer Portal, webhook signé et idempotent (`stripe_events`), mise à jour de `subscriptions` et `workspaces.plan_id` |
| Quotas : affichage et usage dans le chat | dépend du chat | Les RPC sont prêtes et testées (`reserve_usage`, `settle_usage`, `create_artifact`) |
| Email transactionnel | Compte Resend + domaine | Invitations, notifications |
| Surveillance | Projet Sentry (DSN) | Erreurs web et worker |
| Suppression de compte, export RGPD | — | Jobs `delete_account` et `export_account` (M4) |
| OCR (PDF scannés), audio | Fournisseur à choisir | Aujourd'hui : erreur explicite `needs_ocr`, jamais de faux succès |

## Checklist de sécurité

- [x] Secrets uniquement dans des variables d'environnement ; `.env*` ignorés par git ; `.env.example` sans valeurs (web et worker)
- [x] Entrées validées côté serveur avec Zod sur chaque route (liste blanche de colonnes)
- [x] Autorisation contrôlée à chaque lecture (RLS) et à chaque écriture (`requireRole`), testée avec un second utilisateur
- [ ] Limitation de débit sur l'auth : celle de Supabase par défaut ; rien côté `/api/*` pour l'instant
- [ ] Webhooks signés (pas encore de Stripe)
- [x] Uploads : taille (200 Mo) et types limités (bucket + route), bucket privé
- [x] Aucune donnée utilisateur dans les URL ni dans les journaux
- [ ] `pnpm audit` à lancer avant le déploiement
- [ ] Politique de confidentialité listant les sous-traitants (avant le lancement)

## Commandes

```
pnpm db:start          # Supabase local
pnpm db:test           # pgTAP (24)
pnpm -r test           # Vitest web (6) + worker (33, dont intégration)
pnpm -r typecheck
pnpm --dir apps/worker start   # worker (handler ingest_source)
```
