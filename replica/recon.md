# Recon map : Gemini Notebook, ex-NotebookLM (web)

- **Cible** : `notebook.google.com`. Le produit a été renommé de NotebookLM en « Gemini Notebook », a priori le 16/07/2026 d'après des sources tierces. L'aide officielle utilise déjà le nouveau nom.
- **Périmètre** : application web desktop. Tout ce qui est listé dans la demande est couvert. Le mobile n'est traité qu'en annexe.
- **Pour** : un SaaS commercial indépendant, dépôt `moonback/Notebook`.
- **Date** : 2026-11-09.
- **Fichiers liés** : [screens-inventory.md](screens-inventory.md), [user-flows.md](user-flows.md), [data-model-observations.md](data-model-observations.md), [features.csv](features.csv), [open-questions.md](open-questions.md).

## 0. Méthode et honnêteté

| niveau | sens | volume |
| --- | --- | --- |
| **Observé (OBS)** | Vu directement. **Uniquement la landing publique S01.** Aucune interface derrière la connexion n'a été vue ni testée. | 1 écran |
| **Documenté (DOC)** | Tiré des 26 articles d'aide officiels lisibles, en paraphrase et avec le n° d'article. | ~80 % du contenu |
| **Hypothèse (HYP)** | Déduction à valider sur captures (liste dans `open-questions.md` § E). | tableau de bord, renommer/supprimer, états vides et d'erreur |
| **Inaccessible (INA)** | 18+, abonnement, Workspace, Play Books, mobile, mode interactif. | voir Q21 à Q26 |

Règles appliquées :
- lecture à vitesse humaine de pages publiques ;
- aucun crawler, aucune lecture de bundle JS, aucune API privée, aucun log réseau ;
- aucune connexion à un compte ;
- texte de l'original paraphrasé, jamais recopié.

### Conditions d'utilisation (vérifiées le 2026-11-09)

- Les **règles d'usage de l'IA générative** de Google interdisent d'utiliser du contenu généré par leurs services pour développer des modèles de ML ou une technologie d'IA associée.
- Les **conditions additionnelles IA générative** interdisent d'utiliser les Services pour développer des modèles de ML ou une technologie associée.
- Les **conditions générales** interdisent la rétro-ingénierie pour extraire des secrets commerciaux, ainsi que l'accès automatisé contraire à robots.txt.

**Conséquence pour ce projet.** Étudier les fonctionnalités et les parcours est compatible avec ces textes. En revanche :

1. **Ne jamais réutiliser** une sortie de Gemini Notebook (audio, rapport, réponse, prompt affiché) comme donnée d'entraînement, d'évaluation, de few-shot, de jeu de test ou de démo.
2. Les captures de l'utilisateur restent dans `replica/screens/` comme référence de mise en page.
3. La formule « technologie associée » est large. Faire valider par un juriste avant le lancement commercial (Q27).

## 1. Sources

