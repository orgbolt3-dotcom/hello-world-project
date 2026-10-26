# 13. Voix, texte et compréhension naturelle

Vitalis doit permettre à l’utilisateur d’exprimer une même intention de différentes manières, sans que le mode d’expression choisi ne modifie la nature du Flash.

La voix et le texte constituent donc deux portes d’entrée vers un même moteur de compréhension.

## 13.1 Une même intention, deux modes d’expression

Le texte et la voix ne doivent pas créer deux types différents de Flash.

Ils alimentent le même moteur de compréhension.

L’utilisateur peut ainsi :

- écrire son Flash ;
- parler son Flash ;
- commencer à la voix puis corriger au clavier ;
- commencer au clavier puis compléter à la voix.

Le changement de mode doit pouvoir se faire naturellement pendant la préparation du Flash.

## 13.2 La voix doit être transcrite puis comprise

Lorsqu’un utilisateur utilise la voix, Vitalis suit une chaîne de traitement :

**Voix → Transcription → Compréhension → Structuration → Validation**

La transcription constitue une étape intermédiaire.

L’objectif final n’est pas simplement de convertir la voix en texte, mais de comprendre l’intention exprimée et de la structurer de manière exploitable.

Vitalis doit ensuite présenter à l’utilisateur ce qu’il a compris.

## 13.3 La compréhension ne doit jamais devenir une invention

Vitalis doit distinguer clairement :

- une information explicitement exprimée ;
- une information comprise avec suffisamment de certitude ;
- une information ambiguë ;
- une information manquante.

Une information ambiguë ne doit jamais être transformée silencieusement en valeur certaine.

Par exemple :

> « Je cherche quelque chose de récent. »

ne doit pas automatiquement devenir :

> « Je cherche quelque chose datant de moins de deux ans. »

si l’utilisateur n’a jamais donné cette précision.

De la même manière, une expression comme :

> « pas trop cher »

ne doit pas être convertie automatiquement en un budget précis.

## 13.4 Une question à la fois

Lorsque Vitalis a besoin d’une précision pour continuer, il doit privilégier **une seule question utile à la fois**.

L’objectif est d’éviter de transformer une expression naturelle en formulaire complexe.

Par exemple :

> « Dans quelle zone souhaitez-vous chercher ? »

Après la réponse, Vitalis peut poser une autre question uniquement si une information supplémentaire est réellement nécessaire.

## 13.5 L’utilisateur peut corriger ce qu’il veut

Vitalis doit permettre une correction ciblée.

L’utilisateur ne doit pas être obligé de recommencer entièrement son Flash pour modifier une seule information.

Il doit pouvoir corriger notamment :

- la zone ;
- le budget ;
- la période ;
- la description ;
- la visibilité ;
- ou toute autre information comprise par Vitalis.

La correction doit modifier l’information concernée sans remettre inutilement en cause le reste du Flash.

## 13.6 La validation reste obligatoire avant publication

Même lorsque Vitalis comprend correctement l’intention, la publication ne doit pas être automatique.

Vitalis doit présenter une synthèse claire de ce qui a été compris et structuré.

L’utilisateur peut alors :

**Modifier → Vérifier → Publier**

ou revenir sur les éléments concernés avant de publier.

La validation constitue donc le dernier contrôle entre la compréhension de Vitalis et la publication réelle du Flash.

## 13.7 La compréhension peut être progressive

Vitalis ne doit pas chercher à obtenir toutes les informations dès le début.

Lorsqu’une information n’est pas nécessaire pour poursuivre, elle peut rester absente.

Le système doit demander une précision uniquement lorsqu’elle devient réellement utile à l’action envisagée.

Cette approche permet de conserver une interaction naturelle tout en évitant les questions inutiles.

## 13.8 Gestion des erreurs

La transcription ou la compréhension peut être incorrecte.

Vitalis doit donc permettre à l’utilisateur de :

- corriger ;
- reformuler ;
- reprendre la saisie ;
- basculer entre voix et texte.

Une erreur de transcription ou de compréhension ne doit jamais devenir une donnée utilisateur définitive sans validation.

### Principe directeur

> **La voix et le texte sont deux portes d’entrée vers le même moteur d’intention. Vitalis écoute, transcrit, comprend et structure, mais ne complète jamais silencieusement ce que l’utilisateur n’a pas exprimé. La publication reste soumise à la validation de l’utilisateur.**