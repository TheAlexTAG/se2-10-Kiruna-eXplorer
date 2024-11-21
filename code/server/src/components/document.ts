/**
 * Represents a document in the database
*/
class Document {
    id: number;
    title: string;
    description: string;
    zoneID: number | null;
    latitude: number;
    longitude: number;
    stakeholders: string;
    scale: string;
    issuanceDate: string;
    type: string;
    language: string | null;
    pages: number | null;
    connections: number;
    attachment: string[];
    resource: string[];
    links: number[];

  
    /**
     * Creates a new instance of the Document class.
     * @param id ID of the document 
     * @param title title of the document 
     * @param icon URL of the document icon
     * @param description Description of the document
     * @param zoneID ID of the zone or null if it has latitude and longitude
     * @param latitude latitude of the document location or null if it has zone
     * @param longitude longitude of the document location or null if has zone
     * @param stakeholders stakeholders related to the document
     * @param scale scale of the document
     * @param issuanceDate date of issuance of the document
     * @param type type of the document
     * @param language language of the document
     * @param pages number of pages in the document
     * @param connections number of connections the document has
     * @param attachment list of attachment URLs related to the document
     * @param resource list of resource URLs related to the document
     * @param links the id of the documents linked to the actual document
    */
    constructor(id: number, title: string, description: string, zoneID: number | null, latitude: number, longitude: number,
        stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: number | null, connections: number, 
        attachment: string[] = [], resource: string[] = [], links: number[] = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.zoneID = zoneID;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stakeholders = stakeholders;
        this.scale = scale;
        this.issuanceDate = issuanceDate;
        this.type = type;
        this.language = language;
        this.pages = pages;
        this.connections= connections;
        this.attachment= attachment;
        this.resource= resource;
        this.links = links;
    }
}
    
export {Document};