import { LinkDocumentDAO } from '../../../dao/link_docDAO';
import { LinkDocument, Relationship } from '../../../components/link_doc';
import db from '../../../db/db';
import { DocumentNotFoundError } from '../../../errors/documentErrors';
import { DocumentsError, InternalServerError, LinkError } from '../../../errors/link_docError';

jest.mock('../../../db/db', () => ({
  get: jest.fn(),
  run: jest.fn(),
}));

describe('LinkDocumentDAO', () => {
  let dao: LinkDocumentDAO;

  beforeEach(() => {
    dao = new LinkDocumentDAO();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLink', () => {

    test('Should return the link between the specified documents', async () => {
      const relationship: Relationship = Relationship.DIRECT;
      const link: LinkDocument = new LinkDocument(1,2, relationship);
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, {firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence'});
      });

      const result = await dao.getLink(1, 2);
      expect(result).toEqual(link);
      expect(db.get).toHaveBeenCalledTimes(1);
    });

    test('Should return null if there is no link between documents', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await dao.getLink(1, 2);
      expect(result).toBeNull();
      expect(db.get).toHaveBeenCalledTimes(1);
    });

    test('Should throw an InternalServerError on database error', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(dao.getLink(1, 2)).rejects.toThrow(InternalServerError);
      expect(db.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDocumentConnections', () => {
    test('Should return the number of connections for a document', async () => {
      const mockRow = { tot: 3 };
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await dao.getDocumentConnections(1);
      expect(result).toBe(3);
    });

    test('Should throw LinkError if there are no links for the specified document', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { tot: 0});
      });

      await expect(dao.getDocumentConnections(1)).rejects.toThrow(LinkError);
    });

    test('Should throw InternalServerError on database error', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(dao.getDocumentConnections(1)).rejects.toThrow(InternalServerError);
    });
  });

  describe('checkDocuments', () => {
    test('Should return true if both documents exist', async () => {
      const mockRow = { tot: 2 };
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await dao.checkDocuments(1, 2);
      expect(result).toBe(true);
    });

    test('Should return false if not all documents exist', async () => {
      const mockRow = { tot: 1 };
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const result = await dao.checkDocuments(1, 2);
      expect(result).toBe(false);
    });

    test('Should throw InternalServerError on database error', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(dao.checkDocuments(1, 2)).rejects.toThrow(InternalServerError);
    });
  });

  describe('insertLink', () => {
    test('It should insert a link between documents successfully', async () => {
      const link1: LinkDocument = new LinkDocument(1, 2, Relationship.COLLATERAL);
      const link2: LinkDocument = new LinkDocument(1, 3, Relationship.DIRECT);
      const links: LinkDocument[] = [link1, link2];
      (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const result = await dao.insertLink(links);
      expect(result).toEqual(true);
    });

    test('Should throw InternalServerError on database error', async () => {
      const link1: LinkDocument = new LinkDocument(1, 2, Relationship.COLLATERAL);
      const link2: LinkDocument = new LinkDocument(1, 3, Relationship.DIRECT);
      const links: LinkDocument[] = [link1, link2];
      (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await expect(dao.insertLink(links)).rejects.toThrow(InternalServerError);
    });
  });

});
