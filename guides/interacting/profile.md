---
title: Profil
---

## Effectuer des opérations sur son profil JVC
### V4Client
La classe {@link classes.V4Client | `V4Client`} permet de poster et de gérer des *reviews* (sous des jeux vidéo) et des commentaires (sous les contenus de la rédaction). Son constructeur prend en entrée une instance connectée de la classe {@link classes.Client | `Client`}.

Les fonctions fournies sont les suivantes :
* {@link classes.V4Client.addComment | `V4Client.addComment`} pour ajouter un commentaire sous un contenu
* {@link classes.V4Client.deleteComment | `V4Client.deleteComment`} pour supprimer un commentaire
* {@link classes.V4Client.updateComment | `V4Client.updateComment`} pour mettre à jour un commentaire
* {@link classes.V4Client.addReview | `V4Client.addReview`} pour ajouter un avis sous un jeu vidéo
* {@link classes.V4Client.deleteReview | `V4Client.deleteReview`} pour supprimer un avis

### Profile
La classe {@link classes.Profile | `Profile`} permet de récupérer et de modifier des informations sur son profil public. Son constructeur prend en entrée une instance connectée de la classe {@link classes.Client | `Client`}.

* {@link classes.Profile.getFavorites | `Profile.getFavorites`} pour obtenir les jeux, forums et topics favoris
* {@link classes.Profile.editFavoriteForums | `Profile.editFavoriteForums`}, {@link classes.Profile.editFavoriteTopics | `Profile.editFavoriteTopics`}, {@link classes.Profile.editFavoriteGames | `Profile.editFavoriteGames`} pour les modifier
* {@link classes.Profile.setAvatar | `Profile.setAvatar`} pour changer son avatar
* {@link classes.Profile.setDescription | `Profile.setDescription`} pour changer son description
* {@link classes.Profile.getForumPosts | `Profile.getForumPosts`} pour obtenir les posts du compte
> [!WARNING]
> Cette méthode utilise les pages de profil publiques de JVC qui sont sujettes à une limite de requêtes se situant à environ 3 par seconde. Il est donc recommandé d'utiliser une alternative dans le cas où un grand nombre de requêtes doivent être effectuées.