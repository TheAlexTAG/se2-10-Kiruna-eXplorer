import { lineArc } from "@turf/turf";
import { Document } from "../components/document";
import db from "../db/db";
import { DocumentNotFoundError, DocumentZoneNotFoundError } from "../errors/documentErrors";
import { param } from "express-validator";
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
    createDocumentNode(title: string, description: string, zoneID: number | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO document(documentID, title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages)
            VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            db.run(sql, [title, description, zoneID, latitude, longitude, stakeholders.replace(/\s*,\s*/g, ',').trim(), scale, issuanceDate, type, language, pages], function(this: any, err: Error) {
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
                COUNT(*) AS total_connections,
                GROUP_CONCAT(
                    CASE
                        WHEN l.firstDoc = d.documentID THEN l.secondDoc
                        ELSE l.firstDoc
                     END
                    ) AS linked_documents
                FROM link l
                JOIN document d ON l.firstDoc = d.documentID OR l.secondDoc = d.documentID
                GROUP BY d.documentID
                )
        SELECT d.documentID, 
            d.title,
            d.description, 
            d.zoneID, 
            d.latitude, 
            d.longitude, 
            d.stakeholders, 
            d.scale, 
            d.issuanceDate, 
            d.type, 
            d.language, 
            d.pages,
        COALESCE(lc.total_connections, 0) AS connections, 
        COALESCE(GROUP_CONCAT(DISTINCT r.link), '') AS resources,
        COALESCE(GROUP_CONCAT(DISTINCT a.link), '') AS attachments,
        COALESCE(lc.linked_documents, '') AS linked_document_ids
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
                        row.description,
                        row.zoneID, row.latitude,
                        row.longitude, row.stakeholders.replace(/\s*,\s*/g, ', ').trim(),
                        row.scale, row.issuanceDate,
                        row.type, row.language,
                        row.pages,
                        row.connections,
                        row.attachments ? row.attachments.split(",").map((url: string) => url.trim()): [],
                        row.resources ? row.resources.split(",").map((url: string) => url.trim()) : [],
                        row.linked_document_ids ? row.linked_document_ids.split(",").map((id: string) => parseInt(id.trim(), 10)) : []
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
 * Gets all the attachments links for the document, 
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
    getDocumentsFull(filters: any): Promise<Document[]> {
        return new Promise((resolve, reject) => {
            let sql = `WITH link_counts AS (
                SELECT d.documentID,
                COUNT(*) AS total_connections,
                GROUP_CONCAT(
                    CASE
                        WHEN l.firstDoc = d.documentID THEN l.secondDoc
                        ELSE l.firstDoc
                     END
                    ) AS linked_documents
                FROM link l
                JOIN document d ON l.firstDoc = d.documentID OR l.secondDoc = d.documentID
                GROUP BY d.documentID
                )
        SELECT d.documentID, 
            d.title,
            d.description, 
            d.zoneID, 
            d.latitude, 
            d.longitude, 
            d.stakeholders, 
            d.scale, 
            d.issuanceDate, 
            d.type, 
            d.language, 
            d.pages,
        COALESCE(lc.total_connections, 0) AS connections, 
        COALESCE(GROUP_CONCAT(DISTINCT r.link), '') AS resources,
        COALESCE(GROUP_CONCAT(DISTINCT a.link), '') AS attachments,
        COALESCE(lc.linked_documents, '') AS linked_document_ids
        FROM document d
        LEFT JOIN link_counts lc ON d.documentID = lc.documentID
        LEFT JOIN resource r ON d.documentID = r.documentID
        LEFT JOIN attachment a ON d.documentID = a.documentID
        `;
        const conditions: string[] = [];
        const params: any[] = [];
        if (filters.zoneID) {
            conditions.push("d.zoneID = ?");
            params.push(filters.zoneID);
        }
        if (filters.stakeholders) {
            conditions.push("d.stakeholders LIKE ?");
            params.push(`%${filters.stakeholders}%`);
        }
        if (filters.scale) {
            conditions.push("d.scale = ?");
            params.push(filters.scale);
        }
        if (filters.issuanceDate) {
            conditions.push("d.issuanceDate LIKE ?");
            params.push(`%${filters.issuanceDate}%`);
        }
        if (filters.type) {
            conditions.push("d.type = ?");
            params.push(filters.type);
        }
        if (filters.language) {
            conditions.push("d.language = ?");
            params.push(filters.language);
        }
        if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(" AND ")}`;
        }
        sql += ` GROUP BY d.documentID`;
            db.all(sql, params, (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let documents: Document[] = [];
                    if(rows) {
                        documents = rows.map((row: any) => new Document(
                            row.documentID,
                            row.title,
                            row.description,
                            row.zoneID, row.latitude,
                            row.longitude, row.stakeholders.replace(/\s*,\s*/g, ', ').trim(),
                            row.scale, row.issuanceDate,
                            row.type, row.language,
                            row.pages,
                            row.connections,
                            row.attachments ? row.attachments.split(",").map((url: string) => url.trim()): [],
                            row.resources ? row.resources.split(",").map((url: string) => url.trim()) : [],
                            row.linked_document_ids ? row.linked_document_ids.split(",").map((id: string) => parseInt(id.trim(), 10)) : []
                        ) )
                    }
                    resolve(documents); 
                }
            })
        })
    }


/**
 * Retrieves all the documents coordinates associated to their document id
 * @returns a list of id associated with coordinates (lon, lat)
 * @throws generic error if the database query fails
 */
    getAllDocumentsCoordinates(): Promise<{documentID: number, title: string, lon: number, lat: number}[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT documentID, title, longitude, latitude FROM document`
            db.all(sql, [], (err: Error, rows: any[]) => {
                if(err) reject(err);
                else {
                    let documents: {documentID: number, title: string, lon: number, lat: number}[] = [];
                    if(rows) documents = rows.map((row: any) => {return {documentID: row.documentID, title: row.title, lon: row.longitude, lat: row.latitude}});
                    resolve(documents);
                }
            })
        })
    }
/**
 * Deletes all the entries of the document table
 * @returns a void promise
 * @throws generic error if the database query fails
 */
    deleteAllDocuments(): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM document`
            db.run(sql, [], (err: Error) => {
                if(err) reject(err);
                else resolve();
            })
        }) 
    }
/**
 * DAO for updating the zone of a document
 * @param documentID the id of the document to modify
 * @param zoneID the id of the new zone
 * @param longitude random longitude of the new coordinates
 * @param latitude random latitude of the new coordinates
 * @returns the number of modified rows
 * @throws generic error if the database query fails
 */
    setDocumentZoneID(documentID: number, zoneID: number, longitude: number, latitude: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE document SET zoneID = ?, longitude = ?, latitude = ? WHERE documentID = ?`
            db.run(sql, [zoneID, longitude, latitude, documentID], function (this: any, err: Error) {
                if(err) reject(err);
                else resolve(this.changes);
            })
        })
    }
