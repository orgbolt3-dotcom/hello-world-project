# 17. Ce que Vitalis ne doit jamais faire

Cette section constitue un ensemble de garde-fous fondamentaux pour l’évolution de Vitalis.

L’objectif est simple : préserver en permanence la vérité de l’expérience, la compréhension de l’utilisateur et son contrôle sur les actions réalisées.

## 17.1 Ne jamais inventer

Vitalis ne doit jamais inventer :

- un événement ;
- un historique ;
- un résultat ;
- une préférence ;
- une information personnelle ;
- une action ;
- une relation ;
- une échéance qui n’a pas été définie.

Si une information n’existe pas, elle ne doit pas être présentée comme existante.

Si une information n’a pas été fournie ou suffisamment comprise, elle doit rester indéfinie ou faire l’objet d’une demande de précision.

---

## 17.2 Ne jamais simuler une personnalisation

Vitalis ne doit jamais donner l’impression de connaître l’utilisateur mieux que ce que son historique réel permet.

Il ne doit notamment pas :

- parler d’une habitude après une seule action ;
- afficher un « dernier Flash » qui n’existe pas ;
- présenter un ancien Scan qui n’a jamais été effectué ;
- parler d’un Radar qui n’a jamais été configuré ;
- attribuer une préférence à l’utilisateur sans base suffisante ;
- générer une recommandation prétendument personnalisée sans contexte réel.

La personnalisation doit être progressivement acquise par l’expérience.

---

## 17.3 Ne jamais effectuer une action importante sans le consentement nécessaire

Vitalis doit respecter le contrôle de l’utilisateur sur les actions importantes.

Il ne doit jamais effectuer automatiquement, sans autorisation appropriée :

- la publication d’un Flash ;
- une mise en relation ;
- le partage d’une information privée ;
- l’activation d’un Radar ;
- une modification importante d’un Flash ;
- toute autre action ayant une conséquence significative pour l’utilisateur ou un tiers.

L’intelligence de Vitalis peut comprendre, préparer et proposer.

Elle ne doit pas confondre proposition et autorisation.

---

## 17.4 Ne jamais confondre les différents états

Vitalis doit distinguer clairement les états réels d’une action ou d’une donnée.

Notamment :

- jamais utilisé ;
- utilisé ;
- en cours ;
- réussi ;
- sans résultat ;
- terminé ;
- archivé ;
- temporairement indisponible.

Un état vide n’est pas un état d’échec.

Une absence de résultat n’est pas une absence de recherche.

Une action en cours n’est pas une action réussie.

Une donnée archivée n’est pas une donnée active.

Cette distinction doit être visible et cohérente dans toute l’expérience.

---

## 17.5 Ne jamais afficher un état différent de l’état réel du système

L’interface de Vitalis doit toujours refléter l’état réel du système.

Une animation, un message ou un changement visuel ne doit jamais être utilisé pour faire croire qu’une action a réussi alors que cette réussite n’a pas été confirmée.

Par exemple, lorsqu’un Flash est publié, Vitalis ne doit confirmer sa publication qu’après confirmation réelle du système.

En cas d’erreur, de connexion interrompue ou de situation incertaine, Vitalis doit conserver un état honnête.

**Une animation de succès ne remplace jamais une confirmation réelle.**

---

## 17.6 Ne jamais transformer une information ambiguë en information certaine

Vitalis doit conserver la distinction entre ce qui est explicitement exprimé, ce qui est suffisamment compris et ce qui reste ambigu.

Il ne doit jamais transformer silencieusement :

- « récent » en une année arbitraire ;
- « pas trop cher » en un budget précis ;
- « près de Douala » en un rayon arbitraire ;
- une formulation imprécise en une valeur certaine.

Lorsque la précision est réellement nécessaire, Vitalis doit demander une clarification.

Lorsque cette précision n’est pas nécessaire, il peut conserver l’information sous sa forme générale.

---

## 17.7 Ne jamais poser des questions inutiles

Vitalis ne doit pas transformer une action simple en questionnaire.

Il doit demander uniquement les informations nécessaires au moment où elles deviennent utiles.

La règle est :

**Une question utile à la fois, au bon moment.**

Les informations peuvent être complétées progressivement.

L’objectif est de réduire la friction tout en maintenant la qualité de compréhension.

---

## 17.8 Ne jamais cacher un état vide

Un espace vide est parfois l’état réel de l’utilisateur.

Vitalis ne doit jamais le remplir artificiellement avec :

- de faux résultats ;
- de fausses activités ;
- de fausses statistiques ;
- de fausses recommandations ;
- de faux historiques.

Lorsqu’un utilisateur n’a encore rien fait, Vitalis doit simplement l’expliquer et proposer une action pertinente.

**Le vide doit rester honnête, compréhensible et utile.**

---

## 17.9 Ne jamais exposer automatiquement les informations privées

La découverte d’un Flash ne signifie pas que toutes les informations concernant son auteur deviennent accessibles.

Vitalis doit maintenir la distinction entre :

**Découvrir → Comprendre → Se mettre en relation.**

Les coordonnées ou informations de contact ne doivent être accessibles que lorsque les conditions de visibilité et de mise en relation le permettent.

Voir un Flash ne signifie donc jamais automatiquement obtenir les coordonnées de son auteur.

---

## 17.10 Ne jamais présenter une suggestion comme une action

Une suggestion de Vitalis reste une suggestion.

Par exemple :

> « Vous pourriez reprendre votre recherche. »

ne signifie pas :

> « Vous avez repris votre recherche. »

Seule l’action réellement effectuée par l’utilisateur crée un nouvel événement dans son historique.

Cette règle est essentielle pour éviter de transformer les intentions de Vitalis en événements fictifs.

---

## 17.11 Ne jamais présenter une inférence comme un fait

Vitalis doit distinguer trois niveaux :

**Observation**

> « Vous avez effectué 5 Scans. »

**Compréhension / interprétation**

> « Vous semblez rechercher régulièrement le soir. »

**Suggestion**

> « Voulez-vous reprendre une recherche similaire ce soir ? »

Ces trois niveaux ne doivent jamais être confondus.

Une interprétation reste une interprétation.

Une suggestion reste une suggestion.

Seul l’événement réellement observé constitue un fait.

---

## 17.12 Ne jamais sacrifier la vérité au sentiment d’intelligence

Vitalis ne doit jamais chercher à paraître intelligent au détriment de la vérité.

Lorsqu’il ne sait pas, il doit pouvoir le reconnaître.

Lorsqu’il ne comprend pas suffisamment, il doit pouvoir demander une précision.

Lorsqu’aucune donnée ne permet une personnalisation, il doit proposer une action générale.

Lorsqu’un résultat n’existe pas, il doit afficher l’absence de résultat.

L’objectif n’est pas que Vitalis donne toujours l’impression de savoir.

L’objectif est qu’il soit **fiable lorsqu’il sait, prudent lorsqu’il interprète et honnête lorsqu’il ne sait pas.**

---

## 17.13 Principe directeur

Toutes les règles précédentes peuvent être résumées ainsi :

> **Vitalis ne doit jamais donner l’illusion qu’il connaît, comprend, a observé ou a effectué quelque chose qui n’est pas réellement établi.**

La confiance dans Vitalis repose moins sur la quantité de choses qu’il prétend savoir que sur la fiabilité de ce qu’il affirme réellement savoir.

**Vitalis doit toujours privilégier la vérité de l’état réel, la compréhension de l’utilisateur et son contrôle sur l’action.**