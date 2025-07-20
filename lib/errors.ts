/**
 * @module errors
 */

/**
 * Erreur indiquant que les serveurs de JVC ont renvoyé un code HTTP inattendu.
 * 
 * @class
 * @extends Error
 */
export class JvcResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "JvcResponseError";
        Object.setPrototypeOf(this, JvcResponseError.prototype);
    }
}

/**
 * Erreur indiquant qu'une instance de la classe {@link classes.Client | `Client`} n'était pas connectée à un compte JVC alors même qu'une opération
 * nécessitait qu'elle le soit.
 * 
 * @class
 * @extends Error
 */
export class NotConnected extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotConnected";
        Object.setPrototypeOf(this, NotConnected.prototype);
    }
}

/**
 * Erreur indiquant qu'un contenu quelconque n'existe pas.
 * 
 * @class
 * @extends Error
 */
export class InexistentContent extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InexistentContent";
        Object.setPrototypeOf(this, InexistentContent.prototype);
    }
}

/**
 * Erreur indiquant qu'un message d'erreur a été renvoyé par les serveurs de JVC.
 * 
 * @class
 * @extends Error
 */
export class JvcErrorMessage extends Error {
    constructor(message: string) {
        super(message);
        this.name = "JvcErrorMessage";
        Object.setPrototypeOf(this, JvcErrorMessage.prototype);
    }
}

/**
 * Erreur indiquant que l'utilisateur a entré une valeur invalide en tant qu'argument d'une fonction de la librairie.
 * 
 * @class
 * @extends Error
 */
export class ValueError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValueError";
        Object.setPrototypeOf(this, ValueError.prototype);
    }
}