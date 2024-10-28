import db from "../db/db";

/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentDAO {

    getDocumentConnections(documentID: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const sql = "SELECT count(*) as tot FROM link WHERE firstDoc=? OR secondDoc=?"
            db.get(sql, [documentID, documentID], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }
                if (!row || row.tot === undefined) {
                    return reject(new Error('Document not found!'));
                }
                return resolve(row.tot);
            }
          );
        }
      );
    }
}