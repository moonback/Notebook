# Vision produit — Leanna Notebook

> Document de cadrage produit construit à partir de l'analyse du code source publié sur la branche `main` de `moonback/Notebook`, le 10 novembre 2026. Les fichiers Markdown de conception et de roadmap existants n'ont pas été utilisés comme sources pour cette analyse.

## 1. Vision

**Leanna Notebook doit devenir un espace de travail intelligent qui transforme les documents, les informations et les idées d'un utilisateur en connaissances fiables, puis en livrables directement exploitables.**

L'utilisateur ne devrait pas avoir à choisir entre un gestionnaire documentaire, un assistant IA, un outil de recherche, un studio de création et un espace collaboratif. Leanna Notebook doit réunir ces usages dans un environnement cohérent : l'utilisateur apporte ses sources, comprend leur contenu, dialogue avec elles, construit une connaissance durable et produit des résultats.

Le produit ne doit pas être un simple clone d'une interface de chat documentaire. Sa valeur doit venir de la continuité entre cinq étapes :

1. **Collecter** — réunir des documents, pages Web, médias et contenus provenant de services externes.
2. **Comprendre** — extraire, transcrire, indexer et structurer l'information.
3. **Explorer** — poser des questions, comparer les sources, rechercher et vérifier les réponses.
4. **Créer** — produire des rapports, présentations, supports de formation et autres livrables.
5. **Partager** — collaborer, publier et réutiliser les connaissances dans un cadre maîtrisé.

La promesse centrale : **« De vos sources à des connaissances vérifiables et des créations prêtes à l'emploi. »**

## 2. Positionnement

Leanna Notebook se positionne comme une **plateforme personnelle et collaborative de connaissance augmentée par l'IA**.

Ce positionnement associe quatre dimensions :

- **Bibliothèque intelligente :** les sources sont organisées, retrouvables, actualisables et reliées entre elles.
- **Assistant de recherche :** les réponses sont fondées sur les sources accessibles et leurs citations sont vérifiables.
- **Studio de production :** les connaissances deviennent des documents et des supports adaptés à un objectif concret.
- **Espace de travail :** les utilisateurs peuvent retrouver leurs projets, travailler ensemble et accéder à leur environnement depuis le Web ou une application de bureau.

La différenciation ne doit pas reposer uniquement sur le nombre de modèles IA disponibles. Elle doit reposer sur la qualité du contexte, la traçabilité des réponses, la qualité des livrables et la fluidité du parcours complet.

## 3. Utilisateurs et situations d'usage

### Étudiants et enseignants
Importer des cours, articles, livres et supports, obtenir des explications, réviser, générer des quiz et préparer des présentations.

### Professionnels et indépendants
Analyser des dossiers clients, centraliser des documents, préparer des synthèses, produire des rapports et retrouver rapidement une information fiable.

### Équipes et organisations
Partager une base documentaire, contrôler les droits d'accès, préparer des livrables communs et conserver une connaissance collective.

### Créateurs et chercheurs
Croiser plusieurs sources, suivre un sujet, comparer des versions, identifier les contradictions et transformer les résultats en contenus publiables.

## 4. Principes directeurs du produit

1. **La source avant la réponse.** Une affirmation factuelle doit pouvoir être reliée à un élément consultable ; l'IA doit signaler les limites de ses sources.
2. **La transparence.** L'utilisateur doit savoir quelles sources ont été utilisées, lesquelles ont été ignorées et si un traitement est incomplet.
3. **Le contrôle utilisateur.** Les modèles, les données, les partages, les synchronisations et les dépenses IA doivent rester maîtrisables.
4. **La continuité.** Une source importée doit pouvoir alimenter le chat, les recherches, les rapports et les autres outils sans être retraitée inutilement.
5. **La qualité professionnelle.** Les documents générés doivent être structurés, modifiables, exportables et cohérents.
6. **La sécurité par défaut.** Isolation des espaces, permissions minimales, liens de partage révocables et protection des fichiers.
7. **L'interopérabilité.** Favoriser les formats ouverts et permettre à l'utilisateur de récupérer ses données.
8. **La simplicité.** Les fonctions avancées doivent enrichir le parcours sans surcharger l'interface principale.

