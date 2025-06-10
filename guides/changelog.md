---
title: Notes de version
---

# Notes de version

## v0.1 (23/02/2025)

- **v0.1.0** : première version
- **v0.1.2** : modifications mineures de la documentation
- **v0.1.3** : modifications mineures de la documentation
- **v0.1.4** : modifications mineures de la documentation
- **v0.1.5** : modifications mineures de la documentation
- **v0.1.6** : modifications mineures de la documentation
- **v0.1.7** : modifications mineures de la documentation

## v0.2 (10/06/2025)

- **v0.2.0** : correctif suivant la mise à jour de JVC de mai 2025, corrections de bogues, ajout de la page *Notes de version* à la documentation
    * Adaptation de {@link classes.ForumClient.postTopic | `ForumClient.postTopic`} au nouveau formulaire de post de topics
    * Adaptation de {@link classes.ForumClient.postTopic | `ForumClient.postMessage`} au nouveau formulaire de post de messages
    * Ajout de l'interface {@link types.JVCTypes.FormData | `JVCTypes.FormData`} qui correspond à ce nouveau formulaire
    * Correction d'une erreur dans la classe {@link classes.Forum | `Forum`} qui empêchait d'accéder aux résultats de la première page (pour {@link classes.Forum.readTopics | `Forum.readTopics`} et {@link classes.Forum.searchTopics | `ForumClient.searchTopics`})
    * Correction d'une erreur dans la fonction {@link classes.Alias.getID | `Alias.getID`} qui empêchait de renvoyer l'ID du compte si le client fourni était connecté à ce dernier
    * Correction de la fonction {@link utils.convertJVCStringToDate | `utils.convertJVCStringToDate`} qui renvoyait `undefined` pour certains formats de date non gérés
    * Retrait de la méthode `JVCode.jvCodeToHtml` suite à la mise à jour de la prévisualisation du JVCode dans les messages qui ne se fera plus par requêtes au serveur. Pas d'alternative envisagée
    * Modification de la fonction `curl` (dans `requests.ts`) afin de prendre en charge l'encodage `multipart/form-data` nécessaire à l'envoi du nouveau formulaire de post
    * Mise à jour des variables dans `vars.ts`
    * `undici 6.21.1` --> `undici 6.21.3` (mise à jour de sécurité)