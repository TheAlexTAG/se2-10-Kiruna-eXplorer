import { DocumentDAO } from '../../../src/dao/documentDAO';
import db from '../../../src/db/db';
import { DocumentNotFoundError, WrongGeoreferenceError } from '../../../src/errors/documentErrors';
import { Document } from '../../../src/components/document';
import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import { InternalServerError } from '../../../src/errors/link_docError';
import { ZoneError } from '../../../src/errors/zoneError';

const wellknown = require('wellknown');

jest.mock('../../../src/db/db.ts');

let dao: DocumentDAO;

const connMock: any= {
    query: jest.fn(),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    batch: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
};

describe('DocumentDAO', () => {

  beforeAll(() => {
    dao = new DocumentDAO();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("documentExist", () => {
    
    test("It return true if the document is in the db", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{count: 1}]);
        jest.spyOn(connMock, 'release');

        const result = await DocumentDAO.documentExists(2);

        expect(result).toBe(true);
    })

    test("It return false if the document is not in the db", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{count: 0}]);
        jest.spyOn(connMock, 'release');

        const result = await DocumentDAO.documentExists(2);

        expect(result).toBe(false);
    })

    test("It return an InternalServerError if the db calls return a generic error", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(DocumentDAO.documentExists(2)).rejects.toThrow(InternalServerError);
    })

    test("It return an InternalServerError if the db calls return a specific error", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(DocumentDAO.documentExists(2)).rejects.toThrow(InternalServerError);
    })
  })

  describe("createDocumentNode", () => {
    
    test("It should register a new document with coordinates or related to an existing zone", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 2}]);
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.createDocumentNode('Document1', 'This is a sample description.', null, null, 67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');

        expect(result).toEqual(2);
    });

    test("It should register a new document related to an new zone", async () => { 
        const coordinates: string = wellknown.stringify([ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]]);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 1}]);
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 2}]);
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.createDocumentNode('Document1', 'This is a sample description.', null, coordinates, null, null,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');

        expect(result).toEqual(2);
    });

    test("It should return ZoneError if the document is related to an new zone not saved", async () => { 
        const coordinates: string = wellknown.stringify([ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]]);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 0}]);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.createDocumentNode('Document1', 'This is a sample description.', null, coordinates, null, null,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(ZoneError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

    test("It should return an InternalServerError if the db call return a generic error", async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.createDocumentNode('Document1', 'This is a sample description.', null, null, 67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(InternalServerError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

    test("It should return an InternalServerError if the db call return a specific error", async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.createDocumentNode('Document1', 'This is a sample description.', null, null, 67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(InternalServerError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

  });

  describe("updateDocumentGeoref", () => {
    
    test("It should update a document with coordinates or related to an existing zone", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{affectedRows: 1}]);
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.updateDocumentGeoref('Document1', 'This is a sample description.', null, null, 67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');

        expect(result).toEqual(true);
    });

    test("It should update a document not found", async () => { 
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{affectedRows: 0}]);
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        await expect(dao.updateDocumentGeoref(1, null, null, 67.8525800000002, 20.3148144551419)).rejects.toThrow(WrongGeoreferenceError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

    test("It should update a document related to an new zone", async () => { 
        const coordinates: string = wellknown.stringify([ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]]);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 1}]);
        jest.spyOn(connMock, 'query').mockResolvedValue([{affectedRows: 1}]);
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.updateDocumentGeoref(1, null, coordinates, null, null);

        expect(result).toEqual(true);
    });

    test("It should return ZoneError if the document is related to an new zone not saved", async () => { 
        const coordinates: string = wellknown.stringify([ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]]);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockResolvedValue([{insertId: 0}]);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.updateDocumentGeoref(1, null, coordinates, null, null)).rejects.toThrow(ZoneError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

    test("It should return an InternalServerError if the db call return a generic error", async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.updateDocumentGeoref(1, null, null, 67.8525800000002, 20.3148144551419)).rejects.toThrow(InternalServerError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

    test("It should return an InternalServerError if the db call return a specific error", async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.updateDocumentGeoref(1, null, null, 67.8525800000002, 20.3148144551419)).rejects.toThrow(InternalServerError);

        expect(connMock.rollback).toHaveBeenCalled();
    });

  });

  describe('getDocumentByID', () => {
    test('It should return a document when it exists', async () => {
        const document = new Document(1, 'Title','Description', null, 68.33, 67.21, 'Stakeholders', 'Scale', '2024-11-06', 'Type', 'en', 10, 0, [], []);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([document]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getDocumentByID(1);

        expect(result).toEqual(document);
    });

    test('It should throw DocumentNotFoundError if the document does not exist', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentByID(1)).rejects.toThrow(DocumentNotFoundError);
    });

    test('It should return InternalServerError if db call return a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentByID(1)).rejects.toThrow(InternalServerError);
    });

    test('It should return InternalServerError if db call return a specific error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentByID(1)).rejects.toThrow(InternalServerError);
    });
  });

  describe('getDocsWithFilters', () => {
        test('It should return all the document selected', async () => {
            const document1: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            const document2: Document = new Document(2, "Documento 2", "Descrizione 2", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([document1, document2]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getDocsWithFilters({
                zoneID: '1',
                stakeholders: 'Stakeholders 1',
                scale: '1:1000',
                issuanceDate: '01/01/2023',
                type: 'Report',
                language: 'it',
                pagesize: 2,
                pagenumber: 3
            });

            expect(result).toBe([document1, document2]);
        })

        test('It should return all the document related to the whole Kiruna Area', async () => {
            const document1: Document = new Document(1, "Documento 1", "Descrizione 1", null, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([document1]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getDocsWithFilters({zoneID: '0'});

            expect(result).toBe([document1]);
        })

        test('It should return InternalServerError if db call returns a generic error', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error());
            jest.spyOn(connMock, 'release');

            await expect(dao.getDocsWithFilters({zoneID: '0'})).rejects.toThrow(InternalServerError);
        })

        test('It should return InternalServerError if db call returns a specific error', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(dao.getDocsWithFilters({zoneID: '0'})).rejects.toThrow(InternalServerError);
        })
   })

  describe('deleteAllDocuments', () => {
    test('It should delete all documents successfully', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query');
        jest.spyOn(connMock, 'release');

        const result = await dao.deleteAllDocuments();
        expect(result).toBe(true);
    });

    test('It should return InternalServerError if db call return a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(dao.deleteAllDocuments()).rejects.toThrow(InternalServerError);
    });

    test('It should return InternalServerError if db call return a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.deleteAllDocuments()).rejects.toThrow(InternalServerError);
    });
  });

  describe('addResource', () => {
    test('It should add a resource to a document', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch');
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.addResource(1, ['file.txt'], ['resources/1-fileURLToPath.txt']);

        expect(result).toBe(true);
    })

    test('It should return InternalServerError if db call return a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.addResource(1, ['file.txt'], ['resources/1-fileURLToPath.txt'])).rejects.toThrow(InternalServerError);
        expect(connMock.rollback).toHaveBeenCalled();
    });

    test('It should return InternalServerError if db call return a specific error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.addResource(1, ['file.txt'], ['resources/1-fileURLToPath.txt'])).rejects.toThrow(InternalServerError);
        expect(connMock.rollback).toHaveBeenCalled();
    });
  })

});

