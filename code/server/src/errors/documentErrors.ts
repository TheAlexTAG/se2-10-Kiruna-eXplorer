class DocumentNotFoundError extends Error {
    code: number

    constructor() {
        super("Document not found");
        this.code = 404;
    }
}

class WrongGeoreferenceError extends Error {
    code: number

    constructor() {
        super("Wrong georeference format");
        this.code = 400;
    }
} 


class DocumentZoneNotFoundError extends Error {
    code: number

    constructor() {
        super("The zone inserted was not found")
        this.code = 404;
    }
}

class InvalidDocumentZoneError extends Error {
    code: number

    constructor() {
        super("The zone inserted is not valid")
        this.code = 400;
    }
}

export {DocumentNotFoundError, WrongGeoreferenceError, DocumentZoneNotFoundError, InvalidDocumentZoneError};