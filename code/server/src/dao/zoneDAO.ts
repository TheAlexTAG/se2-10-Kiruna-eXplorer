import { Zone } from "../components/zone";
import db from "../db/db";
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
            conn = await db.pool.getConnection();
            const sql= "SELECT * FROM zone WHERE zoneID=?";
            const result: any = conn.query(sql, [id]);
            if(result.length === 0) throw new ZoneError();
            let zone = ZoneDAO.createZone(+DOMPurify.sanitize(result[0].zoneID), DOMPurify.sanitize(result[0].coordinates))
            return zone;
        } catch (err) {
            throw err;
        } finally {
            conn?.release();
        }
    }
}


export {ZoneDAO};