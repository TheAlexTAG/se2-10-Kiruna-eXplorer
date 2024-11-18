import { LinkDocumentDAO } from '../../dao/link_docDAO';
import { LinkDocument, Relationship } from '../../components/link_doc';
import db from '../../db/db';
import { DocumentNotFoundError } from '../../errors/documentErrors';
import { DocumentsError, InternalServerError, LinkError } from '../../errors/link_docError';

jest.mock('../../db/db', () => ({
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
    

    test('Should return null if there is no link between documents', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const result = await dao.getLink(1, 2);
      expect(result).toBeNull();
    });

    test('Should throw an InternalServerError on database error', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(dao.getLink(1, 2)).rejects.toThrow(InternalServerError);
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

    test('Should throw DocumentNotFoundError if document does not exist', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(null, { tot: undefined });
      });

      await expect(dao.getDocumentConnections(1)).rejects.toThrow(DocumentNotFoundError);
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

    test('Should throw InternalServerError on database error', async () => {
      (db.get as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(dao.checkDocuments(1, 2)).rejects.toThrow(InternalServerError);
    });
  });

  describe('insertLink', () => {
    test('It should insert a link between documents successfully', async () => {
      const firstDoc = 1;
      const secondDoc = 2;
      const relationship = 'Projection';

      (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      });

      const result = await dao.insertLink(firstDoc, secondDoc, relationship);
      expect(result).toEqual(new LinkDocument(firstDoc, secondDoc, relationship as Relationship));
    });

    test('Should throw LinkError if lastID is not defined', async () => {
      (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
        callback.call({}, null);
      });

      await expect(dao.insertLink(1, 2, 'Update')).rejects.toThrow(LinkError);
    });

    test('Should throw InternalServerError on database error', async () => {
      (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await expect(dao.insertLink(1, 2, 'Update')).rejects.toThrow(InternalServerError);
    });
  });
});
