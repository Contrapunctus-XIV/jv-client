---
title: Interaction connectée
children:
    - ./interacting/forums.md
    - ./interacting/profile.md
showGroups: true
---

# Interaction connectée — Introduction

La librairie fournit la classe {@link classes.Client | `Client`} qui représente une connexion à un compte JVC. Toutes les opérations nécessitant un compte connecté récupéreront le cookie de connexion stocké dans cette classe. L'instance connectée sera à passer en entrée du constructeur des classes {@link classes.V4Client | `V4Client`}, {@link classes.Profile | `Profile`} et {@link classes.ForumClient | `ForumClient`}.

Cette classe propose deux méthodes pour se connecter :
- {@link classes.Client.login | `Client.login`} qui prend en entrée un pseudo et un mot de passe.
> [!WARNING]
> JVC renvoie une erreur si trop de connexions sont effectuées dans un trop court délai.
- {@link classes.Client.injectConiunctio | `Client.injectConiunctio`} qui prend en entrée la valeur du cookie de connexion (le cookie `coniunctio`) utilisé par JVC.

> [!NOTE]
> Cette méthode est privilégiée car elle n'est pas sujette à un cooldown des serveurs de JVC.

> [!TIP]
> Vous pouvez trouver la valeur de votre cookie `coniunctio` dans les outils de développement de votre navigateur : par exemple [sur Firefox](https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/index.html) et [sur Chrome](https://developer.chrome.com/docs/devtools/application/cookies/). Elle est stockée dans l'attribut {@link classes.Client.session | `session`} de la classe `Client` après une connexion fructueuse, et renvoyée par la méthode {@link classes.Client.login | `Client.login`}.