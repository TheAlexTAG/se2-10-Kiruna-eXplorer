import { Zone } from "../components/zone";
import db from "../db/db";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError, ModifyZoneError } from "../errors/zoneError";
import wellknown from 'wellknown';

import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { WrongGeoreferenceUpdateError } from "../errors/documentErrors";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);


class ZoneDAO {

    static createZone(id: number, coordinates: string): Zone{
      const geo= wellknown.parse(coordinates);
      if(!geo){
        throw new ZoneError(); // in this case geo= null;
      }
      
      return new Zone(id, geo);
    }

    async getZone(id: number): Promise<Zone> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql= "SELECT * FROM zone WHERE zoneID=?";
            const result = await conn.query(sql, [id]);
            if(!result || result.length === 0) throw new ZoneError();
            
            return ZoneDAO.createZone(+DOMPurify.sanitize(result[0].zoneID), DOMPurify.sanitize(result[0].coordinates));
        } catch (err: any) {
            if(err instanceof ZoneError) throw err;
            throw new InternalServerError(err.message ? err.message : "Error with the server!");
        } finally {
            if (conn) {
                await conn.release();      
            }
        }
    }

    static async zoneExistsCoord(coordinates: string): Promise<boolean> {
        let conn;
        try {
            conn = await db.getConnection();
            const sql = "SELECT COUNT(*) AS count FROM zone WHERE coordinates = ?"
            const result = await conn.query(sql, [coordinates]);
            return Number(result[0].count)? true : false;
        } catch(err: any) {
            throw new InternalServerError(err.message? err.message : "");
        } finally {
            if (conn) {
                await conn.release();      
            }
        }
    }

    async getAllZone(): Promise<Zone[]> {
        let conn;

        try {
            conn= await db.getConnection();
            const rows= await conn.query("SELECT * FROM zone");
            if(!rows || rows.length=== 0){
                throw new ZoneError();
            }
            const zones: Zone[]= rows.map((row: any) => ZoneDAO.createZone(+DOMPurify.sanitize(row.zoneID), DOMPurify.sanitize(row.coordinates)));
            return zones;
            
        } catch (err: any) {
            if(err instanceof ZoneError){
                throw err;
            }
            throw new InternalServerError(err.message ? err.message : "Error with the server!");
        }
        finally {
            if (conn) {
                await conn.release();      
            }
        }
    }

    async modifyZone(zoneID: number, coordinates: string, lat: number, long: number): Promise<boolean> {
        let conn;

        try {
            conn= await db.getConnection();
            await conn.beginTransaction();

            const res= await conn.query("update zone set coordinates=? where zoneID=?", [coordinates, zoneID]);
            if(!res || res.affectedRows!== 1){
                throw new ModifyZoneError();
            }

            const documentsUpdate= await conn.query("update document set latitude=?, longitude=? where zoneID=?", [lat, long, zoneID]);
            if(!documentsUpdate || !documentsUpdate.affectedRows){
                throw new WrongGeoreferenceUpdateError();
            }
            
            await conn.commit();
            return true;
            
        } catch (err: any) {
            if (conn) {
                await conn.rollback();
            }
            if(err instanceof ModifyZoneError || err instanceof WrongGeoreferenceUpdateError){
                throw err;
            }
            throw new InternalServerError(err.message ? err.message : "Error with the server!");
        }
        finally {
            if (conn) {
                await conn.release();      
            }
        }
    }

}


export {ZoneDAO};