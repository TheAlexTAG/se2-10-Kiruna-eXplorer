/**
 * Represents a zone in the database
*/
class Zone {
    id: number; 
    name: string | null;
    coordinates: string; // well known text

    /**
     * Creates a new instance of the Zone class.
     * @param id ID of the zone 
     * @param name name of the zone 
     * @param coordinates coordinates of the zone expressed in well known text
    */ 
    constructor(id: number, name: string | null, coordinates: string= "") {
        this.id = id;
        this.name = name;
        this.coordinates= coordinates;
    }
}

export {Zone};