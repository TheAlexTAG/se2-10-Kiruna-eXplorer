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
      const sql = "insert into zone(zoneName,coordinates) VALUES('Kiruna municipal area','POLYGON ((20.0884348 67.8795522, 20.0777938 67.8461752, 20.0959903 67.8137874, 20.1313601 67.8009557, 20.20173 67.789142, 20.2526948 67.780064, 20.3284129 67.8017275, 20.3586137 67.820848, 20.3775067 67.8372408, 20.3644607 67.8659746, 20.2542569 67.8805869, 20.2082529 67.8834303, 20.0884348 67.8795522))')";
      db.run(sql, [], async function (err: Error | null) {
        if (err) {
          if(err.message.includes('UNIQUE constraint failed')){
            return resolve(false);
          }
          return reject(new InternalServerError(err.message));
        }
        return resolve(true);
      }
     );
    }
   );
  };

}

export {ZoneDAO};