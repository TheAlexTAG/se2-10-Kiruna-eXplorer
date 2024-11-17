/**
 * Represents an error with a zone.
*/
class ZoneError extends Error {
    code: number

    constructor() {
        super('Error with zone! Zone not found.');
        this.code = 404;
    }
}

class MissingKirunaZoneError extends Error {
    code: number;

    constructor() {
        super("Cannot find Kiruna main area")
        this.code = 404;
    }
}

class InsertZoneError extends Error{
    code: number;

    constructor() {
        super("Error during zone entry")
        this.code = 400;
    }
}

class DatabaseConnectionError extends Error {
    code: number

    constructor(message: string) {
        super(message);
        this.code = 503;
    }
}
export {ZoneError, MissingKirunaZoneError,DatabaseConnectionError,InsertZoneError};