## 5. État observé dans le code source

Le dépôt contient déjà une base fonctionnelle : application Next.js, Supabase, worker asynchrone, gestion des notebooks et de leurs membres, import de certaines sources, extraction de texte, indexation plein texte et vectorielle, chat en streaming, citations, feedback, résumés, suggestions de questions, notes, partage et Studio.

Le Studio implémenté dans le composant analysé propose actuellement quatre parcours visibles : rapports, fiches, quiz et cartes mentales. Le générateur de rapports utilise des modèles de consignes intégrés au code. Le client OpenRouter côté Web lit la configuration serveur ; le worker utilise également une configuration de modèle dédiée.

Limites techniques constatées dans les fichiers source consultés :

- L'extraction PDF signale explicitement les PDF scannés comme nécessitant un OCR non encore disponible.
- L'extracteur prend en charge PDF, DOCX, TXT, Markdown, CSV, PPTX, EPUB, notes et pages Web ; la chaîne complète pour l'audio, la vidéo et l'image n'est pas encore implémentée dans cet extracteur.
- Le code du Studio visible expose quatre types de création, même si le modèle de données prévoit d'autres types d'artefacts.
- Les suggestions de questions et les résumés existent déjà ; leur évolution doit donc les rendre plus contextuels plutôt que les recréer.
- Le dépôt `main` consulté contient les applications Web et worker ; aucune application de bureau n'apparaît dans son arborescence à cette date. L'expérience Electron doit donc être considérée comme un chantier de distribution à intégrer et valider dans le dépôt.

Cet état est un constat sur le code consulté, pas une affirmation sur d'éventuels développements locaux ou non publiés.

## 6. Les 20 fonctionnalités recommandées

Les propositions ci-dessous sont des évolutions à construire ou à approfondir. Elles ne doivent pas être interprétées comme des fonctionnalités déjà livrées.

### Priorité P0 — Renforcer le cœur documentaire

#### 1. OCR intelligent pour les documents et images
Détecter automatiquement les PDF scannés et les images sans couche texte, appliquer un OCR, conserver les coordonnées des blocs et, lorsque c'est possible, la page et la zone d'origine. Permettre de vérifier le texte reconnu et de relancer le traitement en cas de mauvaise qualité.

**Valeur :** rendre exploitables les archives, factures, scans, photos de cours et documents papier.

#### 2. Ingestion multimédia complète
Construire une chaîne dédiée à l'audio et à la vidéo : extraction des pistes, transcription, diarisation des intervenants, horodatage, chapitrage et indexation des segments. Les réponses doivent pouvoir citer un passage avec un lien temporel.

**Valeur :** faire des enregistrements, réunions, cours et vidéos des sources de connaissance au même titre que les PDF.

#### 3. Connecteur Google Drive avec synchronisation
Permettre de connecter un compte, parcourir les fichiers, importer une sélection et synchroniser les changements. Gérer les suppressions, les renommages, les doublons, les autorisations et les erreurs de synchronisation.

**Valeur :** éviter les imports manuels répétés et garder les notebooks à jour.

#### 4. Recherche globale dans tous les notebooks
Créer une recherche transversale avec filtres par notebook, source, date, type, auteur et étiquette. Les résultats doivent afficher un extrait pertinent et ouvrir directement le passage source.

**Valeur :** retrouver une information même lorsque l'utilisateur ne se souvient plus dans quel notebook elle se trouve.

#### 5. Organisation avancée des sources
Ajouter des collections, dossiers, étiquettes, favoris et vues enregistrées. Autoriser le déplacement de sources entre notebooks selon les permissions, sans dupliquer inutilement les fichiers.

**Valeur :** faire évoluer la bibliothèque documentaire lorsque le volume de sources augmente.

### Priorité P1 — Faire de la connaissance un avantage produit

#### 6. Comparaison de sources et détection des contradictions
Sélectionner plusieurs documents et demander une comparaison structurée : points communs, divergences, chiffres incompatibles, évolutions et informations absentes. Chaque élément doit renvoyer aux extraits concernés.

**Valeur :** passer de la simple synthèse à l'analyse documentaire.

