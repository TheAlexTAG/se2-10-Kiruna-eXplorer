import { describe, test, expect, jest, beforeAll, beforeEach, afterEach} from "@jest/globals";
import { LinkDocumentDAO } from '../../../src/dao/link_docDAO';
import { LinkDocument, Relationship } from '../../../src/components/link_doc';
import db from '../../../src/db/db';
import { DocumentNotFoundError } from '../../../src/errors/documentErrors';
import { DocumentsError, InternalServerError, LinkError } from '../../../src/errors/link_docError';
import { unwatchFile } from "fs";

jest.mock("../../../src/db/db.ts")

let dao: LinkDocumentDAO;
  
const connMock: any= {
    query: jest.fn(),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    batch: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
};

describe('LinkDocumentDAO', () => {

  beforeAll(() => {
    dao = new LinkDocumentDAO();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getLink', () => {
    
    test('Should return the link between the specified documents', async () => {
        const relationship: Relationship = Relationship.DIRECT;
        const link: LinkDocument = new LinkDocument(1,2, relationship);

        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence'}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getLink(1, 2, Relationship.DIRECT);
        expect(result).toEqual(link);
    }); 

    test('Should return null if there is no such link', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getLink(1, 2, Relationship.DIRECT);
        expect(result).toBeNull();
    });

    test('Should throw an InternalServerError on database error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.getLink(1, 2, Relationship.DIRECT)).rejects.toThrow(InternalServerError);
    });

    test('Should throw an InternalServerError on a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(dao.getLink(1, 2, Relationship.DIRECT)).rejects.toThrow(InternalServerError);
    });

  });

  describe('getDocumentConnections', () => {
    test('Should return the number of connections for a document', async () => {
        const mockRow = {tot: 3};
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([mockRow]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getDocumentConnections(1);
        expect(result).toBe(3);
    });

    test('Should throw LinkError if the specified document has no links', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentConnections(1)).rejects.toThrow(LinkError);
      });

    test('Should throw InternalServerError on database error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentConnections(1)).rejects.toThrow(InternalServerError);
    });

    test('Should throw InternalServerError on a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentConnections(1)).rejects.toThrow(InternalServerError);
    });
  });

  describe('checkDocuments', () => {
    test('Should return true if both documents exist', async () => {
        const mockRow = { tot: 2 };
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([mockRow]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkDocuments(1, 2);
        expect(result).toBe(true);
    });

    test('Should return false if not all documents exist', async () => {
        const mockRow = { tot: 1 };
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([mockRow]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkDocuments(1, 2);
        expect(result).toBe(false);
    });

    test('Should throw InternalServerError on database error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Datbase error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.checkDocuments(1, 2)).rejects.toThrow(InternalServerError);
    });

    test('Should throw InternalServerError on a generic error', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'release');

        await expect(dao.checkDocuments(1, 2)).rejects.toThrow(InternalServerError);
    });
  });

  describe('insertLink', () => {
    test('It should insert a link between documents successfully', async () => {
        const link1: (number | Relationship)[] = [1, 2, Relationship.COLLATERAL];
        const link2: (number | Relationship)[] = [1, 3, Relationship.DIRECT];
        const links: (number | Relationship)[][] = [link1, link2];
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch');
        jest.spyOn(connMock, 'commit');
        jest.spyOn(connMock, 'release');

        const result = await dao.insertLink(links);
        expect(result).toEqual(true);
        expect(connMock.commit).toHaveBeenCalled();
    });

    test('Should throw InternalServerError on database error', async () => {
        const link1: (number | Relationship)[] = [1, 2, Relationship.COLLATERAL];
        const link2: (number | Relationship)[] = [1, 3, Relationship.DIRECT];
        const links: (number | Relationship)[][] = [link1, link2];
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.insertLink(links)).rejects.toThrow(InternalServerError);
        expect(connMock.rollback).toHaveBeenCalled();
    });

    test('Should throw InternalServerError on a generic error', async () => {
        const link1: (number | Relationship)[] = [1, 2, Relationship.COLLATERAL];
        const link2: (number | Relationship)[] = [1, 3, Relationship.DIRECT];
        const links: (number | Relationship)[][] = [link1, link2];
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'beginTransaction');
        jest.spyOn(connMock, 'batch').mockRejectedValue(new Error);
        jest.spyOn(connMock, 'rollback');
        jest.spyOn(connMock, 'release');

        await expect(dao.insertLink(links)).rejects.toThrow(InternalServerError);
        expect(connMock.rollback).toHaveBeenCalled();
    });

    
  });

});
