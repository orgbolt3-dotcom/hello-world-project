# 8. Le principe des états vides

Dans Vitalis, un état vide n’est pas un défaut de l’application.

Il représente une situation réelle dans laquelle aucune donnée ou aucune action correspondante n’existe encore.

L’état vide doit donc être traité comme une partie normale de l’expérience utilisateur.

## 8.1 Un état vide est un état réel

Un écran peut naturellement être vide parce que l’utilisateur :

- n’a encore publié aucun Flash ;
- n’a encore effectué aucun Scan ;
- n’a encore configuré aucun Radar ;
- n’a reçu aucune notification ;
- n’a encore aucune activité à afficher ;
- n’a pas encore complété certaines informations de son espace.

Vitalis doit accepter ces situations sans chercher à les masquer.

## 8.2 Ne jamais fabriquer du contenu pour remplir le vide

Un état vide ne doit jamais être rempli artificiellement avec :

- un faux historique ;
- de faux résultats ;
- de fausses statistiques ;
- de fausses recommandations ;
- des actions que l’utilisateur n’a jamais effectuées ;
- des informations présentées comme personnalisées alors qu’elles ne reposent sur aucune donnée réelle.

**Le vide est préférable à une information fictive.**

Cette règle découle directement du principe fondamental de Vitalis :

> **Pas d’événement réel → pas d’historique → pas de personnalisation comportementale.**

## 8.3 L’état vide doit expliquer la situation

L’utilisateur doit comprendre immédiatement pourquoi l’espace est vide.

Le message doit être :

- simple ;
- honnête ;
- contextualisé ;
- compréhensible sans explication supplémentaire.

Par exemple, Vitalis peut distinguer :

> Vous n’avez encore publié aucun Flash.

de :

> Aucun résultat pour cette recherche.

Ces deux situations ne représentent pas le même état et ne doivent donc pas produire la même expérience.

## 8.4 L’état vide doit proposer une action utile

Un état vide ne doit pas simplement constater l’absence de contenu.

Lorsque cela est pertinent, il doit permettre à l’utilisateur d’avancer vers une première action.

Exemples :

- aucun Flash → **Créer un Flash** ;
- aucun Scan effectué → **Lancer un Scan** ;
- aucun Radar configuré → **Créer un Radar** ;
- aucune activité → **Découvrir Vitalis** ou accéder directement à un moteur ;
- aucune notification → expliquer qu’aucune notification n’est actuellement disponible.

L’action proposée doit correspondre au contexte réel de l’écran.

## 8.5 L’action proposée dépend du contexte

Tous les états vides ne doivent pas utiliser le même message ou le même bouton.

Un état vide de Flash concerne la création.

Un état vide de Scan concerne l’absence de recherche ou l’absence de résultat.

Un état vide de Radar concerne l’absence de surveillance configurée.

Un état vide de notifications concerne l’absence d’événement générateur de notification.

L’état vide doit donc être **contextuel**, et non générique.

## 8.6 L’état vide évolue après une première action réelle

Dès qu’une action réelle est effectuée, l’état de l’écran doit évoluer.

Par exemple :

**Avant le premier Flash :**

> Vous n’avez encore publié aucun Flash.  
> Créez votre premier Flash.

**Après la publication :**

> Votre premier Flash est publié.

L’application ne doit plus présenter l’utilisateur comme s’il n’avait jamais effectué cette action.

Cette transition constitue une première étape de construction de l’historique réel.

## 8.7 Distinguer les différents types de vide

Vitalis doit notamment distinguer :

### A. Jamais utilisé

Aucune action n’a encore été effectuée.

> Aucun Scan n’a encore été effectué.

### B. Utilisé mais sans résultat

Une action réelle a été effectuée, mais elle n’a rien produit.

> Aucun résultat pour cette recherche.

Vitalis peut alors proposer d’élargir les critères ou une autre action pertinente.

### C. Temporairement indisponible

Les données existent potentiellement, mais ne peuvent momentanément pas être affichées.

Par exemple :

- connexion interrompue ;
- chargement en cours ;
- erreur temporaire ;
- service momentanément indisponible.

Ce cas ne doit jamais être présenté comme une absence de données.

## 8.8 L’état vide comme point de départ

L’état vide doit donc être considéré comme une **étape du parcours**, et non comme une anomalie.

Il permet à Vitalis de passer naturellement :

**absence d’action → proposition → action réelle → contexte → historique → continuité → personnalisation progressive.**

Cette logique évite de donner artificiellement l’impression que Vitalis connaît déjà l’utilisateur.

### Principe directeur

> **Le vide doit être honnête, compréhensible et utile. Il ne doit jamais être masqué par une personnalisation fictive.**