| # | source | URL | apport |
| --- | --- | --- | --- |
| 1 | Landing publique (OBS) | https://notebook.google.com/ | positionnement, CTA |
| 2 | Pages marketing et plans | https://notebooklm.google/ , https://notebooklm.google/plans | SPA : titres seulement, prix **non lus** |
| 3 | Aide : présentation | https://support.google.com/gemininotebook/answer/16164461 | fonctions clés, données |
| 4 | Aide : créer un notebook (Studio, partage, copie, analytics, emoji, notifications) | …/answer/16206563 | **article pivot** |
| 5 | Aide : sources (types, limites, Drive, URL, YouTube, audio, Fast/Deep Research, labels) | …/answer/16215270 | import |
| 6 | Aide : chat | …/answer/16179559 | chat, citations, configuration |
| 7 | Aide : notes | …/answer/16262519 | notes-sources |
| 8 | Aide : Mind Maps | …/answer/16212283 | carte mentale |
| 9 | Aide : Audio Overview | …/answer/16212820 | audio |
| 10 | Aide : Video Overview | …/answer/16454555 | vidéo |
| 11 | Aide : Slide Decks | …/answer/16757456 | présentations |
| 12 | Aide : Infographies | …/answer/16758265 | infographies |
| 13 | Aide : Flashcards et Quiz | …/answer/16958963 | révision |
| 14 | Aide : Rapports | …/answer/18323649 | rapports |
| 15 | Aide : plans | …/answer/16213268 | paliers, limites |
| 16 | Aide : limites d'usage | …/answer/17670842 | quotas, Generate later |
| 17 | Aide : comptes pro et école | …/answer/16337734 | tableau de quotas détaillé |
| 18 | Aide : notebooks publics et featured | …/answer/16322204 | partage public |
| 19 | Aide : FAQ | …/answer/16269187 | erreurs, contexte du prompt |
| 20 | Aide : thème, langue de sortie | …/answer/16225229 , …/answer/16261963 | paramètres |
| 21 | Aide : apps connectées | …/answer/18784282 | intégrations |
| 22 | Aide : Gemini Apps, AI Mode | …/answer/17003757 , …/answer/17513891 | écosystème (skip) |
| 23 | Aide : confidentialité, signalement | …/answer/17004255 , …/answer/16179536 | données, modération |
| 24 | Aide : app mobile | …/answer/16296687 | mobile (annexe) |
| 25 | CGU Google + règles IA générative | https://policies.google.com/terms , https://policies.google.com/terms/generative-ai/use-policy , https://policies.google.com/terms/generative-ai | conformité |
| 26 | Presse et blogs (secondaire) | https://techcrunch.com/2026/06/08/notebooklms-new-update-will-help-you-build-source-repository-from-chat/ , https://elephas.app/blog/notebooklm-plus-worth-it.md , https://aiproductivity.ai/pricing/notebooklm/ | renommage, prix indicatifs |

Non consultés : changelog officiel, fiches App Store / Play Store, vidéos de démonstration. Voir § 9.

## 2. Boucle cœur

> **Importer ses propres documents → poser des questions dont chaque réponse est citée et vérifiable en un clic → transformer le tout en formats d'étude (note, rapport, flashcards, audio).**

Le chat ancré avec citations est ce qui fait revenir l'utilisateur. Le Studio, et l'audio en particulier, est ce qui fait parler du produit. Les quotas de génération du Studio sont le principal levier de monétisation.

## 3. Écrans, parcours, composants

- **34 écrans** (S01–S34) : voir [screens-inventory.md](screens-inventory.md).
- **26 parcours** (F01–F26) : voir [user-flows.md](user-flows.md).
- **17 composants récurrents** : en bas de l'inventaire.

Disposition centrale documentée : **3 panneaux, Sources | Chat | Studio** (S08).

## 4. Fiches fonctionnelles

Chaque fiche couvre : description, parcours, écrans, composants, actions, états (chargement, vide, erreur), validation, données, dépendances, priorité. L'état de reconnaissance est indiqué en tête. « ? » signale ce qui reste à confirmer sur captures.

### 4.1 Tableau de bord et gestion des notebooks — DOC partiel + HYP — P0
- **Description** : accueil listant les notebooks (possédés, partagés, publics visités) ; onglet « Featured » pour les comptes grand public.
- **Parcours** : F01, F02, F21, F23. **Écrans** : S03, S04.
- **Composants** : bouton Créer, cartes (emoji, titre), menu ⋮, onglets, badge de plan.
- **Actions** : ouvrir, créer, retirer un notebook public de l'accueil (DOC) ; renommer et supprimer (HYP, Q09, Q10).
- **États** : vide ? rempli ? limite de notebooks atteinte (100 / 200 / 500 selon le plan) ?
- **Validation** : quota de notebooks par utilisateur.
- **Données** : Notebook, NotebookMember, NotebookVisit.
- **Dépendances** : auth.

