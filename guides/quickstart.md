---
title: Installation
---

# Installation

## Pré-requis
Vous devez disposer des logiciels suivants :

- [Node.js](https://nodejs.org), version `20.18.3` ou `22` et plus.
- [cURL](https://curl.se/docs/manpage.html), version `8.10.1` ou plus

## Commande d'installation
Dans le terminal exécutez la commande :

```bash
npm install jv-client
```

## Importation
La librairie peut alors être utilisée ainsi :

```ts
import jv from "jv-client";
```

Les classes et fonctions exportées par la librairie sont documentées {@link index.JVClient | ici}.

> [!NOTE]
> Je vous recommande d'utiliser la librairie avec [TypeScript](https://www.typescriptlang.org/) (JavaScript avec le typage en plus) afin de bénéficier des annotations de types qui sont incluses avec.

## Contournement de Cloudflare

Les pages de JVC sont protégées par la [détection JavaScript](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/) de Cloudflare qui a pour objectif d'empêcher les requêtes qui ne proviennent pas d'un navigateur d'aboutir, en renvoyant des erreurs `403 Forbidden`. Si vous rencontrez ce genre d'erreurs lorsque vous utilisez les fonctions de la librairie, il convient de configurer votre session Cloudflare à l'aide de la méthode {@link requests.setupCloudflare | `setupCloudflare`} après son importation. Cette fonction prend en entrée deux valeurs, celle du cookie `cf_clearance` et celle du *user-agent* associé.

### Obtention du cookie `cf_clearance`
Pour obtenir la valeur de ce cookie, veuillez effectuer les étapes suivantes :
* Rendez-vous avec un navigateur sur n'importe quelle page JVC de profil, comme [celle-ci](https://www.jeuxvideo.com/profil/jv-client?mode=infos) ;
* Rechargez plusieurs fois de suite la page jusqu'à ce que le captcha Cloudflare apparaisse, puis résolvez-le ;
* Ouvrez les outils de développeur de votre navigateur ([méthode sur Chrome](https://support.google.com/campaignmanager/answer/2828688?hl=fr), [méthode sur Firefox](https://developer.mozilla.org/fr/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools)) puis rendez-vous dans l'onglet *Application* (sur Chrome) ou *Storage* (sur Firefox) ;
* Sélectionnez *Cookies* dans la barre latérale puis *jeuxvideo.com* dans le menu déroulant : vous accédez alors à la liste des cookies utilisés par JVC.
*  Copiez la valeur du cookie dont le nom est `cf_clearance`.

### Obtention du *user-agent*
* Rendez-vous sur [ce site](https://whatmyuseragent.com/) et copiez la valeur du *user-agent* qui s'affiche.

### Utilisation de `setupCloudflare`

Juste après l'importation de la librairie, appelez la fonction {@link requests.setupCloudflare | `setupCloudflare`} en fournissant le cookie `cf_clearance` puis le *user-agent*.

```ts
import jv from "jv-client";

jv.setupCloudflare("<CF_CLEARANCE>", "<USER_AGENT>");
```

> [!IMPORTANT]
> Il est nécessaire que l'adresse IP avec laquelle vous utilisez la librairie (celle qui sera à l'origine des requêtes vers JVC) soit la même que celle avec laquelle vous avez obtenu le cookie `cf_clearance`.