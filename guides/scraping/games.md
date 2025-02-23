---
title: Jeux vidéo
---

## Jeux vidéo

De nombreux jeux vidéo sont enregistrés auprès de la base de données de JVC. Les critères suivants permettent de les classifier :
- la ou les **machines** associées au jeu, représentées par ID (voir leur liste [ici](./config.md#machines)) ;
- le **genre** du jeu, qui est son thème (exemple : *Simulation de vol*), représenté par ID (voir leur liste [ici](./config.md#genres)) ;
- le **mode** du jeu, la manière dont il se joue (exemple : *Multi en local*), représenté par ID (voir leur liste [ici](./config.md#modes)).

Lorsqu'il s'agit de **sorties** de jeux à venir, ce seront les critères suivants :
- le **mois** de la sortie (entier commençant à 1)
- l'**année** de la sortie

### Avis

Les utilisateurs de JVC ont la possibilité de poster des avis sur les jeux vidéo comportant une notation et un commentaire.

> [!NOTE]
> Un avis posté sous un jeu vidéo ne concerne qu'**une seule machine**, renseignée par l'utilisateur.

### Méthodes

*Les méthodes suivies d'une astérisque sont des [page scrapers](../scraping.md#page-scrapers).*

#### Classe statique `V4`

- {@link scrapers.V4.getGames | `V4.getGames`}* renvoie les jeux vidéo répertoriés par JVC
- {@link scrapers.V4.getGamesReleases | `V4.getGamesReleases`}* renvoie les jeux attendus
- {@link scrapers.V4.searchGames | `V4.searchGames`}* renvoie les jeux correspondant aux termes de recherche

#### Classe `Game`

Représente un jeu vidéo. Le constructeur prend en argument l'ID du jeu.

- {@link classes.Game.getInfos | `Game.getInfos`} renvoie les informations du jeu
- {@link classes.Game.getDetails | `Game.getDetails`} renvoie des informations approfondies sur le jeu
- {@link classes.Game.getLightInfos | `Game.getLightInfos`} renvoie des informations génériques sur le jeu
- {@link classes.Game.getImages | `Game.getImages`} renvoie les liens des images associées au jeu
- {@link classes.Game.getReviewsStats | `Game.getReviewsStats`} renvoie des statistiques sur les avis utilisateurs
- {@link classes.Game.getNews | `Game.getNews`}* renvoie les actualités portant sur le jeu
- {@link classes.Game.getReviews | `Game.getReviews`}* renvoie les avis portant sur le jeu
- {@link classes.Game.getVideos | `Game.getVideos`}* renvoie les vidéos portant sur le jeu
- {@link classes.Game.getWikis | `Game.getWikis`}* renvoie les wikis portant sur le jeu

#### Classe `Review`

Représente un avis d'un utilisateur de JVC. Le constructeur prend en arguments l'ID de l'avis, le jeu (ID ou instance de `Game`) et l'ID de la machine concernée par l'avis.

- {@link classes.Review.getInfos | `Review.getInfos`} renvoie les informations de l'avis

#### Exemples
Pour afficher les pages de jeux de genre *Aventure* et de mode *Multi en local* jouables sur PC :

```ts
for await (const page of V4.getGames({ query: { machine: 10, mode: 3220, genre: 2200 }, raw: true })) {
    console.log(page);
}
```

Pour afficher les pages de sorties de jeux prévues pour janvier 2025 :
```ts
for await (const page of V4.getGamesReleases({ query: { month: 1, year: 2025 }, raw: true })) {
    console.log(page);
}
```