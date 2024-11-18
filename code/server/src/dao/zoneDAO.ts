import { Zone } from "../components/zone";
import db from "../db/db";
import { InternalServerError } from "../errors/link_docError";
import { ZoneError, InsertZoneError, ModifyZoneError } from "../errors/zoneError";


/* Sanitize input */
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

  getZone(id: number): Promise<Zone> {
    return new Promise<Zone>((resolve, reject) => {
      const sql= "SELECT * FROM zone WHERE zoneID=?";
      db.get(sql, [id], (err: Error | null, row: any) => {
        if(err){
          return reject(new InternalServerError(err.message));
        }
        if(!row){
          return reject(new ZoneError());
        }
        try {
          return resolve(ZoneDAO.createZone(+DOMPurify.sanitize(row.zoneID), DOMPurify.sanitize(row.coordinates)));

        } catch (error: any) {
          return reject(error);
        }
      }
     );
    }
   );
  };

  getAllZone(): Promise<Zone[]> {
    return new Promise<Zone[]>((resolve, reject) => {
      const sql= "SELECT * FROM zone";
      db.all(sql, [], (err: Error | null, rows: any) => {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        if (!rows || rows.length=== 0) {
          return reject(new ZoneError());
        }

        try {
          const zones: Zone[] = rows.map((row: any) => ZoneDAO.createZone(+DOMPurify.sanitize(row.zoneID), DOMPurify.sanitize(row.coordinates)));
          return resolve(zones);
        } catch (error) {
          return reject(error);
        }
      }
     );
    }
   );
  };

  /**
   * Retrieves the whole Kiruna area as a WKT polygon
   * @returns the wkt string of the Kiruna polygon
   * @throws MissingKirunaZoneError if the Kiruna area is not in the database
   * @throws generic error if the database query fails
  */
  getKirunaPolygon(): Promise<string> {
    return new Promise((resolve, reject) => {
      const sql = "SELECT coordinates FROM zone WHERE zoneID = 0";
      db.get(sql, [], (err: Error, row: any) => {
        if (err) reject(err);
        row ? resolve(row.coordinates) : resolve('')
      })
    })
  };

  insertKirunaPolygon(): Promise<boolean> {
    return new Promise<boolean>(function (resolve, reject) {
      const sql = "insert into zone(zoneID, coordinates) VALUES(0, 'POLYGON ((20.0884348 67.8795522, 20.0777938 67.8461752, 20.0959903 67.8137874, 20.1313601 67.8009557, 20.20173 67.789142, 20.2526948 67.780064, 20.3284129 67.8017275, 20.3586137 67.820848, 20.3775067 67.8372408, 20.3644607 67.8659746, 20.2542569 67.8805869, 20.2082529 67.8834303, 20.0884348 67.8795522))')";
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

  insertZone(coordinates: string): Promise<number> {
    return new Promise<number>(function (resolve, reject) {
      const sql = "insert into zone(coordinates) VALUES(?)";
      db.run(sql, [coordinates], function (err: Error | null) {
        if (err) {
          return reject(new InternalServerError(err.message));
        }

        if(this.lastID){
          return resolve(this.lastID);
        }

        return reject(new InsertZoneError());
      }
     );
    }
   );
  };

  countDocumentsInZone(zoneID: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const sql = "SELECT count(*) as tot FROM document WHERE zoneID=?";
      db.get(sql, [zoneID], (err: Error | null, row: any) => {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        if (row.tot === undefined) {
          return reject(new ZoneError());
        }
        return resolve(+DOMPurify.sanitize(row.tot));
      }
     );
    }
   );
  };

  modifyZone(zoneID: number, coordinates: string): Promise<boolean> {
    return new Promise<boolean>(function (resolve, reject) {
      const sql = "update zone set coordinates=? where zoneID=?";
      db.run(sql, [coordinates,zoneID], function (err: Error | null) {
        if (err) {
          return reject(new InternalServerError(err.message));
        }

        if(this.changes!== 1){
          return reject(new ModifyZoneError());
        }

        return resolve(true);
      }
     );
    }
   );
  };

}

export {ZoneDAO};