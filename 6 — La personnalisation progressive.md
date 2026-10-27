# 6. La personnalisation progressive

La personnalisation de Vitalis se construit progressivement à partir de l'expérience réelle de l'utilisateur.

Elle ne doit jamais être activée artificiellement pour donner l'impression que Vitalis connaît déjà l'utilisateur.

> **La personnalisation de Vitalis doit être gagnée par l'expérience, jamais simulée.**

## 6.1 Commencer sans supposer

Au début de son parcours, Vitalis ne connaît pas encore les habitudes de l'utilisateur.

Il ne doit donc pas essayer de donner l'impression qu'il le connaît.

Il propose simplement les actions disponibles.

Par exemple :

> « Que souhaitez-vous faire ? »

L'absence d'historique doit être considérée comme un état normal du parcours.

## 6.2 Utiliser les événements réels

Lorsqu'une action est réellement effectuée, elle crée un contexte exploitable par Vitalis.

Cela peut notamment être :

- un Flash publié ;
- un Scan effectué ;
- un Radar configuré ;
- ou une autre action réellement enregistrée.

Vitalis peut alors utiliser cet événement précis pour faciliter la suite du parcours.

Par exemple :

> « Reprendre votre dernier Scan »

est pertinent uniquement si un Scan a réellement été effectué.

## 6.3 Faciliter la continuité

Lorsque plusieurs actions réelles existent, Vitalis peut éviter à l'utilisateur de recommencer inutilement certaines étapes.

Il peut notamment :

- proposer de reprendre un Flash ;
- reprendre les critères d'un Scan précédent ;
- rappeler un Radar actif ;
- faciliter une action similaire.

Faciliter la continuité d'une action passée ne signifie cependant pas que Vitalis a identifié une préférence.

**Une action passée est un événement. Elle ne constitue pas automatiquement une préférence.**

## 6.4 Identifier progressivement des tendances

Lorsque suffisamment d'événements sont disponibles, Vitalis peut détecter certaines régularités.

Par exemple :

- plusieurs recherches dans une même zone ;
- plusieurs recherches portant sur une même catégorie ;
- plusieurs actions réalisées à des périodes similaires.

Vitalis peut alors formuler une compréhension prudente.

Par exemple :

> « Vous recherchez souvent dans cette zone. »

Cette formulation décrit une tendance observable.

Elle doit être préférée à une affirmation plus forte telle que :

> « Vous préférez toujours cette zone. »

La première s'appuie sur une observation ; la seconde affirme une préférence qui pourrait être incorrecte.

## 6.5 Transformer une tendance en suggestion

Lorsqu'une tendance est suffisamment établie, Vitalis peut proposer une action cohérente avec celle-ci.

Par exemple :

> « Vous recherchez souvent dans cette zone. Voulez-vous reprendre une recherche similaire ? »

La suggestion doit donc suivre une progression identifiable :

**Événements réels → Historique → Observations → Compréhension → Suggestion.**

Elle ne doit jamais suivre une logique de :

**Supposition → Personnalisation artificielle.**

## 6.6 Une progression liée à l'expérience

La personnalisation peut évoluer progressivement avec la maturité de l'utilisateur :

**V0 / V1 → Proposer**  
**V2 → Rappeler**  
**V3 → Faciliter**  
**V4 → Suggérer intelligemment**

Ces niveaux constituent une orientation générale et non une règle mécanique.

Les suggestions concrètes doivent toujours dépendre de la qualité, de la pertinence et de la quantité du contexte réellement disponible.

## 6.7 Principe directeur

Vitalis doit devenir progressivement plus pertinent à mesure que l'utilisateur l'utilise.

Cependant, cette progression doit toujours respecter les principes établis précédemment :

- ne pas inventer d'événement ;
- ne pas inventer d'historique ;
- ne pas transformer une hypothèse en fait ;
- ne pas présenter une inférence comme une certitude ;
- expliquer les suggestions lorsqu'elles reposent sur un contexte identifiable ;
- laisser l'utilisateur contrôler l'action proposée.

La personnalisation est donc une conséquence de l'expérience réelle, et non une simulation de proximité avec l'utilisateur.