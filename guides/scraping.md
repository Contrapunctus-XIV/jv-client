---
title: Scraping
children:
    - ./scraping/contents.md
    - ./scraping/games.md
    - ./scraping/forums.md
    - ./scraping/accounts.md
    - ./scraping/config.md
showGroups: true
---

# Extraction de données — Introduction
Cette librairie permet d'automatiser la récupération de données portant sur les contenus hébergés sur la plateforme JVC. Il s'agit, entre autres, des articles, actualités, tests de jeu, vidéos, avis des utilisateurs, jeux vidéo, forums, topics, etc.

<div id="page-scrapers"></div>

## Fonctionnement des *page scrapers*
Les *page scrapers* sont des fonctions de la librairie destinées à la récupération de données hébergées sur JVC. Elles procèdent par itération sur les pages de résultats de la requête. Ce sont les fonctions de la classe statique {@link scrapers.V4 | `V4`}, certaines méthodes des classes {@link classes.Content | `Content`} et {@link classes.Game | `Game`} ou encore les fonctions {@link classes.Forum.readTopics | `Forum.readTopics`} et {@link classes.Topic.read | `Topic.read`}.

En effet, côté JVC, la présentation des données se fait par **pages** : par exemple, si l'on souhaite obtenir la liste de tous les jeux enregistrés sur JVC, on procédera par envoi de requêtes à **toutes** les pages répertoriant les jeux vidéo. C'est pourquoi j'ai fait le choix que le comportement par défaut des *page scrapers* serait de renvoyer un {@link !AsyncGenerator | `AsyncGenerator`} qui itérerait à la volée sur les pages de résultats.

### Syntaxe pour renvoyer des `AsyncGenerator`

Ainsi, la syntaxe de la requête décrite dans l'exemple ci-dessus est :

```ts
for await (const page of V4.getGames()) {
    console.log(page);
}
```

L'utilisateur peut en argument des *page scrapers* spécifier un ensemble de pages à traiter : c'est le paramètre optionnel `paging` qui contient la page de début, la page de fin (par défaut `null`) et le pas entre deux pages (par défaut 1).

```ts
for await (const page of V4.getGames({ paging: { begin: 5, end: 10, step: 2 } })) {
    console.log(page);
}
// seules les pages 5, 7 et 9 seront traitées
```

La valeur de `end` peut être `null` si l'on souhaite parcourir toutes les pages après `begin` jusqu'à la fin.

> [!NOTE]
> La numérotation des pages commence à 1.

### Syntaxe pour renvoyer des `Promise`
Il peut arriver que l'utilisateur n'ait besoin que de récupérer les résultats d'une page précise. Il peut alors renseigner le numéro de page grâce au paramètre optionnel `page` et il récupérera ainsi une {@link !Promise | `Promise`} :
```ts
console.log(await V4.getGames({ page: 2 }));
```

> [!IMPORTANT]
> Les paramètres `page` et `paging` s'excluent.

### Objets JSON ou instances ?

Lorsqu'il s'agit de récupérer des données, les *page scrapers* renvoient par défaut des instances des classes fournies par la librairie (comme {@link classes.Game | `Game`} dans l'exemple précédent). Mais il peut arriver que l'utilisateur n'ait besoin que de lire directement les données renvoyées par le site, sans passer par les classes de la librairie. Ainsi, il suffira de mettre à `true` le paramètre optionnel `raw` (booléen) :

```ts
for await (const page of V4.getGames({ raw: true })) {
    console.log(page); // page est un objet brut, renvoyé par JVC
}
```

Ici, `page` sera du type {@link types.V4Types.Games.Raw | `V4Types.Games.Raw`}.

### Query

Enfin, les *page scrapers* de la classe statique {@link scrapers.V4 | `V4`} contiennent un paramètre supplémentaire, le paramètre `query`, qui prend un objet associant aux critères de recherche appropriés la valeur souhaitée pour affiner les résultats.