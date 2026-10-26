# 5. Les états d'expérience de l'utilisateur

L'expérience de Vitalis évolue progressivement en fonction de ce que l'utilisateur a réellement fait dans l'application.

Ces niveaux décrivent la **maturité de l'expérience utilisateur**. Ils ne remplacent pas les états du compte ni les états techniques du système.

Vitalis distingue ainsi trois dimensions :

- **État d'expérience** : maturité réelle de l'utilisation ;
- **État du compte** : situation du compte et niveau d'identification ;
- **État technique** : situation technique de l'application.

## 5.1 V0 — Visiteur

Le visiteur découvre Vitalis sans identité ni historique métier.

Vitalis peut lui présenter :

- sa proposition de valeur ;
- ses trois moteurs ;
- les possibilités générales de l'application ;
- les actions accessibles avant identification.

Vitalis ne doit cependant pas simuler une expérience personnalisée.

**Pas d'identité → pas d'historique → pas de personnalisation.**

## 5.2 V1 — Nouveau membre

L'utilisateur est identifié, mais n'a encore effectué aucune action métier.

Vitalis peut connaître certaines informations d'identité, comme le prénom et le nom, mais ne dispose encore d'aucune préférence comportementale réellement observée.

L'accueil peut donc utiliser l'identité :

> « Bonjour Jean 👋 »

Mais il ne doit pas afficher :

> « Votre dernier Flash »

si aucun Flash n'a été créé.

À ce stade, Vitalis doit principalement proposer des actions possibles.

## 5.3 V2 — Découverte

L'utilisateur a commencé à utiliser Vitalis et des événements réels existent désormais.

Il peut par exemple avoir :

- publié un Flash ;
- effectué un Scan ;
- configuré un Radar ;
- réalisé une autre action réelle dans l'application.

Vitalis peut alors rappeler ces événements.

Exemple :

> « Votre premier Flash a été publié. »

Cependant, quelques événements isolés ne doivent pas être transformés automatiquement en habitudes ou en préférences.

**Un événement réel est une donnée ; il n'est pas automatiquement une préférence.**

## 5.4 V3 — Actif

L'utilisateur possède suffisamment d'activité pour que son historique commence à devenir utile.

Vitalis peut alors faciliter la continuité de son expérience, par exemple :

- reprendre une recherche réellement effectuée ;
- retrouver un Flash réel ;
- rappeler un Radar existant ;
- présenter certaines statistiques réelles ;
- proposer des actions liées à une activité effectivement observée.

Les suggestions restent fondées sur des faits disponibles.

## 5.5 V4 — Régulier

L'utilisateur dispose d'un historique suffisamment riche pour permettre une personnalisation plus avancée.

Vitalis peut identifier certains comportements récurrents et proposer des suggestions plus pertinentes.

Même à ce niveau :

**Observation ≠ préférence certaine.**

Une suggestion doit rester explicable et ne doit jamais transformer une inférence en vérité.

## 5.6 Une évolution fondée sur les événements réels

Les niveaux V0 à V4 ne doivent pas être des catégories arbitraires.

Ils doivent évoluer progressivement à partir des événements réellement enregistrés.

La logique générale est :

**V0 → identification → V1 → premières actions → V2 → activité suffisante → V3 → historique riche → V4**

Les seuils précis permettant de passer d'un niveau à un autre pourront être définis ultérieurement.

## 5.7 L'absence d'activité est un état valide

Un utilisateur V1 n'est pas un utilisateur « incomplet ».

Il se trouve simplement au début de son parcours.

Vitalis ne doit donc pas chercher artificiellement à remplir son expérience avec des historiques, des statistiques ou des recommandations inexistantes.

L'absence d'activité doit pouvoir être représentée naturellement par un état vide approprié et une proposition d'action.

## 5.8 Séparation des dimensions d'état

Les niveaux d'expérience V0 à V4 décrivent uniquement la maturité de l'utilisation.

Ils doivent rester séparés :

### État d'expérience
Maturité réelle de l'utilisation : **V0 à V4**.

### État du compte
Situation administrative et niveau d'identification du compte, selon les états définis par le projet.

### État technique
Situation actuelle du système : chargement, en ligne, hors ligne, erreur, etc.

Cette séparation permet à Vitalis de déterminer précisément ce qu'il sait de l'utilisateur, ce qu'il peut lui présenter et quelle action il peut lui proposer.