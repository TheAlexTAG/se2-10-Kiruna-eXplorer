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
export {ZoneError, MissingKirunaZoneError};