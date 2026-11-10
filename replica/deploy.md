# Déploiement : contrôle préalable et plan (Vercel)

Date du contrôle : 2026-11-10, branche `feat/m4-sharing` (commit `d22878b`).

## 1. Contrôle préalable

| Contrôle | Résultat | État |
| --- | --- | --- |
| Build de production (`next build`, copie de travail isolée) | réussi : 37 routes, middleware compilé | ✅ |
| Tests | web 9, core 5, worker 53, pgTAP 33 : tous verts lors des derniers passages ; pas de tests Playwright | ✅ (pas d'E2E navigateur) |
| Parité (`parity.py`) | 73,8 / 100 ; **22 / 22 indispensables** | ✅ |
| Balayage de marque (`sweep.py`, noms et domaines de la référence) | code livré propre ; seule mention : « Google Drive » (connecteur prévu) dans le README | ✅ |
| Identité (`/replica-brand`) | **non faite** : pas de `replica/brand.json` ; nom « Notebook » générique, pas d'image OG, favicon à vérifier | ⚠️ |
| Politique de confidentialité et conditions d'utilisation | **absentes** (doivent lister les sous-traitants : Supabase, Vercel, OpenRouter et les fournisseurs de modèles, hébergeur du worker) | ❌ |
| Suppression de compte | **absente** (`DELETE /me` prévue au jalon M4) | ❌ |
| Bannière cookies | inutile : seuls des cookies de session essentiels, polices auto-hébergées | ✅ |
| Facturation | **simulée** : en production, n'importe qui pourrait passer en Pro sans payer | ❌ pour un lancement public |
| Emails (confirmation, lien magique) | SMTP par défaut de Supabase : très limité, réservé aux tests | ❌ pour un lancement public |
| Bugs S1 / S2 connus | aucun ouvert | ✅ |

**Verdict : pas prêt pour un lancement public.** Possible en **pré-production privée** (testeurs invités) une fois les points ❌ acceptés comme tels, avec la facturation simulée désactivée ou réservée aux comptes de test.

## 2. Ce qui part où

| Élément | Hébergement | Pourquoi |
| --- | --- | --- |
| `apps/web` (Next.js) | **Vercel** | pages + API ; les fichiers vont directement au stockage (URL signée), donc pas de limite de taille Vercel |
| `apps/worker` | **hors Vercel** : Render (Background Worker), Railway ou Fly.io | processus permanent qui boucle sur la file `jobs` ; Vercel n'exécute que des fonctions courtes |
| Base, Auth, Storage | **projet Supabase de production** (distinct du local) | — |

Le chat en flux tient en 60 s (`maxDuration = 60`), compatible avec l'offre gratuite de Vercel.

## 3. Étapes (actions de l'utilisateur marquées 👤)

### Supabase (production)
1. 👤 Créer un projet sur supabase.com (région UE conseillée), activer les sauvegardes.
2. Lier et pousser le schéma **et** les offres (le seed contient les plans Gratuit / Pro) :
   ```bash
   pnpm exec supabase link --project-ref <ref-du-projet>
   pnpm exec supabase db push --include-seed
   ```
3. 👤 Storage : taille maximale des fichiers à 200 Mo (Settings → Storage), les buckets privés sont créés par la migration.
4. 👤 Auth → URL Configuration : *Site URL* = l'URL Vercel ; *Redirect URLs* = `https://<domaine>/auth/callback` (et l'URL de prévisualisation si besoin).
5. 👤 Auth → SMTP : brancher un fournisseur (Resend, Postmark…) avant d'ouvrir à d'autres personnes.

### Vercel (web)
1. 👤 vercel.com → *Add New Project* → importer `moonback/Notebook`.
2. **Root Directory : `apps/web`** (Vercel détecte Next.js et pnpm ; les fichiers hors du dossier, dont `packages/core`, sont inclus).
3. Variables d'environnement (Production), valeurs du projet Supabase de production et de votre compte OpenRouter :

   | Variable | Valeur |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL du projet de production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé `anon` de production |
   | `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` de production (jamais exposée au navigateur) |
   | `OPENROUTER_API_KEY` | clé OpenRouter (idéalement une clé dédiée à la production, avec plafond de dépense) |
   | `OPENROUTER_CHAT_MODEL` | modèle de chat |
   | `OPENROUTER_EMBEDDINGS_MODEL` | `mongodb/voyage-4` (identique au worker) |
   | `APP_URL` | `https://<domaine>` |
   | `BILLING_MODE` | `simulated` tant que Stripe n'est pas branché |
4. Déployer. La branche `main` part en production ; chaque pull request reçoit une URL de prévisualisation.

### Worker (Render, par exemple)
1. 👤 Nouveau *Background Worker* relié au dépôt, Node 24.
2. Build : `corepack enable && pnpm install --frozen-lockfile` ; Start : `pnpm --dir apps/worker start` (lit les variables de l'hôte ; `.env` facultatif).
3. Variables : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (production), `EMBEDDINGS_PROVIDER=openrouter`, `EMBEDDINGS_MODEL=mongodb/voyage-4`, `EMBEDDINGS_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_CHAT_MODEL`.
4. Une seule instance suffit au départ ; on peut en ajouter, la file gère la concurrence.

### Domaine (facultatif)
👤 Acheter le domaine, puis dans Vercel → Domains : enregistrement **A** `@` vers l'IP indiquée par Vercel et **CNAME** `www` vers `cname.vercel-dns.com` ; choisir un hôte canonique et rediriger l'autre. Pour les emails : SPF, DKIM et DMARC (`v=DMARC1; p=none; rua=mailto:…`) fournis par le fournisseur SMTP.

## 4. Surveillance de la première semaine
- Journaux Vercel (erreurs 5xx de `/api/v1/*`) et journaux du worker (`requeue_stale_jobs`, échecs `embeddings_config` / `ai_config`).
- Table `jobs` : aucun job bloqué en `queued` ou `running` ; table `usage_ledger` : réservations bien confirmées ou remboursées.
- Tableau de bord OpenRouter : dépense par jour.
- Parcours complet sur le site en ligne : inscription, import, question avec citation, génération Studio.

## 5. Avant un lancement public
1. Pages Confidentialité et Conditions, suppression de compte, export des données (M4).
2. Stripe réel (Checkout, portail, webhooks) ou désactivation du changement d'offre.
3. SMTP de production et domaine d'envoi vérifié.
4. Identité : nom, logo, favicon, image OG (`/replica-brand`).

URL en ligne : *à compléter après le premier déploiement.*
