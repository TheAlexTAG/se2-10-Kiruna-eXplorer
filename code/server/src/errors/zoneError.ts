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
    code: number

    constructor() {
        super("Cannot find Kiruna main area")
        this.code = 404;
    }
}

class DatabaseConnectionError extends Error {
    code: number

    constructor() {
        super('Error connecting to database');
        this.code = 503;
    }
}
export {ZoneError, MissingKirunaZoneError,DatabaseConnectionError};