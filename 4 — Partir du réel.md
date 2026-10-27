# 4. Partir du réel

L'un des principes fondamentaux de Vitalis est de construire son expérience à partir de ce qui est réellement connu.

Vitalis peut comprendre, interpréter et suggérer, mais il doit toujours distinguer les faits observés des interprétations qu'il peut en tirer.

## 4.1 L'événement réel

Un événement réel correspond à une action effectivement réalisée par l'utilisateur ou à un événement système effectivement produit.

Il peut notamment s'agir de :

- la publication d'un Flash ;
- l'exécution d'un Scan ;
- la configuration d'un Radar ;
- la fermeture d'un Flash ;
- la détection d'une correspondance réelle ;
- une demande de mise en relation réellement effectuée.

**Sans événement réel, Vitalis ne doit pas créer d'historique.**

## 4.2 L'historique

L'historique constitue la mémoire des événements réellement survenus.

Il permet à Vitalis de connaître ce que l'utilisateur a effectivement fait, et non ce que le système suppose qu'il pourrait faire ou apprécier.

Par exemple :

> L'utilisateur a effectué 3 Scans.

constitue une information historique réelle.

En revanche :

> L'utilisateur aime probablement rechercher le soir.

constitue une interprétation et ne doit pas être présenté comme un fait.

## 4.3 L'observation

Une observation décrit un fait établi à partir des données réellement disponibles.

Exemple :

> « Vous avez effectué 3 Scans cette semaine. »

Cette information peut être utilisée par Vitalis parce qu'elle repose sur des événements réels.

## 4.4 La compréhension et l'inférence

Vitalis peut analyser les événements réels afin de comprendre certains comportements ou besoins possibles.

Cependant, une compréhension ou une inférence ne doit jamais être présentée comme un fait certain lorsqu'elle ne l'est pas.

Par exemple :

**Observation :**  
Vous avez effectué plusieurs recherches dans cette zone.

**Compréhension possible :**  
Cette zone semble actuellement importante pour vos recherches.

**Suggestion :**  
Souhaitez-vous reprendre une recherche similaire ?

La progression doit donc rester identifiable :

**Fait → Compréhension → Suggestion.**

## 4.5 La personnalisation progressive

La personnalisation apparaît progressivement, à mesure que le contexte réel de l'utilisateur s'accumule.

Un nouvel utilisateur ne doit pas recevoir :

- un « dernier Flash » qu'il n'a jamais créé ;
- une « dernière recherche » qu'il n'a jamais effectuée ;
- une habitude qu'il n'a jamais démontrée ;
- une suggestion présentée comme personnalisée sans base réelle.

Au début, Vitalis propose simplement des actions possibles.

Lorsque des événements réels apparaissent, Vitalis peut faciliter la continuité de l'expérience.

Avec suffisamment de contexte, il peut ensuite proposer des suggestions plus personnalisées et explicables.

## 4.6 La règle fondamentale

Vitalis ne doit jamais simuler une relation avec l'utilisateur qui n'existe pas encore.

Lorsqu'aucun historique pertinent n'existe, Vitalis doit privilégier une proposition d'action plutôt qu'une personnalisation artificielle.

Il vaut mieux demander :

> « Que souhaitez-vous faire ? »

que présenter :

> « Voici ce que vous faites habituellement »

lorsqu'aucun historique réel ne permet de l'affirmer.

## 4.7 Principe général

La logique de Vitalis peut ainsi être résumée :

**Pas d'événement réel → pas d'historique.**  
**Pas d'historique → pas de personnalisation comportementale.**  
**Pas de personnalisation → proposer une action.**  
**Action réalisée → créer un contexte réel.**  
**Contexte accumulé → personnaliser progressivement.**

Cette règle constitue une base commune pour l'accueil, les moteurs Flash, Scan et Radar, les notifications, les suggestions et l'assistant.