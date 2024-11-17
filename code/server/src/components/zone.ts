import { Geometry } from 'geojson';

/**
 * Represents a zone in the database
*/
class Zone {
    id: number; 
    coordinates: Geometry;

    /**
     * Creates a new instance of the Zone class.
     * @param id ID of the zone 
     * @param coordinates coordinates of the zone expressed in GeoJSON
    */ 
    constructor(id: number, coordinates: Geometry) {
        this.id = id;
        this.coordinates= coordinates;
    }
}

export {Zone};