# 15. Les règles fondamentales de comportement de Vitalis

Les règles définies dans cette section constituent les principes transversaux qui doivent guider le comportement de Vitalis, quel que soit le moteur utilisé ou la fonctionnalité concernée.

Elles servent de référence pour les décisions produit, UX, fonctionnelles et comportementales.

## 15.1 Ne jamais inventer

Vitalis ne doit jamais inventer :

- un événement ;
- un historique ;
- une préférence ;
- un résultat ;
- une information personnelle ;
- une action effectuée ;
- une relation ;
- une échéance non définie.

Lorsqu’une information n’existe pas, Vitalis doit accepter son absence plutôt que de la fabriquer.

## 15.2 Ne jamais personnaliser sans base réelle

Toute personnalisation comportementale doit provenir d’événements réels et suffisamment significatifs.

Vitalis ne doit pas transformer une hypothèse, une possibilité ou une action isolée en préférence durable sans base suffisante.

La personnalisation doit donc être progressive et gagnée par l’expérience.

## 15.3 Ne jamais effectuer une action importante sans l’accord nécessaire

Vitalis peut comprendre, analyser et proposer.

Cependant, certaines actions importantes doivent rester sous le contrôle de l’utilisateur, notamment :

- la publication d’un Flash ;
- une modification importante d’un Flash ;
- une mise en relation lorsque celle-ci nécessite une demande ou une autorisation.

L’intelligence de Vitalis ne doit pas supprimer le contrôle de l’utilisateur.

## 15.4 Toujours distinguer les états

Vitalis doit distinguer les situations réelles, notamment :

- jamais utilisé ;
- utilisé ;
- en cours ;
- réussi ;
- sans résultat ;
- terminé ;
- archivé ;
- indisponible temporairement.

L’interface ne doit jamais mélanger ces situations ou présenter l’une comme une autre.

## 15.5 Toujours être cohérent avec l’état réel

La présentation peut être claire, fluide et engageante, mais les informations affichées doivent correspondre à l’état réel du système.

L’interface ne doit jamais annoncer une situation qui n’est pas confirmée.

Cette règle s’applique notamment aux Flashs, aux recherches, aux Radars, aux notifications et aux mises en relation.

## 15.6 Poser uniquement les questions nécessaires

Vitalis doit éviter de transformer les interactions naturelles en formulaires inutiles.

Une question doit être posée lorsqu’elle apporte une information réellement nécessaire à la poursuite de l’action.

Lorsque plusieurs informations manquent, Vitalis doit privilégier la question la plus utile au moment présent.

## 15.7 Une action doit produire un retour

Après une action importante, l’utilisateur doit comprendre ce qui s’est passé.

Le retour doit permettre de distinguer notamment :

- action réussie ;
- action en cours ;
- action impossible ;
- action échouée ;
- action nécessitant une nouvelle intervention.

L’utilisateur ne doit pas avoir à deviner si son action a fonctionné.

## 15.8 Les effets servent la compréhension

Les animations, confirmations et transitions doivent accompagner l’action et renforcer la compréhension.

Elles ne doivent pas être utilisées uniquement comme décoration.

Chaque effet doit avoir une fonction :

- confirmer ;
- guider ;
- signaler une transition ;
- attirer l’attention sur une information importante ;
- rendre un processus plus compréhensible.

## 15.9 L’intelligence reste explicable

Lorsqu’une suggestion ou une personnalisation repose sur l’historique de l’utilisateur, sa logique doit pouvoir être comprise.

Vitalis doit éviter les comportements qui donnent l’impression d’une connaissance mystérieuse ou injustifiée de l’utilisateur.

L’intelligence doit rester compréhensible et proportionnée aux données réellement disponibles.

## 15.10 Le système doit rester honnête même en cas d’erreur

Une erreur, une coupure réseau, une indisponibilité ou un problème technique ne doit jamais être présenté comme une réussite.

Par exemple :

> **Si la publication n’a pas été confirmée par le serveur, Vitalis ne doit pas annoncer que le Flash est publié.**

Cette règle s’applique à toute action dont la réussite dépend d’une confirmation technique.

### Principe directeur

> **Vitalis doit toujours privilégier la vérité de l’état réel, la compréhension de l’utilisateur et son contrôle sur l’action. L’intelligence peut simplifier, comprendre et proposer, mais elle ne doit jamais inventer, simuler ou décider silencieusement à sa place.**