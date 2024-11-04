import { Document } from "../components/document";
import db from "../db/db";
import { DocumentNotFoundError, DocumentZoneNotFoundError, MissingKirunaZoneError } from "../errors/documentErrors";
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
            const sql = `WITH link_counts AS (
                SELECT d.documentID,
                COUNT(*) AS total_connections
                FROM link l
                JOIN document d ON l.firstDoc = d.documentID OR l.secondDoc = d.documentID
                GROUP BY d.documentID)
            SELECT d.documentID, d.title, d.icon, d.description, d.zoneID, d.latitude, d.longitude, d.stakeholders, d.scale, d.issuanceDate, d.type, d.language, d.pages,
            COALESCE(lc.total_connections, 0) AS connections, 
            COALESCE(GROUP_CONCAT(DISTINCT r.link), '') AS resources,
            COALESCE(GROUP_CONCAT(DISTINCT a.link), '') AS attachments
            FROM document d
            LEFT JOIN link_counts lc ON d.documentID = lc.documentID
            LEFT JOIN resource r ON d.documentID = r.documentID
            LEFT JOIN attachment a ON d.documentID = a.documentID
            WHERE d.documentID = ?
            GROUP BY d.documentID`
            db.get(sql, [documentID], (err: Error, row: any) => {
                if(err) reject(err);
                else {
                    row ?
                    resolve(new Document(
                        documentID,
                        row.title,
                        row.icon,
                        row.description,
                        row.zoneID, row.latitude,
                        row.longitude, row.stakeholders,
                        row.scale, row.issuanceDate,
                        row.type, row.language,
                        row.pages,
                        row.connections,
                        row.attachments ? row.attachments.split(",").map((url: string) => url.trim()): [],
                        row.resources ? row.resources.split(",").map((url: string) => url.trim()) : []
                    ))
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
    getDocumentResources(documentID: number): Promise<string[]> {
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
    getDocumentAttachments(documentID: number): Promise<string[]> {
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
/**
 * Gets all document titles and their id for retrieving all the document
 * @returns an object representing the documentID and the title
 * @throws generic error if the database query fails
 */
    getDocumentsTitles(): Promise<{documentID: number, title: string}[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT documentID, title FROM document`
            db.all(sql, [], (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let titles: {documentID: number, title: string}[] = [];
                    if(rows) rows.forEach((row: any) => titles.push({documentID: row.documentID, title: row.title}));
                    resolve(titles);
                }
            })
        })
    }
/**
 * Retrieves all the documents in the database
 * @returns a list of documents
 * @throws generic error if the database query fails
 */
    getDocumentsFull(): Promise<Document[]> {
        return new Promise((resolve, reject) => {
            const sql = `WITH link_counts AS (
                SELECT d.documentID,
                COUNT(*) AS total_connections
                FROM link l
                JOIN document d ON l.firstDoc = d.documentID OR l.secondDoc = d.documentID
                GROUP BY d.documentID)
            SELECT d.documentID, d.title, d.icon, d.description, d.zoneID, d.latitude, d.longitude, d.stakeholders, d.scale, d.issuanceDate, d.type, d.language, d.pages,
            COALESCE(lc.total_connections, 0) AS connections, 
            COALESCE(GROUP_CONCAT(DISTINCT r.link), '') AS resources,
            COALESCE(GROUP_CONCAT(DISTINCT a.link), '') AS attachments
            FROM document d
            LEFT JOIN link_counts lc ON d.documentID = lc.documentID
            LEFT JOIN resource r ON d.documentID = r.documentID
            LEFT JOIN attachment a ON d.documentID = a.documentID
            GROUP BY d.documentID`
            db.all(sql, [], (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let documents: Document[] = [];
                    if(rows) {
                        documents = rows.map((row: any) => new Document(
                        row.documentID,
                        row.title,
                        row.icon,
                        row.description, row.zoneID,
                        row.latitude,
                        row.longitude,
                        row.stakeholders,
                        row.scale,
                        row.issuanceDate,
                        row.type,
                        row.language,
                        row.pages,
                        row.connections,
                        row.attachments ? row.attachments.split(",").map((url: string) => url.trim()): [],
                        row.resources ? row.resources.split(",").map((url: string) => url.trim()) : []
                        ))
                    }
                    resolve(documents); 
                }
            })
        })
    }

    getDocumentZoneCoordinates(zoneID: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT coordinates FROM zone WHERE zoneID = ?`
            db.get(sql, zoneID, (err: Error, row: any) => {
                if(err) reject(err);
                row ? resolve(row.coordinates) : reject(new DocumentZoneNotFoundError())
            })
        })
    }

    getKirunaPolygon(): Promise<string> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT coordinates FROM zone WHERE zoneName = 'Kiruna municipal area'`
            db.get(sql, [], (err: Error, row: any) => {
                if(err) reject(err);
                row ? resolve(row.coordinates) : reject(new MissingKirunaZoneError())
            })
        })
    }
}


export {DocumentDAO};