#### 7. Recherche Web approfondie et sourcée
Proposer une recherche Web en plusieurs étapes : formulation du sujet, collecte de pages, extraction, recoupement, synthèse et bibliographie. Séparer clairement les sources du notebook des sources externes.

**Valeur :** permettre de compléter un corpus documentaire sans perdre la traçabilité.

#### 8. Historique et versionnement des sources
Conserver les versions successives d'un document synchronisé ou réimporté, détecter les changements et indiquer quelles réponses ou productions reposent sur une ancienne version.

**Valeur :** sécuriser les analyses de documents qui évoluent dans le temps.

#### 9. Base de connaissances et graphe de relations
Construire des relations entre personnes, organisations, concepts, projets, dates et documents. Présenter un graphe navigable et permettre de remonter de chaque relation vers les passages qui la justifient.

**Valeur :** faire émerger les liens entre des sources qui, isolément, semblent sans rapport.

#### 10. Mémoire de projet contrôlée
Permettre de créer une mémoire structurée par notebook : décisions, définitions, objectifs, personnes, règles et faits importants. Chaque élément doit être sourcé, daté, modifiable et supprimable.

**Valeur :** éviter de répéter le contexte à chaque conversation et conserver les décisions utiles.

### Priorité P1 — Faire du Studio un véritable outil de production

#### 11. Modèles de rapports générés et adaptés par l'IA
À partir des sources et de l'objectif de l'utilisateur, proposer des modèles de rapports pertinents : audit, étude, compte rendu, dossier de synthèse, analyse comparative, fiche projet, etc. Actualiser les suggestions lorsque le corpus change réellement, sans multiplier les appels inutiles.

**Valeur :** faire gagner du temps dès le démarrage d'une création.

#### 12. Éditeur de documents intégré
Créer un éditeur riche pour modifier les rapports et documents générés : titres, tableaux, images, blocs de citation, commentaires, styles et sommaire. Préserver les références aux sources pendant les modifications.

**Valeur :** transformer une sortie IA en document réellement finalisable.

#### 13. Export professionnel multi-format
Exporter les productions en DOCX, PDF, PPTX, Markdown et formats tabulaires adaptés. Gérer les modèles de mise en page, en-têtes, pieds de page, numérotation, bibliographie et identité visuelle.

**Valeur :** permettre l'utilisation immédiate des productions dans un contexte professionnel.

#### 14. Générateur de présentations et d'infographies
Créer des présentations à partir d'un rapport ou d'une sélection de sources, avec plan, diapositives, graphiques, notes du présentateur et références. Permettre de réorganiser et modifier les diapositives avant export.

**Valeur :** couvrir le passage de la recherche à la restitution orale ou visuelle.

#### 15. Génération de tableaux et extraction de données
Identifier les données structurées dans plusieurs documents, proposer un tableau normalisé, afficher la provenance de chaque cellule et permettre l'export CSV/XLSX. Inclure les unités, périodes et règles de calcul.

**Valeur :** exploiter les informations quantitatives sans ressaisie manuelle.

### Priorité P2 — Créer une expérience différenciante

#### 16. Audio Overview et podcasts à plusieurs voix
Transformer un ensemble de sources en discussion audio entre deux intervenants IA, avec choix de la durée, du ton, de la langue et des thèmes. Ajouter une transcription synchronisée et des références cliquables.

**Valeur :** apprendre ou réviser à partir des documents en mobilité.

#### 17. Mode vocal conversationnel
Permettre de parler naturellement avec l'assistant, de l'interrompre, de reprendre la conversation et de poser des questions sur les sources. Le mode vocal doit conserver les citations et le contexte du chat écrit.

**Valeur :** rendre la consultation documentaire plus naturelle et accessible.

#### 18. Collaboration en temps réel
Ajouter la présence des collaborateurs, les commentaires ancrés sur un passage, les annotations, les mentions et un historique des modifications. Distinguer les droits de consultation, de commentaire et d'édition.

**Valeur :** transformer les notebooks partagés en véritables espaces de travail d'équipe.

#### 19. Automatisations et workflows documentaires
Créer des règles déclenchées par un événement : nouvelle source, document modifié, synchronisation terminée ou échéance. Exemples : résumer les nouveaux documents, comparer deux versions, préparer un rapport périodique ou notifier un responsable.

