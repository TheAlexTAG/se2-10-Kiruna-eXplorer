/**
 * Represents an error with a zone.
*/
class ZoneError extends Error {
    code: number

    constructor() {
        super('Error with zone!');
        this.code = 404;
    }
}

export {ZoneError};