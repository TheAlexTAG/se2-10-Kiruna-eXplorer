import db from "../db/db";
import { DocumentNotFoundError, WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";
import { Document } from "../components/document";
import { param } from "express-validator";


class DocumentDAO {

    static async documentExists(documentID: number): Promise<boolean> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            const sql = `SELECT COUNT(*) AS count FROM document WHERE documentID = ?`
            const result = await conn.query(sql, [documentID]);
            return Number(result[0].count)? true : false;
        } catch(err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

    async createDocumentNode(title: string, description: string, zoneID: number | null, coordinates: string | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            await conn.beginTransaction();
            if(coordinates) {
                let insResult = await conn.query("INSERT INTO zone(zoneID, coordinates) VALUES(null, ?)", [coordinates]);
                zoneID = insResult.insertId? insResult.insertId : null;
                if(!zoneID) throw new ZoneError();
            }
            const sql = `INSERT INTO document(documentID, title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages)
            VALUES(null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const result = await conn.query(sql, [title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages]);
            await conn.commit();
            return Number(result.insertId);
        } catch (err: any) {
            conn?.rollback();
            if(err instanceof ZoneError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

    async updateDocumentGeoref(documentID: number, zoneID: number | null, coordinates: string | null, latitude: number | null, longitude: number | null): Promise<boolean> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            await conn.beginTransaction();
            if(coordinates) {
                let insResult = await conn.query("INSERT INTO zone(zoneID, coordinates) VALUES(null, ?)", [coordinates]);
                insResult.insertId ? zoneID = insResult.insertId : null;
                if(!zoneID) throw new ZoneError();
            }
            const sql = `UPDATE document SET zoneID = ?, longitude = ?, latitude = ? WHERE documentID = ?`;
            const result = await conn.query(sql, [zoneID, longitude, latitude, documentID]);
            if(!result.affectedRows) throw new WrongGeoreferenceUpdateError();
            console.log(result);
            await conn.commit();
            return true;
        } catch (err: any) {
            conn?.rollback();
            if(err instanceof ZoneError || err instanceof WrongGeoreferenceUpdateError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

    async getDocumentByID(documentID: number): Promise<Document> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            const sql = `
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
                COUNT(l.firstDoc) AS connections,
                CASE 
                    WHEN COUNT(a.attachmentID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('name', a.name, 'path', a.path))
                END AS attachment,
                CASE 
                    WHEN COUNT(r.resourceID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('name', r.name, 'path', r.path))
                END AS resource,
                CASE 
                    WHEN COUNT(l.secondDoc) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('documentID', l.secondDoc, 'relationship', l.relationship))
                END AS links
            FROM document d
            LEFT JOIN attachment a ON d.documentID = a.documentID
            LEFT JOIN resource r ON d.documentID = r.documentID
            LEFT JOIN link l ON d.documentID = l.firstDoc
            WHERE d.documentID = ?
            GROUP BY d.documentID`
            const result = await conn.query(sql, [documentID]);
            console.log(result[0]);
            if(result.length === 0) throw new DocumentNotFoundError();
            return new Document(
                result[0].documentID,
                result[0].title,
                result[0].description,
                (result[0].zoneID == null && result[0].latitude == null && result[0].longitude == null)? 0 : result[0].zoneID,
                result[0].latitude,
                result[0].longitude,
                result[0].stakeholders,
                result[0].scale,
                result[0].issuanceDate,
                result[0].type, 
                result[0].language,
                result[0].pages,
                Number(result[0].connections),
                result[0].attachment || [],
                result[0].resource || [],
                result[0].links || []
            )
        } catch (err: any) {
            if (err instanceof DocumentNotFoundError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

    async getDocsWithFilters(filters: any): Promise<Document[]> {
        let conn;
        try{
            conn = await db.pool.getConnection();
            let sql = `
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
                COUNT(l.firstDoc) AS connections,
                CASE 
                    WHEN COUNT(a.attachmentID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('name', a.name, 'path', a.path))
                END AS attachment,
                CASE 
                    WHEN COUNT(r.resourceID) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('name', r.name, 'path', r.path))
                END AS resource,
                CASE 
                    WHEN COUNT(l.secondDoc) = 0 THEN NULL
                    ELSE JSON_ARRAYAGG(JSON_OBJECT('documentID', l.secondDoc, 'relationship', l.relationship))
                END AS links
            FROM document d
            LEFT JOIN attachment a ON d.documentID = a.documentID
            LEFT JOIN resource r ON d.documentID = r.documentID
            LEFT JOIN link l ON d.documentID = l.firstDoc
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
            if (filters.pageSize && filters.pageNumber) {
                const pageNumber = parseInt(filters.pageNumber, 10);
                const pageSize = parseInt(filters.pageSize, 10);
                const offset = (pageNumber - 1) * pageSize;
                sql += ` LIMIT ? OFFSET ?`;
                params.push(pageSize, offset);
            }
            const result = await conn.query(sql, params);
            return result.map((row : any) => new Document(
                row.documentID,
                row.title,
                row.description,
                (row.zoneID == null && row.latitude == null && row.longitude == null) ? 0 : row.zoneID,
                row.latitude,
                row.longitude,
                row.stakeholders,
                row.scale,
                row.issuanceDate,
                row.type,
                row.language,
                row.pages,
                Number(row.connections),
                row.attachment || [],
                row.resource || [],
                row.links || []
            ))
        } catch (err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

    async deleteAllDocuments(): Promise<boolean> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            const sql = "DELETE FROM document";
            await conn.query(sql, []);
            return true;
        } catch(err: any) {
            throw new InternalServerError(err.message? err.message : "")
        } finally {
            conn?.release();
        }
    }

    async addResource(documentID: number, paths: string[]): Promise<boolean> {
        let conn;
        try {
            conn = await db.pool.getConnection();
            await conn.beginTransaction();
            //const params = names.map((name, index) => [documentID, name, links[index]]); for adding also names
            const params = paths.map((path: string) => [documentID, 'placeholdername', path])
            console.log(params);
            const sql = "INSERT INTO resource (documentID, name, path) VALUES (?, ?, ?)";
            await conn.batch(sql, params);
            await conn.commit();
            return true;
        } catch(err: any) {
            conn?.rollback();
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }
}

export { DocumentDAO };