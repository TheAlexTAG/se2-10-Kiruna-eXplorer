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

class CoordinatesOutOfBoundsError extends Error {
    code: number

    constructor() {
        super("Coordinates out of bound")
        this.code = 400;
    }
}

class WrongGeoreferenceUpdateError extends Error {
    code: number

    constructor() {
        super("The georeference update is not valid")
        this.code = 400;
    }
}

class InvalidResourceError extends Error {
    code: number

    constructor() {
        super("Missing files or there is at least a file with an invalid name")
        this.code = 400;
    }
}


export {DocumentNotFoundError, WrongGeoreferenceError, DocumentZoneNotFoundError, InvalidDocumentZoneError, CoordinatesOutOfBoundsError, WrongGeoreferenceUpdateError, InvalidResourceError};