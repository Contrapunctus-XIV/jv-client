---
title: Forums & Topics
---

## Forums et topics

La librairie rend également possible la récupération de données sur la partie forums du site. Elle utilise alors le site [jeuxvideo.com](https://www.jeuxvideo.com) et non pas l'API V4.

### Forums

Ce sont les espaces de discussion de JVC. Chaque forum possède un ID. 

> [!TIP]
> L'ID d'un forum est trouvable dans son URL : il s'agit de l'entier suivant le premier trait-d'union. Par exemple, l'ID du [18-25](https://www.jeuxvideo.com/forums/0-51-0-1-0-1-0-blabla-18-25-ans.htm) est `51`.

### Topics

Ce sont les fils de discussion qui sont postés sur un forum particulier par un utilisateur JVC. Chaque topic possède un ID que l'on peut trouver dans son URL.

> [!TIP]
> L'ID d'un topic est trouvable dans son URL : il s'agit de l'entier suivant le deuxième trait-d'union. Par exemple, l'ID de [ce topic](https://www.jeuxvideo.com/forums/42-51-69508478-1-0-1-0-moderation-ultime-pas-nous.htm) est `69508478`.

Les topics peuvent être « jaunes » (moins de 20 messages), « rouges » (20 messages ou plus), « résolus », « épinglés » (par la modération) ou « bloqués » (les membres ne peuvent plus poster dessus).

### Messages

Ce sont des contenus textuels qui sont postés par les utilisateurs de JVC sur un topic. Chaque message possède un ID que l'on peut trouver.

> [!TIP]
> L'URL d'un post correspond à la cible du lien situé dans l'en-tête du post dont le texte indique la date et l'heure auxquelles il a été pulié. 

### JVCode

Le `JVCode` est la syntaxe développé par l'équipe de JVC qui permet aux utiliseurs de styliser leurs messages (souligner, mettre en italique, faire des listes, etc.). La librairie fournit une classe statique capable de restituer le JVCode à l'origine du contenu HTML d'un message et vice-versa.

### Méthodes
*Les méthodes suivies d'une astérisque sont des [page scrapers](../scraping.md#page-scrapers).*

#### Classe `Forum`

Le constructeur de la classe `Forum` prend en argument l'ID du forum.

- {@link classes.Forum.getForumTitle | `Forum.getForumTitle`} renvoie le nom du forum
- {@link classes.Forum.getConnected | `Forum.getConnected`} renvoie le nombre actuel de connectés au forum
- {@link classes.Forum.readTopics | `Forum.readTopics`}* renvoie les topics postés sur le forum
- {@link classes.Forum.searchTopics | `Forum.searchTopics`}* renvoie les topics du forum correspondant aux termes de recherche (par titre ou par auteur)
- {@link classes.Forum.listen | `Forum.listen`} renvoie chaque nouveau topic détecté (générateur asynchrone)

#### Classe `Topic`

Le constructeur de la classe `Topic` prend en argument l'ID du topic.

- {@link classes.Topic.getInfos | `Topic.getInfos`} renvoie un objet contenant des informations sur le topic
- {@link classes.Topic.getForum | `Topic.getForum`} renvoie le forum auquel le topic appartient sous forme d'instance de la classe `Forum`
- {@link classes.Topic.getConnected | `Topic.getConnected`} renvoie le nombre actuel de connectés au topic
- {@link classes.Topic.read | `Topic.read`}* renvoie tous les posts appartenant au topic
- {@link classes.Topic.listen | `Topic.listen`} renvoie chaque nouveau post détecté (générateur asynchrone)
- {@link classes.Topic.getFirstPost | `Topic.getFirstPost`} renvoie une instance de `Post` représentant le post originel

#### Classe `Post`

Le constructeur de la classe `Post` prend en argument l'ID du message.

- {@link classes.Post.getInfos | `Post.getInfos`} renvoie un objet contenant des informations sur le message

> [!IMPORTANT]
> Cette méthode recquiert en argument un client connecté.

#### Classe statique `JVCode`

- {@link scrapers.JVCode.htmlToJVCode | `JVCode.htmlToJVCode`} renvoie une chaîne de caractères contenant la syntaxe JVCode qui est à l'origine du code HTML passé en entrée

### Exemples

Pour parcourir toutes les pages de topics du 18-25 :

```ts
const forum = new Forum(51);
for await (const page of forum.readTopics()) {
    console.log(page);
}
```

Pour parcourir toutes les pages du topic [TPMP](https://www.jeuxvideo.com/forums/42-51-74197187-1-0-1-0-tpmp-official-nobug.htm) : 
```ts
const topic = new Topic(74197187);
for await (const page of topic.read()) {
    console.log(page);
}
```

Pour afficher tous les nouveaux posts sur ce même topic :
```ts
const topic = new Topic(74197187);
for await (const post of topic.listen()) {
    console.log(post);
}
```