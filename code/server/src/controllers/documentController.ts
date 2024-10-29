import { Document } from "../components/document";
import { DocumentDAO } from "../dao/documentDAO";
import { LinkDocumentDAO } from "../dao/link_docDAO";
/**
 * Controller for handling document operations
 */
class DocumentController {
    private dao: DocumentDAO
    constructor() {
        this.dao = new DocumentDAO
    }
/**
 * Hadles the comunication between the route and the dao of the document node creation
 * @param title the title of the document
 * @param icon url for the icon
 * @param description description of the document
 * @param zoneID the id of the zone georeferenced
 * @param latitude latitude of the node
 * @param longitude longitude of the node
 * @param stakeholders people participating on the document
 * @param scale It is the relationship between the dimensions drawn on a plan or architectural drawing and the actual dimensions of the building
 * @param issuanceDate the date in which the document has been issued
 * @param type document type
 * @param language document language
 * @param pages number of pages. Can also be an interval of pages
 * @returns the documentID of the lastly inserted document
 * @throws generic error if the database query fails
 */
    async createNode (title: string, icon: string, description: string, zoneID: number | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        try {
            let lastID = await this.dao.createDocumentNode(title, icon, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
            return lastID;
        }
        catch(err) {
            throw err;
        }
    }
}

export {DocumentController};