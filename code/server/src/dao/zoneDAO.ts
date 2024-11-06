import { Zone } from "../components/zone";
import db from "../db/db";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError } from "../errors/zoneError";
import { GeoJSON } from 'geojson';


/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const wellknown = require('wellknown');

class ZoneDAO {

    getZone(id: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
          const sql = "SELECT * FROM zone WHERE zoneID=?";
          db.get(sql, [id], (err: Error | null, row: any) => {
            if (err) {
              return reject(new InternalServerError(err.message));
            }
            if (!row) {
              return reject(new ZoneError());
            }
            const zoneName: string=  DOMPurify.sanitize(row.zoneName);
            const geoJson: GeoJSON = {
              type: "Feature",
              geometry: wellknown.parse(DOMPurify.sanitize(row.coordinates)),
              properties: {
                name: zoneName
              }
            };

            return resolve(new Zone(+DOMPurify.sanitize(row.zoneID),zoneName,geoJson));
          }
         );
        }
      );
    };

    getAllZone(): Promise<Zone[]> {
        return new Promise<Zone[]>((resolve, reject) => {
            const sql = "SELECT * FROM zone";
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
    
  /**
   * Retrieves the whole Kiruna area as a WKT polygon
   * @returns the wkt string of the Kiruna polygon
   * @throws MissingKirunaZoneError if the Kiruna area is not in the database
   * @throws generic error if the database query fails
  */
  getKirunaPolygon(): Promise<string> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT coordinates FROM zone WHERE zoneName = 'Kiruna municipal area'";
      db.get(sql, [], (err: Error, row: any) => {
        if (err) reject(err);
        row ? resolve(row.coordinates) : resolve('')
      })
    })
  }

  insertKirunaPolygon(): Promise<boolean> {
    return new Promise<boolean>(function (resolve, reject) {
      const sql = "insert into zone(zoneName,coordinates) VALUES('Kiruna municipal area','POLYGON((20.1570 67.8223, 20.1701 67.8223, 20.1900 67.8238, 20.2235 67.8280, 20.2235 67.8325, 20.2780 67.8372, 20.2780 67.8554, 20.2111 67.8516, 20.2111 67.8556, 20.1570 67.8223))')";
      db.run(sql, [], async function (err: Error | null) {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        if (this.lastID) {
          return resolve(true);
        }
        return resolve(false);
      }
     );
    }
   );
  };

}

export {ZoneDAO};