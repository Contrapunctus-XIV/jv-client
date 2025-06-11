---
title: Installation
---

# Installation

## Pré-requis
Vous devez disposer des logiciels suivants :

- [Node.js](https://nodejs.org), version `20.18.3` ou `22` et plus.
- [cURL](https://curl.se/docs/manpage.html), version `8.10.1` ou plus

> [!IMPORTANT]
> Il est possible que la protection Cloudflare de jeuxvideo.com bloque toutes les requêtes provenant de votre machine tant que le challenge n'est pas résolu par l'utilisateur, en renvoyant notamment des erreurs `403`. Si lors de l'exécution des méthodes fournies par la librairie vous constatez ce type d'erreurs, une solution est d'installer et d'activer [**Cloudflare WARP**](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/download-warp/) sur la machine avant toute utilisation de la librairie. WARP agit comme un proxy qui fait passer les requêtes par le réseau Cloudflare, inscrit sur la *whitelist* de la protection anti-bot.

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