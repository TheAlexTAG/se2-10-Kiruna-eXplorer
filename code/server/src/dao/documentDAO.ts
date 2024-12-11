import db from "../db/db";
import { DocumentNotFoundError, WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";
import { Document, DocumentData, DocumentGeoData } from "../components/document";


class DocumentDAO {

    static async documentExists(documentID: number): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = `SELECT COUNT(*) AS count FROM document WHERE documentID = ?`
            const result = await conn.query(sql, [documentID]);
            return !!Number(result[0].count);
        } catch(err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async createDocumentNode(documentData: DocumentData, documentGeoData: DocumentGeoData): Promise<number> {
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();
            if(documentGeoData.coordinates) {
                let insResult = await conn.query("INSERT INTO zone(zoneID, coordinates) VALUES(null, ?)", [documentGeoData.coordinates]);
                documentGeoData.zoneID = insResult.insertId? insResult.insertId : null;
                if(!documentGeoData.zoneID) throw new ZoneError();
            }
            const sql = `INSERT INTO document(documentID, title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, parsedDate, type, language, pages)
            VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                documentData.title,
                documentData.description,
                documentGeoData.zoneID,
                documentGeoData.latitude,
                documentGeoData.longitude,
                documentData.stakeholders,
                documentData.scale,
                documentData.issuanceDate,
                documentData.parsedDate.toISOString().split("T")[0],
                documentData.type,
                documentData.language,
                documentData.pages
            ]
            const result = await conn.query(sql, params);
            await conn.commit();
            return Number(result.insertId);
        } catch (err: any) {
            await conn?.rollback();
            if(err instanceof ZoneError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async updateDocument(documentData: DocumentData, documentGeoData: DocumentGeoData): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();
            if(documentGeoData.coordinates) {
                let insResult = await conn.query("INSERT INTO zone(zoneID, coordinates) VALUES(null, ?)", [documentGeoData.coordinates]);
                documentGeoData.zoneID = insResult.insertId? insResult.insertId : null;
                if(!documentGeoData.zoneID) throw new ZoneError();
            }
            const sql = `UPDATE document SET zoneID = ?, longitude = ?, latitude = ? WHERE documentID = ?`;
            const result = await conn.query(sql, [documentGeoData.zoneID, documentGeoData.longitude, documentGeoData.latitude, documentData.documentID]);
            if(!result.affectedRows) throw new WrongGeoreferenceUpdateError();
            await conn.commit();
            return true;
        } catch (err: any) {
            await conn?.rollback();
            if(err instanceof ZoneError || err instanceof WrongGeoreferenceUpdateError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async getDocumentByID(documentID: number): Promise<Document> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = `
            SELECT 
                d.documentID,
                d.title,
                d.description,
                d.zoneID,
                d.latitude,
                d.longitude,
                d.stakeholders,
                d.scale,
                d.issuanceDate,
                d.parsedDate,
                d.type,
                d.language,
                d.pages,
                conn.connections,
                CASE 
                    WHEN COUNT(a.attachmentID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT('name', a.name, 'path', a.path))
                END AS attachment,
                CASE 
                    WHEN COUNT(r.resourceID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT('name', r.name, 'path', r.path))
                END AS resource,
                CASE 
                    WHEN COUNT(l.linkID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                        'linkID', l.linkID,
                        'documentID', l.linkedDocumentID,
                        'relationship', l.relationship
                    ))
                END AS links
            FROM document d
            LEFT JOIN (
                SELECT docID, COUNT(*) AS connections
                FROM (
                    SELECT firstDoc AS docID FROM link
                    UNION ALL
                    SELECT secondDoc AS docID FROM link
                ) sub
                GROUP BY docID
            ) conn ON d.documentID = conn.docID

            LEFT JOIN attachment a ON d.documentID = a.documentID

            LEFT JOIN resource r ON d.documentID = r.documentID

            LEFT JOIN (
                SELECT 
                    linkID,
                    firstDoc AS documentID,
                    secondDoc AS linkedDocumentID,
                    relationship
                FROM link
                UNION ALL
                SELECT 
                    linkID,
                    secondDoc AS documentID,
                    firstDoc AS linkedDocumentID,
                    relationship
                FROM link
            ) l ON d.documentID = l.documentID
            WHERE d.documentID = ?
            GROUP BY d.documentID`
            const result = await conn.query(sql, [documentID]);
            if(result.length === 0) throw new DocumentNotFoundError();
            return new Document(
                {
                    documentID: result[0].documentID,
                    title: result[0].title,
                    description: result[0].description,
                    stakeholders: result[0].stakeholders,
                    scale: result[0].scale,
                    issuanceDate: result[0].issuanceDate,
                    parsedDate: new Date(new Date(result[0].parsedDate).getTime() - (new Date(result[0].parsedDate).getTimezoneOffset() * 60000)),
                    type: result[0].type,
                    language: result[0].language,
                    pages: result[0].pages
                } as DocumentData,
                {
                    zoneID: (result[0].zoneID == null && result[0].latitude == null && result[0].longitude == null)? 0 : result[0].zoneID,
                    latitude: result[0].latitude,
                    longitude: result[0].longitude,
                }as DocumentGeoData,
                Number(result[0].connections),
                result[0].attachment || [],
                result[0].resource || [],
                result[0].links || []
            )
        } catch (err: any) {
            if (err instanceof DocumentNotFoundError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async getDocsWithFilters(filters: any): Promise<Document[]> {
        let conn;
        try{
            conn = await db.getConnection();
            let sql = `
            SELECT 
                d.documentID,
                d.title,
                d.description,
                d.zoneID,
                d.latitude,
                d.longitude,
                d.stakeholders,
                d.scale,
                d.issuanceDate,
                d.parsedDate,
                d.type,
                d.language,
                d.pages,
                conn.connections,
                CASE 
                    WHEN COUNT(a.attachmentID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT('name', a.name, 'path', a.path))
                END AS attachment,
                CASE 
                    WHEN COUNT(r.resourceID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT('name', r.name, 'path', r.path))
                END AS resource,
                CASE 
                    WHEN COUNT(l.linkID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(DISTINCT JSON_OBJECT(
                        'linkID', l.linkID,
                        'documentID', l.linkedDocumentID,
                        'relationship', l.relationship
                    ))
                END AS links
            FROM document d
            LEFT JOIN (
                SELECT docID, COUNT(*) AS connections
                FROM (
                    SELECT firstDoc AS docID FROM link
                    UNION ALL
                    SELECT secondDoc AS docID FROM link
                ) sub
                GROUP BY docID
            ) conn ON d.documentID = conn.docID

            LEFT JOIN attachment a ON d.documentID = a.documentID

            LEFT JOIN resource r ON d.documentID = r.documentID

            LEFT JOIN (
                SELECT 
                    linkID,
                    firstDoc AS documentID,
                    secondDoc AS linkedDocumentID,
                    relationship
                FROM link
                UNION ALL
                SELECT 
                    linkID,
                    secondDoc AS documentID,
                    firstDoc AS linkedDocumentID,
                    relationship
                FROM link
            ) l ON d.documentID = l.documentID
            `
            const conditions: string[] = [];
            const params: any[] = [];

            
            if (filters.zoneID != null) {
                if(filters.zoneID == 0) {
                    conditions.push("d.zoneID = ? AND d.latitude = ? AND d.longitude = ?");
                    params.push(null, null, null);
                }
                else {
                    conditions.push("d.zoneID = ?");
                    params.push(filters.zoneID);
                }  
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

            const result = await conn.query(sql, params);
            return result.map((row : any) => new Document(
                {
                    documentID: row.documentID,
                    title: row.title,
                    description: row.description,
                    stakeholders: row.stakeholders,
                    scale: row.scale,
                    issuanceDate: row.issuanceDate,
                    parsedDate: new Date(new Date(row.parsedDate).getTime() - (new Date(row.parsedDate).getTimezoneOffset() * 60000)),
                    type: row.type,
                    language: row.language,
                    pages: row.pages
                } as DocumentData,
                {
                    zoneID: (row.zoneID == null && row.latitude == null && row.longitude == null)? 0 : row.zoneID,
                    latitude: row.latitude,
                    longitude: row.longitude,
                }as DocumentGeoData,
                Number(row.connections),
                row.attachment || [],
                row.resource || [],
                row.links || []
            ))
        } catch (err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async getStakeholders(): Promise<string[]> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = `
            SELECT DISTINCT TRIM(stakeholder) AS stakeholder
            FROM (
                SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(stakeholders, ',', n.n), ',', -1) AS stakeholder
                FROM document
                CROSS JOIN (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) n
                WHERE CHAR_LENGTH(stakeholders) - CHAR_LENGTH(REPLACE(stakeholders, ',', '')) >= n.n - 1
            ) AS stakeholderList
            WHERE stakeholder NOT IN ('LKAB', 'Municipality', 'Regional authority', 'Architecture firms', 'Citizens', 'Kiruna kommun')`
            const rows = await conn.query(sql, []);
            const response = rows.map((row: any) => row.stakeholder)
            return response;
        } catch (err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async updateDiagramDate(documentID: number, newParsedDate: string): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = `UPDATE document SET parsedDate = ? WHERE documentID = ?`;
            const result = await conn.query(sql, [newParsedDate, documentID]);
            if(result.affectedRows == 0) throw new Error("Failed to update the document date coordinates");
            return true;
        } catch (err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }

    async deleteAllDocuments(): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = "DELETE FROM document";
            await conn.query(sql, []);
            return true;
        } catch(err: any) {
            throw new InternalServerError(err.message? err.message : "")
        } finally {
            await conn?.release();
        }
    }

    async addResource(documentID: number, names: string[], paths: string[]): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            await conn.beginTransaction();
            const params = names.map((name, index) => [documentID, name, paths[index]]);
            const sql = "INSERT INTO resource (documentID, name, path) VALUES (?, ?, ?)";
            await conn.batch(sql, params);
            await conn.commit();
            return true;
        } catch(err: any) {
            await conn?.rollback();
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            await conn?.release();
        }
    }
}

export { DocumentDAO };