**Valeur :** faire travailler Notebook en arrière-plan au lieu d'attendre chaque demande manuelle.

#### 20. Application de bureau et mode hors ligne
Finaliser une application Electron avec mises à jour automatiques, notifications, ouverture de fichiers locaux, reprise des tâches et cache local sécurisé. Prévoir une consultation hors ligne des documents déjà téléchargés, avec synchronisation différée et résolution des conflits.

**Valeur :** proposer une expérience de travail fiable et continue au-delà du navigateur.

## 7. Ordre de réalisation conseillé

| Phase | Fonctionnalités | Résultat attendu |
|---|---|---|
| Fondation | 1, 2, 3, 4, 5 | Bibliothèque universelle et retrouvable |
| Intelligence | 6, 7, 8, 9, 10 | Analyse transversale et connaissance durable |
| Production | 11, 12, 13, 14, 15 | Livrables professionnels |
| Expérience | 16, 17, 18, 19, 20 | Produit différenciant et quotidien |

Cet ordre est une proposition stratégique, pas un calendrier ferme. Les fonctionnalités doivent être découpées en lots testables, avec des critères d'acceptation et une validation de sécurité avant mise en production.

## 8. Exigences transversales

Chaque nouvelle fonctionnalité doit respecter les exigences suivantes :

- **Traçabilité IA :** conserver le modèle utilisé, les paramètres utiles, les sources consultées et les citations produites.
- **Gestion des coûts :** estimer ou mesurer la consommation, appliquer les quotas et restituer les crédits lorsqu'un traitement échoue.
- **Résilience :** progression persistante, reprise après incident, annulation, idempotence et erreurs compréhensibles.
- **Sécurité :** contrôle des accès côté serveur, RLS, isolation des espaces, validation des fichiers, protection SSRF et URLs signées à durée limitée.
- **Qualité :** tests unitaires, intégration, sécurité et parcours utilisateur ; pas de fonctionnalité annoncée comme terminée sans vérification.
- **Accessibilité :** navigation clavier, états de chargement, libellés accessibles et interface responsive.
- **Internationalisation :** interface et productions multilingues, avec langue de sortie contrôlable.
- **Observabilité :** journaux structurés, suivi des jobs, latence, erreurs et consommation, sans exposer de secrets.

## 9. Indicateurs de réussite

Les indicateurs prioritaires devraient mesurer la valeur réelle, pas seulement le nombre de fonctions :

- Temps entre l'import d'une source et sa disponibilité dans le chat.
- Taux de réussite des ingestions par format.
- Part des réponses avec citations vérifiables.
- Taux de consultation des citations et feedback sur les réponses.
- Temps nécessaire pour produire puis exporter un livrable.
- Taux de réutilisation des notebooks et des sources.
- Taux de synchronisation réussie des connecteurs.
- Coût IA moyen par tâche réussie.
- Rétention des utilisateurs et activité collaborative.
- Taux de réussite des mises à jour et de synchronisation de l'application de bureau.

## 10. Ce que Leanna Notebook ne doit pas devenir

- Un simple agrégateur de modèles IA sans expérience documentaire cohérente.
- Un chatbot qui invente des références ou masque l'incertitude.
- Un outil qui enferme les données dans un format propriétaire.
- Une interface surchargée de fonctions secondaires.
- Un générateur de documents impossibles à modifier ou à vérifier.
- Un produit dont les coûts IA sont opaques pour l'utilisateur.

## 11. Vision finale

À terme, un utilisateur doit pouvoir déposer un dossier composé de PDF, documents bureautiques, pages Web, images, enregistrements et vidéos. Notebook comprend ce corpus, le rend consultable, relie les informations, répond avec des références vérifiables et aide à produire un rapport, une présentation, un tableau ou un support audio.

Le travail peut ensuite être partagé avec une équipe, actualisé lorsque les sources changent et retrouvé depuis un espace personnel ou professionnel.

**Leanna Notebook doit devenir l'endroit où l'on rassemble ses informations, où l'on construit sa compréhension et où l'on transforme cette compréhension en résultats concrets.**
