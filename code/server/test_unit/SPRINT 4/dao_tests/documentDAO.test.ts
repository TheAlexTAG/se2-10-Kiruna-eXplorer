import { DocumentDAO, DocumentDaoHelper } from '../../../src/dao/documentDAO';
import db from '../../../src/db/db';
import { DocumentNotFoundError, DocumentUpdateError } from '../../../src/errors/documentErrors';
import { Document, DocumentData, DocumentGeoData } from '../../../src/components/document';
import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import { InternalServerError } from '../../../src/errors/link_docError';
import { InsertZoneError } from '../../../src/errors/zoneError';

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

    describe("insertZone", () => {

        test("It return save the new zone", async () => { 
            const coordinates: string = "POLYGON((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";

            jest.spyOn(connMock, 'query').mockResolvedValueOnce({insertId: 3});

            const result = await DocumentDaoHelper.prototype.insertZone(coordinates, connMock);

            expect(result).toBe(3);
        })

        test("It return null if the new zone has not be insered", async () => { 
            const coordinates: string = "POLYGON((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";

            jest.spyOn(connMock, 'query').mockResolvedValueOnce({});

            const result = await DocumentDaoHelper.prototype.insertZone(coordinates, connMock);

            expect(result).toBeNull();
        })

    })

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
            const documentData : DocumentData = {
                documentID: 0,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue({insertId: 2});
            jest.spyOn(connMock, 'release');

            const result = await dao.createDocumentNode(documentData, documentGeoData);

            expect(result).toEqual(2);
        });

        test("It should register a new document related to a new zone", async () => { 
            const documentData : DocumentData = {
                documentID: 0,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(DocumentDaoHelper.prototype, 'insertZone').mockResolvedValueOnce(3);
            jest.spyOn(connMock, 'query').mockResolvedValue({insertId: 2});
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            const result = await dao.createDocumentNode(documentData, documentGeoData);

            expect(result).toEqual(2);
        });

        test("It should return an InternalServerError if the db call return a generic error", async () => {
            const documentData : DocumentData = {
                documentID: 0,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
            jest.spyOn(connMock, 'release');

            await expect(dao.createDocumentNode(documentData, documentGeoData)).rejects.toThrow(InternalServerError);
        });

        test("It should return an InternalServerError if the db call return a specific error", async () => {
            const documentData : DocumentData = {
                documentID: 0,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(dao.createDocumentNode(documentData, documentGeoData)).rejects.toThrow(InternalServerError);
        });

    });

    describe("updateDocument", () => {

        test("It should update a document with coordinates or related to an existing zone", async () => { 
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 1});
            jest.spyOn(connMock, 'release');

            const result = await dao.updateDocument(documentData, documentGeoData, true);

            expect(result).toEqual(true);
        });

        test("It should update a document related to a new zone", async () => { 
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(DocumentDaoHelper.prototype, 'insertZone').mockResolvedValueOnce(3);
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 1});
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            const result = await dao.updateDocument(documentData, documentGeoData, true);

            expect(result).toEqual(true);
        });

        
        test("It should return DocumentUpdateError if there is no such document", async () => { 
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 0});
            jest.spyOn(connMock, 'release');

            await expect(dao.updateDocument(documentData, documentGeoData)).rejects.toThrow(InternalServerError);
        });

        test("It should return an InternalServerError if the db call return a generic error", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
            jest.spyOn(connMock, 'release');

            await expect(dao.updateDocument(documentData, documentGeoData, true)).rejects.toThrow(InternalServerError);
        });

        test("It should return an InternalServerError if the db call return a specific error", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.8525800000002, longitude: 20.3148144551419};
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(dao.updateDocument(documentData, documentGeoData, true)).rejects.toThrow(InternalServerError);
        });

    });

    describe('getDocumentByID', () => {
        test('It should return a document when it exists', async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Title",
                description: "Description",
                stakeholders: "Stakeholders",
                scale: "1:100",
                issuanceDate: "2024-11-26",
                parsedDate: new Date("2024-11-26T01:00:00.000Z"),
                type: "Report",
                language: "it",
                pages: "10"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 68.33, longitude: 20.31};
            const document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{documentID:1, title:'Title', description: 'Description',zoneID: null,latitude: 68.33, longitude:20.31, stakeholders:'Stakeholders', scale:'1:100', issuanceDate:'2024-11-26', parsedDate:'2024-11-26',type: 'Report',language: 'it', pages:'10',connections: 0, attachments:[], resources:[], link:[]}]);
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
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento",
                description: "Descrizione",
                stakeholders: "Stakeholders",
                scale: "1:100",
                issuanceDate: "2024-11-26",
                parsedDate: new Date("2024-11-26T01:00:00.000Z"),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento",
                description: "Descrizione",
                stakeholders: "Stakeholders",
                scale: "1:100",
                issuanceDate: "2024-11-26",
                parsedDate: new Date("2024-11-26T01:00:00.000Z"),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([
                {documentID:1, title:'Documento', description: 'Descrizione',zoneID: 1,latitude:null, longitude:null, stakeholders:'Stakeholders', scale:'1:100', issuanceDate:'2024-11-26', parsedDate:'2024-11-26', type: 'Report',language: 'it', pages:'5',connections: 0, attachment:[], resource:[], link:[]},
                {documentID:2, title:'Documento', description: 'Descrizione',zoneID: 1,latitude:null, longitude:null, stakeholders:'Stakeholders', scale:'1:100', issuanceDate:'2024-11-26', parsedDate:'2024-11-26', type: 'Report',language: 'it', pages:'5',connections: 0, attachment:[], resource:[], link:[]}]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getDocsWithFilters({
                title: 'Documento',
                description: 'Descrizione',
                zoneID: '1',
                stakeholders: 'Stakeholders',
                scale: '1:100',
                issuanceDate: '2024-11-26',
                type: 'Report',
                language: 'it'
            });

            expect(result).toEqual([document1, document2]);
        })

        test('It should return all the document related to the whole Kiruna Area', async () => {
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "2024-11-26",
                parsedDate: new Date("2024-11-26T01:00:00.000Z"),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 0, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([
                {documentID:1, title:'Documento 1', description: 'Descrizione 1',zoneID: null,latitude:null, longitude:null, stakeholders:'Stakeholders 1', scale:'1:100', issuanceDate:'2024-11-26', parsedDate:'2024-11-26', type: 'Report',language: 'it', pages:'5',connections: 0, attachment:[], resource:[], link:[]}]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getDocsWithFilters({zoneID: '0'});

            expect(result).toEqual([document1]);
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

    describe('getStakeholders', () => {
        test('It should return all the stakeholders', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{stakeholder: 'Stakeholder 1'}, {stakeholder: 'Stakeholder 2'}, {stakeholder: 'Stakeholder 3'}]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getStakeholders();
            expect(result).toEqual(['Stakeholder 1', 'Stakeholder 2', 'Stakeholder 3']);
        });

        test('It should return InternalServerError if db call fails', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
            jest.spyOn(connMock, 'release');

            await expect(dao.getStakeholders()).rejects.toThrow(InternalServerError);
        });
    })

    describe('updateDiagramDate', () => {
        test('It should update the parseDate of a document', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 1});
            jest.spyOn(connMock, 'release');

            const result = await dao.updateDiagramDate(1, '2023-12-03');
            expect(result).toBe(true);
        });

        test('It should return InternalServerError if no document has been updated', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 0});
            jest.spyOn(connMock, 'release');

            await expect(dao.updateDiagramDate(1, '2023-12-03')).rejects.toThrow(InternalServerError);
        });
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

    describe('getParsedDate', () => {
        test('It should return the parsedate of a document', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{parsedDate: '2023-10-22T00:00:00.000Z'}]);
            jest.spyOn(connMock, 'release');

            const result = await dao.getParsedDate(1);
            expect(result).toEqual(new Date('2023-10-22T02:00:00.000Z'));
        });

        test('It should return InternalServerError if db call fails', async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
            jest.spyOn(connMock, 'release');

            await expect(dao.getParsedDate(1)).rejects.toThrow(InternalServerError);
        });
    })

});

