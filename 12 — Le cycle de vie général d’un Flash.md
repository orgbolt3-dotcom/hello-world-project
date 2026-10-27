# 12. Le cycle de vie général d’un Flash

Un Flash n’est pas simplement créé puis oublié. Il possède un cycle de vie qui représente son état réel depuis sa préparation jusqu’à son archivage.

Ce cycle permet à Vitalis de savoir à tout moment si un Flash est en préparation, disponible, temporairement suspendu, terminé ou archivé.

Le cycle général est :

**Brouillon → Validation → Planifié / Actif → Pause / Reprise → Clôturé → Archivé**

Tous les Flashs ne traversent pas nécessairement tous ces états.

## 12.1 Brouillon

Le Flash existe dans l’espace de l’utilisateur, mais il n’est pas encore publié.

Il peut être :

- complété ;
- corrigé ;
- structuré ;
- préparé à partir de texte ;
- préparé à partir de voix.

Un brouillon :

- n’est pas visible comme Flash actif ;
- ne doit pas apparaître comme une publication disponible ;
- ne doit pas générer de nouvelle mise en relation.

## 12.2 Validation

Avant publication, Vitalis présente à l’utilisateur ce qui a été compris et structuré.

L’utilisateur doit pouvoir :

- vérifier le contenu ;
- corriger les informations ;
- compléter les éléments nécessaires ;
- confirmer la formulation finale.

La publication n’intervient qu’après validation.

Cette étape garantit que le Flash publié correspond réellement à l’intention de son auteur.

## 12.3 Planifié ou actif

Après validation, un Flash peut être :

- publié immédiatement ;
- planifié pour une date ou une période explicitement définie.

Lorsqu’une date ou une période est réellement définie, Vitalis peut utiliser cette information pour gérer automatiquement l’activation et la fin du Flash.

En revanche :

> **Si aucune échéance n’a été donnée, Vitalis ne doit pas en inventer une.**

L’absence de date reste une information réelle et doit être respectée.

## 12.4 Pause et reprise

L’auteur peut suspendre temporairement un Flash lorsqu’il ne souhaite plus qu’il soit actif, sans vouloir nécessairement le clôturer.

Il peut ensuite le reprendre si son intention reste pertinente.

Une pause doit avoir un effet réel sur :

- la visibilité du Flash ;
- sa disponibilité ;
- les nouvelles actions qui peuvent lui être associées.

La reprise doit rétablir son état actif lorsque les conditions nécessaires sont réunies.

## 12.5 Clôture

Un Flash peut être clôturé :

- volontairement par son auteur ;
- automatiquement lorsque la période explicitement définie arrive à son terme ;
- selon une autre condition réelle prévue par le système.

Une fois clôturé :

- il n’est plus présenté comme actif ;
- il ne doit plus générer de nouvelles demandes de mise en relation ;
- son état doit être clairement identifiable.

La clôture constitue donc une transition réelle dans le cycle de vie du Flash.

## 12.6 Archivage

Après sa clôture, le Flash peut passer dans un état archivé.

L’archivage permet de conserver certaines informations utiles sans maintenir le Flash dans les espaces actifs de l’application.

Il constitue également une étape importante pour la future optimisation du stockage.

L’archivage ne signifie donc pas nécessairement suppression immédiate.

Les règles de conservation, d’allègement et de purge seront précisées séparément.

## 12.7 Modification d’un Flash actif

Un Flash actif peut évoluer lorsque son auteur souhaite modifier son contenu.

Une modification importante ne doit cependant pas être appliquée silencieusement.

Le parcours doit permettre :

**Modifier → Vérifier → Valider → Publier la nouvelle version**

L’objectif est de garantir qu’un Flash actif ne change pas de sens sans que son auteur ait clairement confirmé la nouvelle version.

## 12.8 Gestion des situations concurrentes

L’état réel du Flash doit toujours être vérifié au moment d’une action importante.

Par exemple, si un utilisateur demande une mise en relation au même moment où l’auteur clôt son Flash, l’application doit vérifier le statut réel du Flash côté serveur.

Si le Flash est déjà clôturé, la nouvelle demande ne doit pas être créée.

Vitalis doit donc se baser sur :

> **l’état réel au moment de l’action, et non sur une information d’interface devenue obsolète.**

Cette règle protège la cohérence du système même lorsque plusieurs actions se produisent presque simultanément.

### Principe directeur

> **Un Flash évolue selon un cycle de vie réel et traçable. Chaque transition doit correspondre à une action, une décision ou une condition réelle. Vitalis ne doit jamais présenter comme actif, disponible ou relationnel un Flash qui ne l’est plus.**