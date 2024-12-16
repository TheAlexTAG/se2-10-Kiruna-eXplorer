import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import { LinkDocumentDAO } from '../../../src/dao/link_docDAO';
import { LinkDocument, Relationship } from '../../../src/components/link_doc';
import db from '../../../src/db/db';
import { InternalServerError, LinkError, ModifyLinkError } from '../../../src/errors/link_docError';

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
    jest.resetAllMocks();
  });

  describe('checkLink', () => {
    
    test('It should return a link with these details if it exists', async () => {
        const link: LinkDocument = new LinkDocument(1,1,2, Relationship.DIRECT);

        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{linkID:1, firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence'}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkLink(1, 2, Relationship.DIRECT);
        expect(result).toEqual(link);
    }); 

    test('It should return null if there is no such link', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkLink(1, 2, Relationship.DIRECT);
        expect(result).toBeNull();
    });

    test('It should throw an InternalServerError if db call fails', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.checkLink(1, 2, Relationship.DIRECT)).rejects.toThrow(InternalServerError);
    });

  });

  describe('getLink', () => {
    
    test('It should return the link with the specified id', async () => {
        const link: LinkDocument = new LinkDocument(1, 1, 2, Relationship.DIRECT);

        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{linkID:1, firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence'}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getLink(1);
        expect(result).toEqual(link);
    }); 

    test('It should return null if there is no such link', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getLink(1);
        expect(result).toBeNull();
    });

    test('Should throw an InternalServerError if db call fails', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.getLink(1)).rejects.toThrow(InternalServerError);
    });

  });

  describe('getDocumentConnections', () => {
    test('It should return the number of connections for a document', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{tot: 3}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.getDocumentConnections(1);
        expect(result).toBe(3);
    });

    test('It should throw LinkError if the db call returns nothing', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([]);
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentConnections(1)).rejects.toThrow(LinkError);
      });

    test('It should throw InternalServerError if db call fails', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
        jest.spyOn(connMock, 'release');

        await expect(dao.getDocumentConnections(1)).rejects.toThrow(InternalServerError);
    });
  });

  describe('checkDocuments', () => {
    test('It should return true if both documents exist', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{tot: 2}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkDocuments(1, 2);
        expect(result).toBe(true);
    });

    test('It should return false if not all documents exist', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue([{tot: 1}]);
        jest.spyOn(connMock, 'release');

        const result = await dao.checkDocuments(1, 2);
        expect(result).toBe(false);
    });

    test('It should throw InternalServerError if db call fails', async () => {
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
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

    test('It should throw InternalServerError id db call fails', async () => {
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

  });


  describe('modifyLink', () => {
    test('It should modify a link successfully', async () => {
        const link: LinkDocument =  new LinkDocument(1, 1, 2, Relationship.DIRECT);
        jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
        jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 1});
        jest.spyOn(connMock, 'release');

        const result = await dao.modifyLink(link);
        expect(result).toEqual(link);
    });

    test('It should throw ModifyLinkError if there are more than one link with this id', async () => {
      const link: LinkDocument =  new LinkDocument(1, 1, 2, Relationship.DIRECT);
      jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
      jest.spyOn(connMock, 'query').mockResolvedValue({affectedRows: 3});
      jest.spyOn(connMock, 'release');

      await expect(dao.modifyLink(link)).rejects.toThrow(ModifyLinkError);
  });

    test('It should throw InternalServerError id db call fails', async () => {
      const link: LinkDocument =  new LinkDocument(1, 1, 2, Relationship.DIRECT);
      jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
      jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
      jest.spyOn(connMock, 'release');

      await expect(dao.modifyLink(link)).rejects.toThrow(InternalServerError);
    });

  });

});
