import db from "../db/db";
import { DocumentNotFoundError, WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";
import { Document } from "../components/document";


class DocumentDAO {

    async createDocumentNode(title: string, description: string, zoneID: number | null, coordinates: number | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
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

    async updateDocumentGeoref(documentID: number, zoneID: number | null, coordinates: number | null, latitude: number | null, longitude: number | null): Promise<boolean> {
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
            if(result.length === 0) throw new DocumentNotFoundError();
            return new Document(
                result[0].documentID,
                result[0].title,
                result[0].description,
                result[0].zoneID,
                result[0].latitude,
                result[0].longitude,
                result[0].stakeholders,
                result[0].scale,
                result[0].issuanceDate,
                result[0].type, 
                result[0].language,
                result[0].pages,
                result[0].connections,
                JSON.parse(result[0].attachment || []),
                JSON.parse(result[0].resource || []),
                JSON.parse(result[0].links || [])
            )
        } catch (err: any) {
            if (err instanceof DocumentNotFoundError) throw err;
            else throw new InternalServerError(err.message? err.message : "");
        } finally {
            conn?.release();
        }
    }

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
}

export { DocumentDAO };