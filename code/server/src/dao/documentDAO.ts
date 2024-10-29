import { Document } from "../components/document";
import db from "../db/db";
/**
 * DAO for interactions with document table
 */
class DocumentDAO {
/**
 * Creates the document node in the document Table
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
    createDocumentNode(title: string, icon: string, description: string, zoneID: number | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO document(documentID, title, icon, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages)
            VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?, DATE(?), ?, ?, ?)`
            db.run(sql, [title, icon, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages], function(this: any, err: Error) {
                if(err) reject(err);
                else resolve(this.lastID);
            })
        })
    }
}


export {DocumentDAO};