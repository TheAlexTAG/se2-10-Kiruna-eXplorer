import { LinkDocument, Relationship } from "../components/link_doc";
import db from "../db/db";
import { InternalServerError, LinkError, ModifyLinkError } from "../errors/link_docError";

/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentDAO {

  async checkLink(firstDoc: number, secondDoc: number, relationship: Relationship): Promise<LinkDocument | null> {
    let conn;

    try {
      conn= await db.getConnection();
      const sql = "SELECT * FROM link WHERE ((firstDoc=? AND secondDoc=?) OR (firstDoc=? AND secondDoc=?)) AND relationship=?";

      const row= await conn.query(sql, [firstDoc, secondDoc, secondDoc, firstDoc, relationship]);
      if(!row || row.length=== 0){
        return null;
      }
      return new LinkDocument(+DOMPurify.sanitize(row[0].linkID), +DOMPurify.sanitize(row[0].firstDoc), +DOMPurify.sanitize(row[0].secondDoc), DOMPurify.sanitize(row[0].relationship) as Relationship);
    
    } catch (err: any) {
      throw new InternalServerError();
    }
    finally {
      if (conn) {
        await conn.release();      
      }
    }
  };

  async getLink(id: number): Promise<LinkDocument | null>{
    let conn;

    try {
      conn= await db.getConnection();
      const sql = "SELECT * FROM link WHERE linkID=?";

      const row= await conn.query(sql, [id]);
      if(!row || row.length=== 0){
        return null;
      }
      return new LinkDocument(+DOMPurify.sanitize(row[0].linkID), +DOMPurify.sanitize(row[0].firstDoc), +DOMPurify.sanitize(row[0].secondDoc), DOMPurify.sanitize(row[0].relationship) as Relationship);
    
    } catch (err: any) {
      throw new InternalServerError();
    }
    finally {
      if (conn) {
        await conn.release();      
      }
    }
  };

  async getDocumentConnections(documentID: number): Promise<number> {
    let conn;

    try {
      conn= await db.getConnection();
      const sql = "SELECT count(*) as tot FROM link WHERE firstDoc=? OR secondDoc=?";

      const row= await conn.query(sql, [documentID, documentID]);
      if (!row || row.length=== 0) {
        throw new LinkError();
      }
      return +DOMPurify.sanitize(row[0].tot);

    } catch (err: any) {
      if(err instanceof LinkError){
        throw err; 
      }
      throw new InternalServerError();
    }
    finally{
      if (conn) {
        await conn.release();      
      }
    }
  };

  async checkDocuments(first: number, secondDoc: number): Promise<boolean> {
    let conn;

    try {
      conn= await db.getConnection();
      const sql = "SELECT count(*) as tot FROM document WHERE documentID=? OR documentID=?";

      const row= await conn.query(sql, [first, secondDoc]);
      const spy: number= +DOMPurify.sanitize(row[0].tot);
      
      if (spy < 2) {
        return false;
      }
      return true;

    } catch (err: any) {
      throw new InternalServerError();
    }
    finally{
      if (conn) {
        await conn.release();      
      }
    }
  };

  async insertLink(links: (number | Relationship)[][]): Promise<boolean> {
    let conn;

    try {
      conn= await db.getConnection();
      await conn.beginTransaction();
      
      await conn.batch("insert into link(firstDoc, secondDoc, relationship) VALUES (?,?,?)", links);
      await conn.commit();
      return true;

    } catch (err: any) {
      if (conn) {
        await conn.rollback();
      }
      throw new InternalServerError();
    }
    finally{
      if (conn) {
        await conn.release();      
      }
    }
  };

  async modifyLink(link: LinkDocument): Promise<LinkDocument> {
    let conn;

    try {
      conn = await db.getConnection();

      const res = await conn.query("update link set firstDoc=?, secondDoc=?, relationship=?  where linkID=?", [link.firstDoc, link.secondDoc, link.relationship, link.id]);
      if (!res || res.affectedRows !== 1) {
        throw new ModifyLinkError();
      }

      return link;

    } catch (err: any) {
      if (err instanceof ModifyLinkError) {
        throw err;
      }
      throw new InternalServerError();
    }
    finally {
      if (conn) {
        await conn.release();
      }
    }

  };
}

export {LinkDocumentDAO};