/**
 * 
 * @param documentID DAO for updating coordinates of a document
 * @param longitude longitude of the new coordinates
 * @param latitude latitude of the new coordinates
 * @returns the number of modified rows
 * @throws generic error if the database query fails
 */
    setDocumentLonLat(documentID: number, longitude: number, latitude: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE document SET zoneID = null, longitude = ?, latitude = ? WHERE documentID = ?`
            db.run(sql, [longitude, latitude, documentID], function(this: any, err: Error) {
                if(err) reject(err);
                else resolve(this.changes);
            })
        })
    }

    getDocumentZone(documentID: number): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT zoneID FROM document WHERE documentID = ?'
            db.get(sql, [documentID], (err: Error, row: any) => {
                if(err) reject(err);
                row ? resolve(row.zoneID) : resolve(-1);
            })
        })
    }


    shuffleCoordInsert(documents: {documentID: number, coordinates: {latitude: number, longitude: number}}[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION", (err: Error) => {
                    if(err) return reject(err);
                })
                const updatestmt = db.prepare(`
                UPDATE document 
                SET latitude = ?, 
                    longitude = ? 
                WHERE documentID = ?
                `)
                const updates = documents.map(doc => new Promise<void>((res, rej) => {
                    updatestmt.run(
                        doc.coordinates.latitude,
                        doc.coordinates.longitude,
                        doc.documentID,
                        (err: Error) => {
                            if(err) rej(err);
                            else res();
                        }
                    )
                }))
                Promise.all(updates)
                .then(() => updatestmt.finalize((err: Error) => {
                    if(err) return reject(err);
                    db.run("COMMIT", (cerr: Error) => {
                        if(err) return reject(cerr);
                        resolve(true);
                    })
                }))
                .catch((err: Error) => db.run("ROLLBACK", (rerr: Error) => {
                    if(rerr) return reject(rerr);
                    return reject(err);
                }))
            })
        })
    }


    /**
 * Creates a new resource for the specified document
 * @param documentID the id of the document to which belong the resource
 * @param link the link of the resource
 * @returns the id of the resource added
 * @throws generic error if the database query fails
 */
    addResource(documentID: number, link: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO resource (documentID, link) VALUES(?, ?)';
            db.run(sql, [documentID, link], function(this: any, err: Error) {
                if(err) 
                    reject(err);
                else 
                    resolve(this.lastID);
            })
        })
    }

}


export {DocumentDAO};