### 4.2 Création, renommage, suppression, emoji — DOC + HYP — P0
- **Création** : un clic, puis la pop-up d'ajout de sources s'ouvre (DOC 16206563).
- **Emoji** : attribué automatiquement après les sources ; on le change via une recherche d'emoji dans le chat (DOC).
- **Titre automatique, renommage, suppression** : non documentés (HYP). Deux articles de l'aide renvoient une 404 (Q01).
- **Effet d'une suppression** : les sources sont supprimées et les liens publics cessent de fonctionner (DOC 17003757, 16322204).
- **Validation à prévoir** : titre non vide ; confirmation explicite avant suppression.

### 4.3 Partage — DOC — P1
- **Privé** : invitation par email avec le rôle Lecteur (lecture des sources et des notes) ou Éditeur (ajouter ou retirer sources et notes, partager à son tour). Jusqu'à 50 personnes pour un compte perso ; pas de Google Groups (16206563).
- **Public** : « Anyone with a link », signalé par une icône globe ; le visiteur doit être connecté. Désactivé pour Workspace/Edu (16322204).
- **Chat view** : lien qui n'affiche que le chat. **Il ne retire pas l'accès réel** d'après la doc ; c'est une faiblesse à corriger dans le clone.
- **Lien d'artefact** : consultable sans compte, invalide si l'artefact est supprimé.
- **Copie** : « Allow copies » ; la copie reprend sources et Studio, sans chat ni notes (contradiction avec la FAQ, Q02).
- **Analytics** : utilisateurs et requêtes par jour sur 7 jours, à partir de 4 utilisateurs.
- **États** : cadenas (privé), personnes (partagé), globe (public) (16269187).
- **Écrans** : S25, S26, S27, S32, S33. **Parcours** : F19 à F22.

### 4.4 Importation de sources et formats acceptés — DOC — P0
| catégorie | formats | particularités |
| --- | --- | --- |
| Fichiers | PDF, DOCX, TXT, MD, CSV, PPTX, EPUB | ≤ 200 Mo et ≤ 500 000 mots ; PDF protégé contre la copie refusé |
| Images | avif, bmp, gif, heic/heif, ico, jp2, jpeg, png, tiff, webp | « certains types fonctionnent moins bien » |
| Audio | ~22 extensions (mp3, wav, m4a, ogg, opus…) | transcrit à l'import ; ~70 langues ; refus si pas de parole |
| Web | URL HTML (texte seul ; ni images, ni vidéos, ni pages imbriquées) ; PDF par URL | paywall refusé ; plusieurs URL à la fois |
| YouTube | URL publique avec sous-titres | transcript seul ; vidéo de moins de 72 h parfois indisponible ; supprimée sous 30 j si la vidéo disparaît |
| Google | Docs, Slides (≤ 100 slides), Sheets (≤ 100k tokens) | sync auto ; ni notes de bas de page ni commentaires ; plusieurs onglets réunis en une source |
| Texte | copier-coller, titre modifiable | — |
| Autres | Play Books (skip), chats Gemini (skip) | — |

- **Limites de sources par notebook** : 50 (gratuit), 100, 300, 500 ou 400 (Q03), 600.
- **Erreurs documentées** : taille, nombre de mots, PDF protégé, lien YouTube invalide, vidéo jugée dangereuse, pas de sous-titres, langue non prise en charge, audio de mauvaise qualité.
- **États** : importing / ready / failed / inactive. Les visuels de ces états n'ont pas été vus (Q13, Q14).
- **Écrans** : S05, S06, S07. **Parcours** : F02 à F05.

