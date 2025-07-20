---
title: Fonctionnalités diverses
---

# Fonctionnalités diverses

La présente librairie embarque un certain nombre d'autres fonctions et classes qui ne rentrent ni dans le domaine du *scraping* de données ni dans celui des interactions connectées spécifiquement.

## Utilitaires (module `utils`)
Les fonctions exportées par ce module sont :
- {@link utils.convertJVCStringToDate | `convertJVCStringToDate`} : convertit une date dans un des formats JVC à un objet {@link !Date | `Date`} (voir la documentation précise de la fonction pour une liste exhaustive des formats JVC pris en charge).
- {@link utils.isValidJVCText | `isValidJVCText`} : renvoie `true` si le message passé en entrée est postable sur les forums de JVC (c'est-à-dire qu'il ne contient que des caractères autorisés), `false` sinon.
- {@link utils.decodeJvCare | `decodeJvCare`} : renvoie le lien obtenu après décodage de la classe [`JvCare`](https://jvflux.fr/Fonctionnement_technique_de_Jeuxvideo.com#JvCare) passée en entrée (mécanisme d'obfuscation conçu par JVC afin de chiffrer les URL dans les documents HTML obtenus par requêtes automatisées)
- {@link utils.decodeAllJvCare | `decodeAllJvCare`} : décode toutes les classes `JvCare` présentes dans le document [`cheerio`](https://www.npmjs.com/package/cheerio) passé en entrée.

## Fonctions de requête (module `requests`)
Les fonctions exportées par ce module permettent aux utilisateurs d'envoyer des requêtes personnalisées aux services JVC. Elles sont :
- {@link requests.request | `request`} : effectue une requête à l'URL passée en entrée, avec les options spécifiées. Peut utiliser le logiciel [`cURL`](https://curl.se/docs/manpage.html) pour contourner les restrictions Cloudflare des serveurs JVC.
- {@link requests.requestApi | `requestApi`} : effectue une requête à l'*endpoint* de l'API `v4` passé en entrée, avec les options spécifiées.

## Classe `NoelShack`
La classe {@link classes.NoelShack | `NoelShack`} est une classe statique contenant deux méthodes qui permettent d'interagir avec le site d'hébergement d'images [NoelShack](https://www.noelshack.com/) utilisé sur les forums de JVC. Elles sont :
- {@link classes.NoelShack.upload} : téléverse sur NoelShack l'image passée en entrée.
- {@link classes.NoelShack.uploadMosaic} : réalise une mosaïque de l'image passée en entrée et la téléverse sur NoelShack.