---
title: Forums
---

## Interagir avec les forums JVC
### La classe `ForumClient`
La classe {@link classes.ForumClient | `ForumClient`} permet d'interagir avec les forums et topics de JVC. Son constructeur prend en entrée une instance connectée de la classe {@link classes.Client | `Client`}.

- {@link classes.ForumClient.postTopic | `ForumClient.postTopic`} pour poster un topic
- {@link classes.ForumClient.postMessage | `ForumClient.postMessage`} pour poster un message sur un topic
- {@link classes.ForumClient.up | `ForumClient.up`} permet de up un topic en supprimant les messages au fur et à mesure
- {@link classes.ForumClient.deletePost | `ForumClient.deletePost`} pour supprimer un message
- {@link classes.ForumClient.deleteTopic | `ForumClient.deleteTopic`} pour supprimer un topic
- {@link classes.ForumClient.toggleTopicResolution | `ForumClient.toggleTopicResolution`} passe un topic en résolu et vice-versa
- {@link classes.ForumClient.lockTopic | `ForumClient.lockTopic`} bloque un topic

### Exemple

Pour poster un message sur un topic puis le supprimer :

```ts
const client = new Client();
await client.injectConiunctio("<coniunctio>");
const forumClient = new ForumClient(client);
const topic = new Topic(75276105);

const post = await forumClient.postMessage(topic, "JVClient");
console.log(post);
await forumClient.deletePost(post);
```