### 4.5 Extraction et traitement des documents — DOC + HYP — P0
- Chaque source est convertie en texte (OCR / vision pour les images, STT pour l'audio, transcript pour YouTube). La visionneuse peut afficher un rendu différent de l'original (16215270).
- Chaque source reçoit un **Source Guide**, résumé généré automatiquement (16215270).
- Une source trop courte est citée en bloc, sans extrait (16215270, 16269187). Cela suggère un découpage en passages avec recherche des plus pertinents : *« récupère l'information la plus pertinente selon la question »* (FAQ). → **HYP : un pipeline RAG** (découpage, embeddings, recherche).
- Le modèle utilisé est Gemini. Le clone dépendra d'un LLM tiers.

### 4.6 Gestion et sélection des sources — DOC — P0
- **Sélection** : cases à cocher dans le panneau Sources et sélecteur dans le champ de saisie. Les notes ne sont prises en compte que si elles sont cochées.
- **Labels** : à partir de 5 sources, les labels sont automatiques par défaut ; on peut en créer, en renommer, en supprimer et y déplacer des sources.
- **Source Drive inactive** : elle compte dans le quota mais n'est plus utilisée ; un lien permet de demander l'accès.
- **Effet sur le Studio** : supprimer ou modifier une source **ne change pas** les artefacts déjà générés.
- **Inconnu** : la sélection est-elle personnelle ou partagée avec les collaborateurs ? (Q07)

### 4.7 Chat IA contextualisé — DOC — P0
- **Principe** : questions et instructions ; réponses tirées uniquement des sources. Si l'information est absente ou si la demande sort des sources (tâche créative), le chat refuse.
- **Configuration (S12)** : style Default / Learning Guide / Custom (persona libre) et longueur de réponse. Les consignes personnalisées sont synchronisées avec Gemini Apps.
- **Contrôles** : Stop / Keep generating ; étapes de réflexion dépliables ; cartes interactives (lancer une vidéo ou un deck depuis le chat).
- **Fonctions agentiques expérimentales** : recherche web, exécution de code, fichiers générés (png, svg, pdf, docx, md, txt, jpg, gif, csv, json, xlsx, pptx).
- **États** : vide (résumé et prompts suggérés), streaming, réponse, refus (filtre de sécurité ou info absente), quota proche ou atteint (message en pied de chat avec l'heure de réinitialisation).
- **Données** : ChatMessage, Citation.
- **Dépendances** : LLM, index vectoriel.

### 4.8 Citations — DOC — P0
- Citations inline numérotées. Survol : le texte cité s'affiche en entier. Clic : ouverture de la source au passage concerné.
- Les citations peuvent porter sur du texte ou sur des images.
- Les citations se retrouvent aussi dans les notes sauvegardées, les rapports et l'export Sheets (onglet 2).
- **Validation à prévoir** : chaque citation doit pointer vers un passage existant de la source.

### 4.9 Historique des conversations — DOC + HYP — P0
- L'historique est conservé et privé pour chaque utilisateur. On peut l'effacer via le menu ⋮ du chat → « Delete chat history ».
- La copie d'un notebook ne reprend pas le chat.
- **HYP** : un seul fil par notebook, pas de liste de conversations (Q08). C'est une opportunité de différenciation (C06).

### 4.10 Notes — DOC — P0
- **Création** : manuelle, à partir d'une réponse (« Save to note », format et citations conservés), ou par texte collé.
- **Statut** : une note **est une source**. On peut la cocher, elle peut être citée et elle sert aux générations du Studio.
- **Édition** : une note issue du chat n'est éditable qu'après retrait des citations.
- **Export et historique** : export vers Google Docs (sans synchronisation retour). Les anciennes notes du Studio se convertissent en sources (une par une ou toutes d'un coup).
- **Suppression** : définitive, sans récupération possible (FAQ). C'est une opportunité (D05).
- **Mobile** : lecture seule.

### 4.11 Studio — DOC — P1
- **Tuiles** : Audio, Vidéo, Mind Map, Rapports, Data Table, Flashcards, Quiz, Slide Deck, Infographie.
- **Paramétrage** : crayon pour personnaliser ; « View custom prompt » pour revoir le prompt utilisé.
- **Génération** : en **arrière-plan**, plusieurs jobs en parallèle possibles. À la fin : notification navigateur, titre d'onglet animé, point bleu « non lu ».
- **Quotas** : jauge de coût estimé ; « Generate later » quand le quota est épuisé.
- **Droits** : générer ou supprimer demande le droit d'édition sur le notebook.
- **Artefact automatique** : un artefact peut être offert à la première source, hors quota.
- **Actions sur un artefact** : renommer, télécharger, partager, supprimer, feedback.

### 4.12 Audio Overview — DOC (interactif INA) — P2
- **Principe** : discussion entre hôtes IA.
- **Formats** : Deep Dive (2 voix, par défaut), Brief (1 voix, moins de 2 min), Critique, Debate.
- **Options** : langue (80+), longueur (courte / normale / longue, anglais seulement pour longue), prompt de focalisation.
- **Lecteur** : vitesse, avance et retour, téléchargement, partage par lien, 👍/👎. On peut continuer à chatter pendant l'écoute.
- **Mode interactif** : anglais seulement ; l'utilisateur « rejoint » la conversation à la voix et les hôtes lui répondent.
- **États** : génération de quelques minutes, puis « Load » pour les anciens audios.
- **Quota** : 3 par jour en gratuit (tableau Workspace).
- **Dépendances** : LLM pour le script, TTS multi-voix, stockage.

### 4.13 Cartes mentales — DOC — P1
- **Génération** : depuis une chip du chat ; le résultat est rangé comme note dans le Studio.
- **Viewer** : zoom, défilement, déplier ou replier les branches. **Cliquer un nœud pose une question dans le chat.** Plein écran, téléchargement, feedback.
- **Régénérer** = supprimer la note (pas de bouton dédié).
- **Quota** : 10 par jour en gratuit.

### 4.14 Flashcards et quiz — DOC — P1
- **Options** : difficulté facile / moyen / difficile, nombre (moins, standard, plus), prompt.
- **Flashcards** : retourner, « Got it » / « Missed it », Explain, mélanger, supprimer une carte, recommencer, plein écran, export CSV. La progression est mémorisée. À la fin : bilan et nouvelle session avec les mêmes cartes, toutes les cartes, ou seulement les cartes ratées.
- **Quiz** : Hint, Explain, navigation, score, Retake.
- **Quota** : 10 par jour en gratuit.

### 4.15 Rapports, présentations, infographies, tableaux — DOC (deck et infographie 18+ INA) — P1/P2
- **Rapports « Document »** : modèles FAQ, Study guide, Briefing, suggestion IA ou personnalisé. Export vers Docs ; les tableaux du rapport partent vers Sheets.
- **Rapports « Interactive »** (Learning Overview) : ils proposent d'autres artefacts à intégrer.
- **Data Table** : colonnes définies par prompt ; export Sheets (données dans l'onglet 1, citations dans l'onglet 2).
- **Slide Deck** :
  - options : format, langue, longueur, sources, prompt ;
  - revue du plan avant rendu (« Proceed » est irréversible) ;
  - slideshow ;
  - **révision par slide** (texte, mise en page, visuel ; supprimer, restaurer ou réordonner) : chaque révision produit un nouveau deck et consomme du quota, et les sources ne sont pas relues ;
  - export PDF ou PPTX.
- **Infographie** : langue, niveau de détail (concis, standard, détaillé), orientation (carré, portrait, paysage), style visuel, prompt. Export PNG.
- **Video Overview** :
  - formats : Explainer, Short (~60 s), Cinematic (18+, anglais) ;
  - 8 styles visuels plus un style personnalisé ;
  - revue des « producer notes » avant rendu ;
  - génération parfois supérieure à 30 min.

### 4.16 Paramètres et préférences — DOC — P0/P1
- **Menu Settings** :
  - langue de sortie (80+, par défaut celle du compte) ;
  - thème clair, sombre ou appareil (par défaut : appareil) ;
  - notifications web ;
  - Usage ;
  - Connected apps (activées globalement, désactivables par notebook) ;
  - Send feedback (avec capture) ;
  - Report notebook (choix du type d'abus).
- **Menu profil** : bouton « Visible watermarking » (Pro et Ultra).

### 4.17 Limites d'usage et premium — DOC (contradictions Q04, Q05) — P1
| limite (palier gratuit → plus haut) | valeur |
| --- | --- |
| Notebooks par utilisateur | 100 → 200 → 500 |
| Sources par notebook | 50 → 100 → 300 → 400/500 → 600 |
| Chats par jour (tableau Workspace) | 50 → 200 → 500 → 1k → 5k |
| Audio et vidéo par jour | 3 → 6 → 20 → 40 → 200 |
| Rapports, flashcards, quiz, mind maps par jour | 10 → 20 → 100 → 200 → 1k |
| Deep Research | 10 par mois → 3, 20, 30, 200 par jour |
| Data tables, infographies, decks | « Limited » → « Highest » (non chiffré) |
| Autres différences premium | partage avancé (payant), accès anticipé, retrait du watermark visible (Pro et plus, sauf IN/KR/VN) |

- **Second modèle de quota** (17670842) : limites « compute-based », rafraîchies toutes les 5 h jusqu'à un plafond hebdomadaire ; ×2 pour Plus, ×4 pour Pro, ×5 ou ×20 de Pro pour Ultra.
- **Hors quota** : « Generate later », « Upgrade » depuis le chat et le Studio.
- **Prix indicatifs (US, sources tierces, non vérifiés)** : Plus ~4,99 $/mois, Pro ~19,99 $/mois, Ultra ~99,99 $ ou 199,99 $/mois.

## 5. Modèle de données

Voir [data-model-observations.md](data-model-observations.md) : 20 entités et 12 règles métier documentées.
Point clé : **une note est une source**, et un artefact garde un **instantané** des sources utilisées.

## 6. Matrice des fonctionnalités

Voir [features.csv](features.csv) : **86 lignes**.

| | nombre |
| --- | --- |
| P0 | 22 |
| P1 | 25 |
| P2 | 21 |
| P3 | 18 |
| must | 22 |
| should | 25 |
| could | 39 |
| skip | 7 |
| fonctions absentes de l'original (différenciation, `original=no`) | 8 |

Le fichier est compatible avec `replica-diff/parity.py`, déjà vérifié : 71 lignes comptées.

## 7. Hors périmètre (ne peut pas ou ne doit pas être cloné)

- Ebooks Play Books : catalogue sous licence et partenariat.
- Intégration Gemini Apps et AI Mode : écosystème Google.
- Contenu des notebooks « featured » : éditorial sous licence. La **mécanique** de galerie reste clonable.
- Modèles Gemini, Veo, Nano Banana et watermark SynthID : propriétaires. À remplacer par des fournisseurs tiers.
- Sécurité Google Cloud (VPC-SC, IAM) et offres Workspace.
- Nom, logo, couleurs, textes et voix de l'original : identité à recréer (`/replica-brand`).
- **Toute sortie générée par Gemini Notebook** : interdite comme donnée pour le clone (voir § 0).

## 8. Différenciation et opportunités commerciales

Faiblesses relevées **dans la doc officielle** :
- un notebook ne voit pas les autres ;
- une note supprimée est irrécupérable ;
- la « chat view » n'isole pas vraiment le contenu ;
- les artefacts ne se mettent pas à jour quand les sources changent ;
- un seul fil de chat (supposé) ;
- l'export Docs n'est pas synchronisé ;
- le partage public est impossible en Workspace ;
- de nombreuses fonctions sont réservées aux 18+ ;
- les quotas sont opaques et ont changé plusieurs fois ;
- l'outil est fermé, sans API ;
- l'écosystème est enfermé chez Google (Drive uniquement).

Pistes pour un produit vendable :
1. **Confiance et conformité UE** : hébergement en UE, pas d'entraînement, DPA, journal d'audit. C'est l'argument principal en B2B européen (Z04).
2. **Recherche transverse** sur plusieurs notebooks ou sur tout un espace d'équipe (Z02).
3. **Multi-conversations** nommées par notebook (C06) et **corbeille / versions** des notes (D05).
4. **Artefacts « vivants »** : bandeau « sources modifiées, régénérer ? » et comparaison des différences.
5. **Connecteurs ouverts** : Notion, OneDrive/SharePoint, Dropbox, Confluence, Zotero (B09).
6. **Espaces d'équipe** avec SSO et facturation par siège (Z01), et une **chat view réellement restreinte** (H03) pour publier une base de connaissance à des clients.
7. **API et webhooks** (Z03) pour intégrer l'outil dans des workflows.
8. **Verticalisation** : juridique (citations au paragraphe, export des références), recherche académique (BibTeX, DOI), formation (répétition espacée FSRS, F04, et suivi de cohorte).
9. **Quotas lisibles** : crédits affichés en euros ou en unités, prix stables.
10. **Choix du modèle LLM** et option « BYO key » pour les clients sensibles.

## 9. Taille et rapport de couverture

**Taille** :
- Volumes : 34 écrans, 26 parcours, 20 entités, 86 fonctionnalités.
- Parties difficiles :
  1. RAG avec citations précises au passage, plus la visionneuse qui surligne ;
  2. pipeline d'ingestion multi-format (OCR, STT, YouTube, web anti-SSRF) et file de jobs asynchrones ;
  3. génération audio multi-voix, puis vidéo et decks.
- Périmètre complet : **XL → à recadrer**.
- MVP proposé, taille **M** (quelques semaines) : boucle cœur P0 = sources (PDF, DOCX, TXT, MD, URL, texte) → chat ancré avec citations → notes comme sources, avec le tableau de bord et les paramètres de base.
- Ensuite : P1 (Studio texte : rapports, flashcards, quiz, mind map ; partage ; plans), puis P2 (audio, deck, infographie).

**Couverture** :

| domaine demandé | couverture | manque |
| --- | --- | --- |
| Tableau de bord, gestion | 🟠 partielle (doc pauvre) | captures S03, renommer, supprimer (Q06, Q09, Q10) |
| Création, renommage, suppression, partage | 🟢 partage / 🟠 renommer et supprimer | 2 articles en 404 (Q01) |
| Import de sources, formats | 🟢 complète (doc) | messages d'erreur visuels (Q14) |
| Extraction, traitement | 🟠 inféré | interne non observable par nature |
| Gestion et sélection des sources | 🟢 | sélection perso ou partagée (Q07) |
| Chat, citations | 🟢 doc / 🔴 non observé | visuel des citations (Q16) |
| Historique | 🟠 | multi-fils ? (Q08) |
| Notes | 🟢 | format de l'éditeur (Q11) |
| Studio, audio, mind map, flashcards, quiz, rapports | 🟢 doc | aucun rendu vu |
| Slides, infographies, vidéo cinematic, Deep Research | 🟡 doc, INA 18+ | — |
| Paramètres | 🟢 | contenu de l'écran Usage (Q19) |
| Limites, premium | 🟠 contradictions | prix officiels (Q05), modèle de quota (Q04) |
| Mobile | ⚪ annexe | hors périmètre |

**Non fait** :
- aucune interface authentifiée vue ;
- pas de changelog officiel, ni de fiches stores, ni de vidéos ;
- pas d'avis utilisateurs (→ `/replica-entrepreneur`) ;
- page de prix officielle illisible (SPA).

**Prochaine étape** : l'utilisateur fournit les captures de la checklist (`open-questions.md` § E), puis on met à jour les lignes HYP et on lance `/replica-architect`.
