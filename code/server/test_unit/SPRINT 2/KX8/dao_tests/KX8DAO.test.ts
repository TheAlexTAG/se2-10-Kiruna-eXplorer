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

  // Test  `getDocumentsFull`
  describe('getDocumentsFull', () => {
    test('should return an empty array when no documents are found', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });
      const filters = {};
      const result = await dao.getDocumentsFull(filters);

      expect(result).toEqual([]);
    });

    test('should throw an error when the database query fails', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        callback(new Error('Database error'));
      });
      const filters = {};
      await expect(dao.getDocumentsFull(filters)).rejects.toThrow('Database error');
    });

    test('should return documents with all fields properly mapped', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        callback(null, [
          {
            documentID: 1,
            title: 'Test Document',
            description: 'A sample description',
            zoneID: 0,
            latitude: 10.5,
            longitude: 20.5,
            stakeholders: 'Stakeholder1,Stakeholder2',
            scale: '1:1000',
            issuanceDate: '01/01/2023',
            type: 'Policy',
            language: 'English',
            pages: 15,
            connections: 0,
          },
        ]);
      });

      const filters = {};
      const result = await dao.getDocumentsFull(filters);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        new Document(
          1,
          'Test Document',
          'A sample description',
          0,
          10.5,
          20.5,
          'Stakeholder1, Stakeholder2',
          '1:1000',
          '01/01/2023',
          'Policy',
          'English',
          15,
          0,
          [],
          [],
          []
        )
      );
    });

    test('should apply filters for stakeholders correctly', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        expect(sql).toContain('WHERE d.stakeholders LIKE ?');
        expect(params).toEqual(['%StakeholderA%']);
        callback(null, []);
      });

      const filters = { stakeholders: 'StakeholderA' };
      await dao.getDocumentsFull(filters);

      expect(db.all).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
    });

    test('should apply filters for issuanceDate correctly', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        expect(sql).toContain('WHERE d.issuanceDate LIKE ?');
        expect(params).toEqual(['%2023-01%']);
        callback(null, []);
      });

      const filters = { issuanceDate: '2023-01' };
      await dao.getDocumentsFull(filters);

      expect(db.all).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
    });

    test('should apply filters for scale correctly', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          expect(sql).toContain('WHERE d.scale = ?');
          expect(params).toEqual(['1:1000']);
          callback(null, []);
        });
      
        const filters = { scale: '1:1000' };
        await dao.getDocumentsFull(filters);
      
        expect(db.all).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      });
      
      test('should apply filters for language correctly', async () => {
        (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
          expect(sql).toContain('WHERE d.language = ?');
          expect(params).toEqual(['English']);
          callback(null, []);
        });
      
        const filters = { language: 'English' };
        await dao.getDocumentsFull(filters);
      
        expect(db.all).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
      });
      

    test('should apply multiple filters correctly', async () => {
      (db.all as jest.Mock).mockImplementationOnce((sql, params, callback) => {
        expect(sql).toContain('WHERE d.zoneID = ? AND d.type = ?');
        expect(params).toEqual(['ZoneA', 'Policy']);
        callback(null, []);
      });

      const filters = { zoneID: 'ZoneA', type: 'Policy' };
      await dao.getDocumentsFull(filters);

      expect(db.all).toHaveBeenCalledWith(expect.any(String), expect.any(Array), expect.any(Function));
    });

  });
});
