/**
 * Represents an error with a link.
*/
class LinkError extends Error {
    code: number

    constructor() {
        super('Error with link!');
        this.code = 404;
    }
}

/**
 * Represents an error with a two Documents.
*/
class DocumentsError extends Error {
    code: number

    constructor() {
        super('Error with documents!');
        this.code = 409;
    }
}

/**
 * Represents a generic error in the db
*/
class InternalServerError extends Error {
    code: number

    constructor(message: string) {
        super(message);
        this.code = 500;
    }
}

class ModifyLinkError extends Error{
    code: number;

    constructor() {
        super("Error when editing the link")
        this.code = 409;
    }
}

class LinkNotFoundError extends Error {
    code: number

    constructor() {
        super('Error with link! Link not found.');
        this.code = 404;
    }
}

export {LinkError,DocumentsError,InternalServerError,ModifyLinkError,LinkNotFoundError};