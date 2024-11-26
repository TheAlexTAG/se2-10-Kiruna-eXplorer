import db from "../db/db";
import { WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";


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
}

export { DocumentDAO };