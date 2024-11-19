import { DocumentDAO } from '../../../../dao/documentDAO';
import db from '../../../../db/db';
import { Document } from '../../../../components/document';

jest.mock('../../../../db/db');

describe('DocumentDAO', () => {
  let dao: DocumentDAO;

  beforeAll(() => {
    dao = new DocumentDAO();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test  `addResource`
  describe('addResource', () => {
    test('should resolve with the last ID when the insertion is successfull', async () => {
      const mockLastID = 1; 
        (db.run as jest.Mock).mockImplementationOnce((sql, params, callback) => {
            callback.call({ lastID: mockLastID }, null); 
        });

        const documentID = 12; 
        const link = "https://www.example.com";

        const result = await dao.addResource(documentID, link);

        expect(result).toEqual(mockLastID);

        expect(db.run).toHaveBeenCalledWith('INSERT INTO resource (documentID, link) VALUES(?, ?)',
            [documentID, link],
            expect.any(Function));          
    });

    test('should reject with an error when the insertion fails', async () => {
        const mockError = new Error('Database insertion failed');

        (db.run as jest.Mock).mockImplementation((sql, params, callback) => {
            callback(mockError);
        });

        const documentID = 12;
        const link = 'http://example.com';

        await expect(dao.addResource(documentID, link)).rejects.toThrow('Database insertion failed');
        expect(db.run).toHaveBeenCalledWith(
            'INSERT INTO resource (documentID, link) VALUES(?, ?)',
            [documentID, link],
            expect.any(Function)
        ); 
    });
  });
});
