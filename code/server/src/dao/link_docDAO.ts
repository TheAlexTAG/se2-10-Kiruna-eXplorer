import { LinkDocument } from "../components/link_doc";
import db from "../db/db";
import { DocumentNotFoundError } from "../errors/documentErrors";
import { DocumentsError, InternalServerError } from "../errors/link_docError";

/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentDAO {

  getLink(firstDoc: number, secondDoc: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const sql = "SELECT * FROM link WHERE (firstDoc=? AND secondDoc=?) OR (firstDoc=? AND secondDoc=?)";
      db.get(sql, [firstDoc, secondDoc, secondDoc, firstDoc], (err: Error | null, row: any) => {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        if (!row) {
          return resolve(null);
        }
        return resolve(new LinkDocument(+DOMPurify.sanitize(row.firstDoc), +DOMPurify.sanitize(row.secondDoc), DOMPurify.sanitize(row.relationship)));
      }
      );
    }
    );
  };

  getDocumentConnections(documentID: number): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const sql = "SELECT count(*) as tot FROM link WHERE firstDoc=? OR secondDoc=?";
      db.get(sql, [documentID, documentID], (err: Error | null, row: any) => {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        if (row.tot === undefined) {
          return reject(new DocumentNotFoundError());
        }
        return resolve(+DOMPurify.sanitize(row.tot));
      }
      );
    }
    );
  };

  checkDocuments(first: number, secondDoc: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const sql = "SELECT count(*) as tot FROM document WHERE documentID=? OR documentID=?";
      db.get(sql, [first, secondDoc], (err: Error | null, row: any) => {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        const spy: number = +DOMPurify.sanitize(row.tot);

        if (spy === undefined) {
          return reject(new DocumentsError());
        }
        if (spy < 2) {
          return resolve(false);
        }
        return resolve(true);
      }
      );
    }
    );
  };

  insertLink(links: LinkDocument[]): Promise<boolean> {
    return new Promise<boolean>(function (resolve, reject) {
      const placeholders = links.map(() => "(?,?,?)").join();
      const sql = `insert into link(firstDoc, secondDoc, relationship) VALUES ${placeholders}`;
      const values= links.flatMap(link=> [link.firstDoc, link.secondDoc, link.relationship]);

      db.run(sql, values, async function (err: Error | null) {
        if (err) {
          return reject(new InternalServerError(err.message));
        }
        return resolve(true);
      }
     );
    }
   );
  };

}

export {LinkDocumentDAO};