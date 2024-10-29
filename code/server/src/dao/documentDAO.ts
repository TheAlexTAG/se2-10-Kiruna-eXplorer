import { Document } from "../components/document";
import db from "../db/db";
import { DocumentNotFoundError } from "../errors/documentErrors";
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
/**
 * Gets the full document given its id
 * @param documentID the id of the document to return
 * @returns the document object with zero connections
 * @throws generic error if the database query fails
 * @throws DocumentNotFoundError if the documentID is not presend into the database
 */
    getDocumentByID(documentID: number): Promise<Document> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM document WHERE documentID = ?`
            db.get(sql, [documentID], (err: Error, row: any) => {
                if(err) reject(err);
                else {
                    row ?
                    resolve(new Document(documentID, row.title, row.icon, row.description, row.zoneID, row.latitude, row.longitude, row.stakeholders, row.scale, row.issuanceDate, row.type, row.language, row.pages, 0))
                    : reject(new DocumentNotFoundError())
                }
            })
        })
    }
/**
 * Gets all the original resources links for the document
 * @param documentID the id of the document whose resources has to be returned
 * @returns an array of string representing the links of the resources
 * @throws generic error if the database query fails
 */
    getDocumentResources(documentID: number): Promise<String[]> {
        return new Promise ((resolve, reject) => {
            const sql = `SELECT link FROM resource WHERE documentID = ?`
            db.all(sql, [documentID], (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let resources: string[] = [];
                    if(rows) rows.forEach((row: any) => resources.push(row.link));
                    resolve(resources);
                }
            })
        })
    }
/**
 * Gets all the attachments links for the document
 * @param documentID the id of the document whose attachments has to be returned
 * @returns an array of string representing the links of the attachments
 * @throws generic error if the database query fails
 */
    getDocumentAttachments(documentID: number): Promise<String[]> {
        return new Promise ((resolve, reject) => {
            const sql = `SELECT link FROM attachment WHERE documentID = ?`
            db.all(sql, [documentID], (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let resources: string[] = [];
                    if(rows) rows.forEach((row: any) => resources.push(row.link));
                    resolve(resources);
                }
            })
        })
    }
}


export {DocumentDAO};