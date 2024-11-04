import { Zone } from "../components/zone";
import db from "../db/db";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";

/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const wellknown = require('wellknown');

class ZoneDAO {

    getZone(id: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          const sql = "SELECT * FROM zone WHERE zoneID=?"
          db.get(sql, [id], (err: Error | null, row: any) => {
            if (err) {
              return reject(new InternalServerError(err.message));
            }
            if (!row) {
              return reject(new ZoneError());
            }
            return resolve(new Zone(+DOMPurify.sanitize(row.zoneID), DOMPurify.sanitize(row.zoneName), wellknown.parse(DOMPurify.sanitize(row.coordinates))));
          }
         );
        }
      );
    };

    getAllZone(): Promise<Zone[]> {
        return new Promise<Zone[]>((resolve, reject) => {
            const sql = "SELECT * FROM zone"
            db.all(sql, [], (err: Error | null, rows: any) => {
                const res: Zone[] = [];
                if (err) {
                    return reject(new InternalServerError(err.message));
                }
                if (!rows || rows.length === 0) {
                    return reject(new ZoneError());
                }

                for (let row of rows) {
                    res.push(new Zone(+DOMPurify.sanitize(row.zoneID), DOMPurify.sanitize(row.zoneName)));
                }
                return resolve(res);
            }
          );
        }
      );
    }   

}

export {ZoneDAO};