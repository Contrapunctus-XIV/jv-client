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

- **v0.2.0** : correctif suivant la mise à jour de JVC de mai 2025, corrections de bogues, ajout de la page [*Notes de version*](./changelog.md) à la documentation
    * Adaptation de {@link classes.ForumClient.postTopic | `ForumClient.postTopic`} au nouveau formulaire de post de topics
    * Adaptation de {@link classes.ForumClient.postTopic | `ForumClient.postMessage`} au nouveau formulaire de post de messages
    * Correction d'une erreur dans la classe {@link classes.Forum | `Forum`} qui empêchait d'accéder aux résultats de la première page (pour {@link classes.Forum.readTopics | `Forum.readTopics`} et {@link classes.Forum.searchTopics | `ForumClient.searchTopics`})
    * Correction d'une erreur dans la fonction {@link classes.Alias.getID | `Alias.getID`} qui empêchait de renvoyer l'ID du compte si le client fourni était connecté à ce dernier
    * Correction de la fonction {@link utils.convertJVCStringToDate | `utils.convertJVCStringToDate`} qui renvoyait `undefined` pour certains formats de date non gérés
    * Retrait de la méthode `JVCode.jvCodeToHtml` suite à la mise à jour de la prévisualisation du JVCode dans les messages qui ne se fera plus par requêtes au serveur. Pas d'alternative envisagée
    * Modification de la fonction `curl` (dans `requests.ts`) afin de prendre en charge l'encodage `multipart/form-data` nécessaire à l'envoi du nouveau formulaire de post
    * Mise à jour des variables dans `vars.ts`
    * `undici 6.21.1` --> `undici 6.21.3` (mise à jour de sécurité)
- **v0.2.1** : modifications mineures de la documentation
- **v0.2.2** : modifications mineures de la documentation
- **v0.2.3** : correction d'une erreur dans la structure de la librairie qui empêchait l'utilisateur de bénéficier de son typage, modifications mineures de la documentation
- **v0.2.4** : exportation et documentation de deux fonctions, `callApi` et `curl`, qui étaient déjà implémentées et permettent d'envoyer des requêtes à l'API `v4` ainsi qu'au site JVC, ce qui peut être utile pour des développeurs qui souhaitent faire des requêtes personnalisées à ces services. Ajout de la page [*Fonctions diverses*](./other.md) et modifications mineures de la documentation.

## v0.3 (20/07/2025)
- **v0.3.0** : nouvelle classe {@link classes.NoelShack | `NoelShack`}, refonte des requêtes.
    * Ajout de la classe statique {@link classes.NoelShack | `NoelShack`} comportant deux méthodes publiques : {@link classes.NoelShack.upload | `upload`} et {@link classes.NoelShack.uploadMosaic | `uploadMosaic`} permettant de téléverser une image et d'en réaliser une mosaïque sur le site [NoelShack](https://www.noelshack.com/)
    * Refonte des fonctions du module {@link requests | `requests`} (remplacement de `curl` et `callApi` par {@link requests.request | `request`} et {@link requests.requestApi | `requestApi`})
    * Ajout d'une dépendance ([`sharp`](https://www.npmjs.com/package/sharp)) pour le traitement d'images nécessaire à la réalisation des mosaïques
    * Ajout de l'erreur {@link errors.ValueError | `ValueError`} signifiant que l'utilisateur a entré une valeur irrecevable en tant qu'argument d'une des fonctions de la librairie
    * Modification de la fonction {@link classes.Profile.setAvatar | `Profile.setAvatar`} qui accepte désormais en entrée aussi bien un chemin de fichier image qu'une URL d'image ou qu'un `Buffer` d'image
    * Modifications mineures de la documentation