import { Zone } from "../components/zone";
import db from "../db/db";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError, InsertZoneError, ModifyZoneError } from "../errors/zoneError";

const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const wellknown = require('wellknown');

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
            if(result.length === 0) throw new ZoneError();
            let zone = ZoneDAO.createZone(+DOMPurify.sanitize(result[0].zoneID), DOMPurify.sanitize(result[0].coordinates))
            return zone;
        } catch (err: any) {
            if(err instanceof ZoneError) throw err;
            else throw new InternalServerError(err.message? err.message : "")
        } finally {
            await conn?.release();
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
            await conn?.release();
        }
    }
}


export {ZoneDAO};