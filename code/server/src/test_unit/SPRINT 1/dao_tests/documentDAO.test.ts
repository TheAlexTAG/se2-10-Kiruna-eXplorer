import { DocumentDAO } from '../../dao/documentDAO';
import db from '../../db/db';
import { DocumentNotFoundError } from '../../errors/documentErrors';
import { Document } from '../../components/document';

jest.mock('../../db/db');

describe('DocumentDAO', () => {
  let dao: DocumentDAO;

  beforeAll(() => {
    dao = new DocumentDAO();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test `createDocumentNode`
  describe('createDocumentNode', () => {
    test('should insert a document and return the last inserted ID', async () => {
      const mockLastID = 1;
      (db.run as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        callback.call({ lastID: 1 }, null);
      }); 

      const result = await dao.createDocumentNode(
        'Document Title', 'icon_url', 'Document Description', null, null, null,
        'Stakeholders', 'Scale', '2024-11-06', 'Type', 'en', '10'
      );

      expect(result).toBe(mockLastID);
    });

    test('should throw an error when insertion fails', async () => {
        (db.run as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(new Error('Database error')));

      await expect(dao.createDocumentNode(
        'Document Title', 'icon_url', 'Document Description', null, null, null,
        'Stakeholders', 'Scale', '2024-11-06', 'Type', 'en', '1-10'
      )).rejects.toThrow('Database error');
    });
  });

  // Test `getDocumentByID`
  describe('getDocumentByID', () => {
    test('should return a document when it exists', async () => {
      const mockDocument = new Document(1, 'Title', 'icon_url', 'Description', null, null, null, 'Stakeholders', 'Scale', '2024-11-06', 'Type', 'en', 10, 0, [], []);
      (db.get as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null, {
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
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null, null));

      await expect(dao.getDocumentByID(999)).rejects.toThrow(DocumentNotFoundError);
    });

    test('should throw a generic error when the query fails', async () => {
        (db.get as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(new Error('Database error')));

      await expect(dao.getDocumentByID(1)).rejects.toThrow('Database error');
    });
  });

  // Test `getDocumentResources`
  describe('getDocumentResources', () => {
    test('should return the document resources', async () => {
      const mockResources = ['resource1', 'resource2'];
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null, [
        { link: 'resource1' },
        { link: 'resource2' }
      ]));

      const result = await dao.getDocumentResources(1);

      expect(result).toEqual(mockResources);
    });

    test('should return an empty array if no resources are found', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null, []));

      const result = await dao.getDocumentResources(1);

      expect(result).toEqual([]);
    });

    test('should throw an error when the query fails', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(new Error('Database error')));

      await expect(dao.getDocumentResources(1)).rejects.toThrow('Database error');
    });
  });

  // Test `getDocumentAttachments`
  describe('getDocumentAttachments', () => {
    test('should return an array of attachment links when documents have attachments', async () => {
        const documentID = 1;
        const mockAttachments = ['https://example.com/attachment1', 'https://example.com/attachment2'];
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
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
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          callback(null, []); 
        });
    
        const result = await dao.getDocumentAttachments(documentID);
    
        expect(result).toEqual([]);  
      });
    
      test('should throw an error when the database query fails', async () => {
        const documentID = 1;
    
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database error'));  
        });
    
        await expect(dao.getDocumentAttachments(documentID)).rejects.toThrow('Database error');  
      });
  });

  // Test `getDocumentsTitles`
  describe('getDocumentsTitles', () => {
    test('should return a list of document titles', async () => {
      const mockTitles = [{ documentID: 1, title: 'Title' }];
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null, [{ documentID: 1, title: 'Title' }]));

      const result = await dao.getDocumentsTitles();

      expect(result).toEqual(mockTitles);
    });

    test('should throw an error when the query fails', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(new Error('Database error')));

      await expect(dao.getDocumentsTitles()).rejects.toThrow('Database error');
    });
  });

  // Test  `getDocumentsFull`
  describe('getDocumentsFull', () => {
    
      test('should return an empty array when no documents are found', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          callback(null, []);  
        });
    
        const result = await dao.getDocumentsFull();
    
        expect(result).toEqual([]);  
      });
    
      test('should throw an error when the database query fails', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          callback(new Error('Database error'));  
        });
    
        await expect(dao.getDocumentsFull()).rejects.toThrow('Database error');  
      });
  });

    // Test  `getAllDocumentsCoordinates`
    describe('getAllDocumentsCoordinates', () => {
        
          test('should throw an error when the database query fails', async () => {
            (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
              callback(new Error('Database error')); 
            });
        
            await expect(dao.getAllDocumentsCoordinates()).rejects.toThrow('Database error');
          });
      });

  // Test  `deleteAllDocuments`
  describe('deleteAllDocuments', () => {
    test('should delete all documents successfully', async () => {
      (db.run as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(null));

      await expect(dao.deleteAllDocuments()).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(expect.any(String), [], expect.any(Function));
    });

    test('should throw an error if the deletion fails', async () => {
        (db.run as jest.Mock).mockImplementationOnce((sql, params, callback) => callback(new Error('Database error')));

      await expect(dao.deleteAllDocuments()).rejects.toThrow('Database error');
    });
  });
});

