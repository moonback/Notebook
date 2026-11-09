# Journal de construction

| date | lot / écran | statut | ce qui manque | plus dur que prévu |
| --- | --- | --- | --- | --- |
| 2026-11-09 | M0 · S02 connexion / inscription | fait | Google OAuth (client Google requis) | Ports Supabase locaux déjà pris par 3 autres projets → plage 583xx |
| 2026-11-09 | M0 · accueil provisoire (compte, workspace, préférences) | fait | Remplacé par S03 au M2 | — |
| 2026-11-09 | M0 · worker | fait (sans handler métier) | Handlers à partir de M1 | Node « strip-only » refuse les parameter properties → `erasableSyntaxOnly` |
| 2026-11-09 | M0 · CI | écrite, non vérifiée | Exécution GitHub non contrôlée (demande utilisateur) | Build Next cassé quand le serveur de dev tourne en parallèle |
| 2026-11-09 | S03 tableau de bord (liste/grille, onglets, recherche, créer, renommer, supprimer) | fait | Collections, notebooks publics | Bouton `asChild` du design system cassé (deux enfants dans `Slot`) → corrigé |
| 2026-11-09 | S08 espace notebook + S05 ajout de sources + S10 visionneuse | fait | Renommer une source, labels, Studio (affiché « bientôt ») | Deux dispositions montées en même temps → deux chats ; une seule montée désormais |
| 2026-11-09 | S11 chat en flux + citations cliquables | fait (testé avec un faux OpenRouter) | Vraie clé OpenRouter ; Markdown riche | Effets React qui renvoyaient une valeur (`destroy is not a function`) |
| 2026-11-09 | S28 réglages (préférences + offre simulée) | fait | Stripe réel | — |
| 2026-11-09 | S24 notes (créer, modifier, verrou des citations, enregistrer une réponse) | fait | Éditeur riche (Tiptap prévu) : texte simple pour l instant ; export | Rechargement à chaud pendant le test (état UI perdu, serveur correct) |
