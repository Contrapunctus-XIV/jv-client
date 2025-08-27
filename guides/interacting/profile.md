---
title: Profil
---

## Effectuer des opérations sur son profil JVC
### Classe `V4Client`
La classe {@link classes.V4Client | `V4Client`} permet de poster et de gérer des *reviews* (sous des jeux vidéo) et des commentaires (sous les contenus de la rédaction). Son constructeur prend en entrée une instance connectée de la classe {@link classes.Client | `Client`}.

Les fonctions fournies sont les suivantes :
* {@link classes.V4Client.addComment | `V4Client.addComment`} pour ajouter un commentaire sous un contenu
* {@link classes.V4Client.deleteComment | `V4Client.deleteComment`} pour supprimer un commentaire
* {@link classes.V4Client.updateComment | `V4Client.updateComment`} pour mettre à jour un commentaire
* {@link classes.V4Client.addReview | `V4Client.addReview`} pour ajouter un avis sous un jeu vidéo
* {@link classes.V4Client.deleteReview | `V4Client.deleteReview`} pour supprimer un avis

### Classe `Profile`
La classe {@link classes.Profile | `Profile`} permet de récupérer et de modifier des informations sur son profil public. Son constructeur prend en entrée une instance connectée de la classe {@link classes.Client | `Client`}.

- {@link classes.Profile.getFavoriteForums | `Profile.getFavoriteForums`} renvoie les forums favoris
- {@link classes.Profile.getFavoriteTopics | `Profile.getFavoriteTopics`} renvoie les topics favoris
- {@link classes.Profile.getFavoriteGames | `Profile.getFavoriteGames`} renvoie les topics favoris
* {@link classes.Profile.editFavoriteForums | `Profile.editFavoriteForums`}, {@link classes.Profile.editFavoriteTopics | `Profile.editFavoriteTopics`}, {@link classes.Profile.editFavoriteGames | `Profile.editFavoriteGames`} pour les modifier
* {@link classes.Profile.setAvatar | `Profile.setAvatar`} pour changer son avatar
* {@link classes.Profile.setDescription | `Profile.setDescription`} pour changer son description
* {@link classes.Profile.getForumPosts | `Profile.getForumPosts`} pour obtenir les posts du compte
> [!WARNING]
> Cette méthode utilise les pages de profil publiques de JVC qui sont sujettes à une limite de requêtes se situant à environ 3 par seconde. Il est donc recommandé d'utiliser une alternative dans le cas où un grand nombre de requêtes doivent être effectuées.
* {@link classes.Profile.getParams | `Profile.getParams`} pour obtenir les paramètres associés au profil JVC, obtensibles depuis l'icône *Réglages* de la page de profil (`/sso/infos_pseudo.php`)
* {@link classes.Profile.setParams | `Profile.setParams`} pour modifier un ou plusieurs de ces paramètres
* {@link classes.Profile.setSignature | `Profile.setSignature`} pour modifier la signature du compte
* {@link classes.Profile.isLevelLimitReached | `Profile.isLevelLimitReached`} pour savoir si le compte a atteint sa limite quotidienne de posts ou de topics