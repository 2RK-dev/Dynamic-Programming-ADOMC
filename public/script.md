# Script de Présentation — Dynamic Programming (10 min)

---

## SLIDE 1 — Titre (0:00 → 0:30)

> Bonjour à tous. Aujourd'hui on va parler de **Dynamic Programming** — ou programmation dynamique en français. C'est une des techniques les plus puissantes en algorithmique, et probablement celle qui fait le plus peur aux développeurs en entretien technique. Mon objectif : qu'à la fin de ces 10 minutes, vous compreniez le concept, la méthode, et que vous puissiez l'appliquer vous-mêmes.

*[→ slide suivante]*

---

## SLIDE 2 — C'est quoi le DP ? (0:30 → 1:30)

> Alors, c'est quoi le Dynamic Programming ? En une phrase : c'est une technique d'optimisation qui consiste à **décomposer un problème complexe en sous-problèmes plus simples**, et à **stocker les résultats** pour ne jamais recalculer la même chose deux fois.
>
> L'idée est simple : si je dois résoudre un gros problème, et que ce gros problème dépend de problèmes plus petits qui eux-mêmes reviennent plusieurs fois dans le calcul — alors je les résous une seule fois, je garde le résultat en mémoire, et je le réutilise.
>
> Petit point historique : le terme a été inventé par Richard Bellman dans les années 1950. Et attention, "programmation" ici n'a rien à voir avec le code — ça vient du sens mathématique de "planification". Bellman a choisi ce nom volontairement vague pour cacher ses travaux de recherche à son administration qui n'aimait pas la recherche fondamentale.

*[→ slide suivante]*

---

## SLIDE 3 — Deux propriétés essentielles (1:30 → 3:00)

> Pour qu'un problème soit résolvable par DP, il doit avoir **deux propriétés**. C'est le test fondamental.
>
> **Premièrement : la sous-structure optimale.** Ça veut dire que la solution optimale du problème global contient les solutions optimales des sous-problèmes. Prenez Fibonacci : F(5) dépend de F(4) et F(3). Et F(4) dépend lui-même de F(3) et F(2). Chaque sous-résultat est optimal en soi.
>
> **Deuxièmement : le chevauchement des sous-problèmes.** Regardez l'arbre de récursion de Fibonacci. Pour calculer F(5), on calcule F(3) deux fois, F(2) trois fois. C'est un gaspillage énorme. Si les sous-problèmes étaient tous uniques, le DP ne servirait à rien — c'est quand ils se répètent que le gain est massif.
>
> Ces deux propriétés sont votre checklist. Avant d'appliquer le DP à un problème, vérifiez qu'il les possède.

*[→ slide suivante]*

---

## SLIDE 4 — Top-Down vs Bottom-Up (3:00 → 4:30)

> Il y a deux façons d'implémenter le DP.
>
> **La mémoïsation, ou top-down.** On écrit la solution récursive naturelle, et on ajoute un cache. Quand on appelle `fib(5)`, ça appelle `fib(4)` et `fib(3)`. Si `fib(3)` est déjà dans le cache, on le renvoie directement. C'est intuitif parce qu'on pense au problème de haut en bas. Par contre, on a le coût de la pile de récursion.
>
> **La tabulation, ou bottom-up.** On construit la solution de manière itérative, en partant des cas de base. On remplit un tableau `dp` de gauche à droite, du plus petit sous-problème au plus grand. Pas de récursion, pas de pile. C'est souvent plus efficace en mémoire et plus rapide en pratique.
>
> Mon conseil : commencez par le top-down pour comprendre la récurrence, puis convertissez en bottom-up pour la production. C'est ce qu'on va voir dans la démo tout à l'heure.

*[→ slide suivante]*

---

## SLIDE 5 — 4 étapes pour résoudre (4:30 → 5:30)

> Voici la méthode en 4 étapes. C'est votre framework pour aborder tout problème DP.
>
> **Étape 1 : Identifier.** Est-ce que le problème me demande un optimum ? Un minimum, un maximum, un nombre de façons ? Est-ce que je vois des sous-problèmes qui se répètent ? Si oui, c'est probablement du DP.
>
> **Étape 2 : Définir l'état.** C'est la question la plus importante. Que représente `dp[i]` ? Pour Fibonacci, `dp[i]` c'est le i-ème nombre. Pour Coin Change, `dp[i]` c'est le nombre minimum de pièces pour faire le montant `i`. Bien définir l'état, c'est 80% du travail.
>
> **Étape 3 : La récurrence.** Comment `dp[i]` dépend des états précédents. C'est la formule mathématique au cœur de l'algorithme.
>
> **Étape 4 : Les cas de base.** Initialiser les valeurs connues. `dp[0] = 0`, `dp[1] = 1`, ou la première ligne d'une matrice. Sans ça, la récurrence n'a pas de point de départ.

*[→ slide suivante]*

---

## SLIDE 6 — Le gain est exponentiel (5:30 → 6:30)

> Et le résultat est spectaculaire. Prenez Fibonacci avec n = 40.
>
> L'approche récursive naïve fait **1.1 milliard d'appels**. Oui, un milliard. Parce que la complexité est O(2^n) — chaque appel se divise en deux.
>
> Avec le DP ? **40 opérations.** Linéaire. On passe d'exponentiel à linéaire. C'est pas un petit gain de performance — c'est la différence entre un programme qui prend 30 secondes et un qui prend quelques microsecondes.
>
> Le compromis est simple : on utilise de la **mémoire** — un tableau de taille n — pour gagner un temps de calcul colossal. C'est le trade-off fondamental du DP : espace contre temps.

