/**
 * Represents a document in the database
*/

interface Resource {
    name: string,
    path: string
}

interface Attachment {
    name: string,
    path: string
}

interface Link {
    documentID: number,
    title: string,
    relationship: string 
}

class Document {
    id: number;
    title: string;
    description: string;
    zoneID: number | null;
    latitude: number | null;
    longitude: number | null;
    stakeholders: string;
    scale: string;
    issuanceDate: string;
    type: string;
    language: string | null;
    pages: string | null;
    connections: number;
    nodeX: number | null;
    nodeY: number | null;
    attachment: Attachment[];
    resource: Resource[];
    links: Link[];

  
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
    constructor(documentData: DocumentData, documentGeoData: DocumentGeoData, connections: number, 
        attachment: Attachment[] = [], resource: Resource[] = [], links: Link[] = []) {
        this.id = documentData.documentID;
        this.title = documentData.title;
        this.description = documentData.description;
        this.zoneID = documentGeoData.zoneID;
        this.latitude = documentGeoData.latitude;
        this.longitude = documentGeoData.longitude;
        this.stakeholders = documentData.stakeholders;
        this.scale = documentData.scale;
        this.issuanceDate = documentData.issuanceDate;
        this.nodeX = documentData.nodeX;
        this.nodeY = documentData.nodeY;
        this.type = documentData.type;
        this.language = documentData.language;
        this.pages = documentData.pages;
        this.connections= connections;
        this.attachment= attachment;
        this.resource= resource;
        this.links = links;
    }
}

interface DocumentData {
    documentID: number,
    title: string,
    description: string,
    stakeholders: string,
    scale: string,
    issuanceDate: string,
    type: string,
    language: string | null,
    pages: string | null
    nodeX: number | null,
    nodeY: number | null,
}

interface DocumentEditData {
    documentID: number,
    title: string | null,
    description: string | null,
    stakeholders: string | null,
    scale: string | null,
    issuanceDate: string | null,
    type: string | null,
    language: string | null,
    pages: string | null,
    nodeX: number | null,
    nodeY: number | null,
}

interface DocumentGeoData {
    zoneID: number | null,
    coordinates: Array<[number, number]> | string | null,
    latitude: number | null,
    longitude: number | null
}

export {Document, DocumentData, DocumentEditData, DocumentGeoData};