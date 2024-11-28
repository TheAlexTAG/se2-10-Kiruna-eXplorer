import { DocumentDAO } from '../../../dao/documentDAO';
import db from '../../../db/db';
import { DocumentNotFoundError } from '../../../errors/documentErrors';
import { Document } from '../../../components/document';
import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";

const wellknown = require('wellknown');

jest.mock('../../../db/db.ts');

describe('DocumentDAO', () => {
  let dao: DocumentDAO;

  beforeAll(() => {
    dao = new DocumentDAO();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  // Test `createDocumentNode`
  describe("createDocumentNode", () => {
    
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test("It should register a new document", async () => { 
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            return callback.call({lastID: 1}, null);
        });

        const result = await dao.createDocumentNode('Document1', 'This is a sample description.', null,	67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');

        expect(result).toEqual(1);
        expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("It should return an InternalServerError if the db call fails", async () => {
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            return callback.call(null, new Error);
        });

        await expect(dao.createDocumentNode('Document1', 'This is a sample description.', null,	67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(Error);
        expect(db.run).toHaveBeenCalledTimes(1);
    });

});

  // Test `getDocumentByID`
  describe('getDocumentByID', () => {
    test('should return a document when it exists', async () => {
      const mockDocument = new Document(1, 'Title','Description', null, 68.33, 67.21, 'Stakeholders', 'Scale', '2024-11-06', 'Type', 'en', 10, 0, [], []);
      (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, {
        documentID: 1,
        title: 'Title',
        icon: 'icon_url',
        description: 'Description',
        zoneID: null,
        latitude: null,
        longitude: null,
        stakeholders: 'Stakeholders',
        scale: 'Scale',
        issuanceDate: '2024-11-06',
        type: 'Type',
        language: 'en',
        pages: 10,
        connections: 0,
        resources: '',
        attachments: ''
      }));

      const result = await dao.getDocumentByID(1);

      expect(result).toEqual(mockDocument);
    });

    test('should throw DocumentNotFoundError if the document does not exist', async () => {
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, null));

      await expect(dao.getDocumentByID(999)).rejects.toThrow(DocumentNotFoundError);
    });

    test('should throw a generic error when the query fails', async () => {
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(new Error('Database error')));

      await expect(dao.getDocumentByID(1)).rejects.toThrow('Database error');
    });
  });


  // Test `getDocumentResources`
  describe('getDocumentResources', () => {
    test('should return the document resources', async () => {
      const mockResources = ['resource1', 'resource2'];
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, [
        { link: 'resource1' },
        { link: 'resource2' }
      ]));

      const result = await dao.getDocumentResources(1);

      expect(result).toEqual(mockResources);
    });

    test('should return an empty array if no resources are found', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, []));

      const result = await dao.getDocumentResources(1);

      expect(result).toEqual([]);
    });

    test('should throw an error when the query fails', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(new Error('Database error')));

      await expect(dao.getDocumentResources(1)).rejects.toThrow('Database error');
    });
  });
  

  // Test `getDocumentAttachments`
  describe('getDocumentAttachments', () => {
    test('should return an array of attachment links when documents have attachments', async () => {
        const documentID = 1;
        const mockAttachments = ['https://example.com/attachment1', 'https://example.com/attachment2'];
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => {
          callback(null, [
            { link: 'https://example.com/attachment1' },
            { link: 'https://example.com/attachment2' }
          ]);
        });
    
        const result = await dao.getDocumentAttachments(documentID);
    
        expect(result).toEqual(mockAttachments);  
      });
    
      test('should return an empty array when no attachments are found for the document', async () => {
        const documentID = 1;
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => {
          callback(null, []); 
        });
    
        const result = await dao.getDocumentAttachments(documentID);
    
        expect(result).toEqual([]);  
      });
    
      test('should throw an error when the database query fails', async () => {
        const documentID = 1;
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => {
          callback(new Error('Database error'));  
        });
    
        await expect(dao.getDocumentAttachments(documentID)).rejects.toThrow('Database error');  
      });
  });


  // Test `getDocumentsTitles`
  describe('getDocumentsTitles', () => {
    test('should return a list of document titles', async () => {
      const mockTitles = [{ documentID: 1, title: 'Title' }];
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, [{ documentID: 1, title: 'Title' }]));

      const result = await dao.getDocumentsTitles();

      expect(result).toEqual(mockTitles);
    });

    test('should return an empty array if there are no documents', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, []));

      const result = await dao.getDocumentsTitles();

      expect(result).toEqual([]);
    });

    test('should throw an error when the query fails', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(new Error('Database error')));

      await expect(dao.getDocumentsTitles()).rejects.toThrow('Database error');
    });
  });

    // Test  `getAllDocumentsCoordinates`
  describe('getAllDocumentsCoordinates', () => {

    test('should return a list of objects with id, title and coordinates', async () => {
      const mockCoordinates = [{ documentID: 1, title: 'Title', lon: 68.33, lat: 67.43 }];
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, [{ documentID: 1, title: 'Title', longitude: 68.33, latitude: 67.43 }]));

      const result = await dao.getAllDocumentsCoordinates();

      expect(result).toEqual(mockCoordinates);
    });

    test('should return an empty list if there are no documents', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, []));

      const result = await dao.getAllDocumentsCoordinates();

      expect(result).toEqual([]);
    });

    test('should throw an error when the database query fails', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback: any) => {
        callback(new Error('Database error')); 
      });
  
      await expect(dao.getAllDocumentsCoordinates()).rejects.toThrow('Database error');
    });
  });


  // Test  `deleteAllDocuments`
  describe('deleteAllDocuments', () => {
    test('should delete all documents successfully', async () => {
      (db.run as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null));

      await expect(dao.deleteAllDocuments()).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(expect.any(String), [], expect.any(Function));
    });

    test('should throw an error if the deletion fails', async () => {
        (db.run as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(new Error('Database error')));

      await expect(dao.deleteAllDocuments()).rejects.toThrow('Database error');
    });
  });

  describe("setDocumentZoneID", () => {

    test("It update zoneID of a specified docuemnt", async () => { 
        jest.spyOn(db, "run").mockImplementation((sql, params, callback: any) => {
          return callback.call({changes: 1}, null);
        });

        const result = await dao.setDocumentZoneID(1, 3,	67.8525800000002, 20.3148144551419);

        expect(result).toEqual(1);
        expect(db.run).toHaveBeenCalledTimes(1);
    });

    test("It should return an InternalServerError if the db call fails", async () => {
        jest.spyOn(db, "run").mockImplementation((sql, params, callback: any) => {
            return callback.call(null, new Error);
        });

        await expect(dao.setDocumentZoneID(1, 3,	67.8525800000002, 20.3148144551419)).rejects.toThrow(Error);
        expect(db.run).toHaveBeenCalledTimes(1);
    });

    describe("setDocumentLonLat", () => {
  
      test("It update coordinated of a specified docuemnt", async () => { 
          jest.spyOn(db, "run").mockImplementation((sql, params, callback: any) => {
            return callback.call({changes: 1}, null);
          });
  
          const result = await dao.setDocumentLonLat(1,	67.8525800000002, 20.3148144551419);
  
          expect(result).toEqual(1);
          expect(db.run).toHaveBeenCalledTimes(1);
      });
  
      test("It should return an InternalServerError if the db call fails", async () => {
          jest.spyOn(db, "run").mockImplementation((sql, params, callback: any) => {
              return callback.call(null, new Error);
          });
  
          await expect(dao.setDocumentLonLat(1, 67.8525800000002, 20.3148144551419)).rejects.toThrow(Error);
          expect(db.run).toHaveBeenCalledTimes(1);
      });

    })

    describe('getDocumentZone', () => {
      test('should return the zoneId od a document', async () => {
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, {zoneID: 3 }));
  
        const result = await dao.getDocumentZone(1);
  
        expect(result).toEqual(3);
      });
  
      test('should return -1 if the specified document does not exist', async () => {
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(null, null));
  
        const result = await dao.getDocumentZone(1);
  
        expect(result).toEqual(-1);
      });
  
      test('should throw an error when the query fails', async () => {
          (db.get as jest.Mock).mockImplementationOnce((sql, params, callback: any) => callback(new Error('Database error')));
  
        await expect(dao.getDocumentZone(1)).rejects.toThrow('Database error');
      });
    });

  });

});