*[→ slide suivante]*

---

## SLIDE 7 — Problèmes classiques (6:30 → 7:30)

> Voici les 6 problèmes classiques qu'on va visualiser. Ils couvrent les patterns fondamentaux du DP.
>
> **Fibonacci et Climbing Stairs** — les plus simples. Tableau 1D, récurrence directe. C'est par là qu'on commence pour comprendre le mécanisme.
>
> **Coin Change** — toujours du 1D, mais ici on introduit la notion de minimisation. `dp[i]` c'est le minimum de pièces pour atteindre le montant `i`.
>
> **Knapsack** — on passe au 2D. Deux dimensions : les objets et la capacité. À chaque étape, une décision binaire : je prends ou je ne prends pas.
>
> **LCS** — Longest Common Subsequence. Aussi en 2D, mais pour comparer deux chaînes de caractères. C'est utilisé par `git diff` par exemple.
>
> **Edit Distance** — le plus riche. Trois opérations possibles à chaque cellule : insérer, supprimer, remplacer. C'est ce qu'utilisent les correcteurs orthographiques.

*[→ slide suivante]*

---

## SLIDE 8 — Quand utiliser le DP ? (7:30 → 8:15)

> Dernière slide théorique : quand est-ce qu'on utilise le DP ?
>
> **Oui** quand : le problème demande un optimum — min, max, nombre de façons. Quand on voit des sous-problèmes qui se répètent. Et quand la solution récursive naïve est exponentielle.
>
> **Non** quand : le problème n'a pas de sous-structure optimale — par exemple, trouver le plus long chemin dans un graphe général, c'est NP-hard, le DP ne s'applique pas. Ou quand les sous-problèmes sont tous distincts — dans ce cas, divide-and-conquer suffit, pas besoin de mémoriser.
>
> En entretien technique, le signal que c'est du DP, c'est souvent les mots : "minimum", "maximum", "combien de façons", "est-ce possible".

*[→ slide suivante]*

---

## SLIDE 9 — Démonstration (8:15 → 8:30)

> Maintenant, voyons tout ça en action. J'ai construit un visualiseur interactif qui anime chaque algorithme étape par étape. On va voir exactement comment les tableaux se remplissent, quelles cellules sont consultées, et comment la solution émerge.

*[Ouvrir le navigateur sur localhost:3000]*

---

## DEMO LIVE (8:30 → 10:00)

### Demo 1 : Fibonacci (30s)

> On commence par le plus simple : Fibonacci. Je mets n = 8.
>
> *[Cliquer Start]*
>
> Regardez : chaque cellule se remplit de gauche à droite. Les deux cellules en jaune, ce sont les sources — `dp[i-1]` et `dp[i-2]`. La cellule en or, c'est celle qu'on calcule. Et en vert, c'est fait.
>
> Vous voyez littéralement la récurrence `dp[i] = dp[i-1] + dp[i-2]` se dérouler devant vos yeux. Aucun calcul n'est fait deux fois.

### Demo 2 : Coin Change (40s)

> *[Naviguer vers Coin Change]*
>
> Problème plus intéressant. J'ai les pièces 1, 5, et 7. Montant cible : 11.
>
> *[Cliquer Start]*
>
> Ici pour chaque montant, on teste chaque pièce. La cellule violette c'est la source `dp[i - coin]`. On prend le minimum. Regardez comment dp[10] = 2 (deux pièces de 5), et dp[11] = 3 (une pièce de 7 + deux pièces de... non, voyons la solution optimale à la fin).
>
> *[Attendre le backtracking]*
>
> Et voilà, le backtracking en rose nous montre les pièces choisies. C'est ça la puissance du DP : non seulement on trouve l'optimum, mais on peut reconstruire la solution.

### Demo 3 : Edit Distance (30s)

> *[Naviguer vers Edit Distance]*
>
> Le plus visuel : transformer "kitten" en "sitting". Combien d'opérations minimum ?
>
> *[Cliquer Start, vitesse rapide]*
>
> Le tableau 2D se remplit. Les trois couleurs correspondent aux trois opérations : rouge pour supprimer, bleu pour insérer, ambre pour le diagonal — remplacer ou match. À la fin, le chemin optimal est tracé, et on voit la séquence exacte d'opérations.
>
> La réponse : 3 opérations. Remplacer k→s, remplacer e→i, insérer g.

### Conclusion démo

> Voilà. Chaque algorithme suit le même pattern : définir l'état, appliquer la récurrence, remplir le tableau. Ce qui change, c'est la dimension et la logique de décision. Mais le mécanisme est toujours le même.

*[Revenir aux slides, dernière slide]*

---

## SLIDE 10 — Questions (10:00)

> Merci ! Si vous voulez pratiquer, LeetCode a une catégorie entière dédiée au DP — commencez par les Easy, puis montez progressivement. Et le visualiseur reste disponible pour expérimenter.
>
> Des questions ?

---

## NOTES POUR LE PRÉSENTATEUR

**Timing :**
- Slides théoriques : 8 min 15
- Demo live : 1 min 30
- Marge : 15s

**Conseils :**
- Parler lentement sur les slides 3 et 5 (concepts clés)
- Pendant la démo, pointer l'écran physiquement pour guider les yeux
- Si question complexe pendant la démo, proposer de tester en live après

**Backup si la démo plante :**
- Les slides contiennent déjà le code et les arbres de récursion
- On peut expliquer sur tableau blanc si nécessaire

**Si il reste du temps :**
- Montrer Knapsack (le plus visuel en 2D)
- Montrer LCS avec des mots connus ("ABCBDAB" et "BDCAB")
