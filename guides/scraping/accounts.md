---
title: Comptes
---

## Comptes

La librairie permet de récupérer des informations sur des comptes, en utilisant l'API V4 ou les pages de profil JVC.

### Depuis l'API V4 : la classe Account

La classe {@link classes.Account | `Account`} prend en entrée un ID de compte JVC.

- {@link classes.Account.getInfos | `Account.getInfos`} renvoie des informations sur le compte (alias, description, avatar, niveau, etc.)
- {@link classes.Account.getPage | `Account.getPage`} renvoie les reviews et contenus associés au compte, accessibles depuis sa page publique
- {@link classes.Account.getFavorites | `Account.getFavorites`} renvoie les jeux, topics et forums favoris du compte
- {@link classes.Account.isBanned | `Account.isBanned`} renvoie `true` si le compte est banni, `false` sinon

### Depuis la « carte de visite » JVC : la classe Alias

> [!WARNING]
> Les pages de profil publiques de JVC sont sujettes à une limite de requêtes se situant à environ 3 par seconde. Il est donc recommandé d'utiliser une alternative dans le cas où un grand nombre de requêtes doivent être effectuées. 

La classe {@link classes.Alias | `Alias`} prend en entrée un pseudo JVC.

- {@link classes.Alias.getInfos | `Alias.getInfos`} renvoie toutes les informations affichées sur la carte de visite
- {@link classes.Alias.getID | `Alias.getID`} renvoie l'ID du compte associé au pseudo
> [!IMPORTANT]
> Cette méthode recquiert en argument un client connecté.
- {@link classes.Alias.isBanned | `Account.isBanned`} renvoie `true` si le compte est banni, `false` sinon