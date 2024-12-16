import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import { LinkDocumentController } from '../../../src/controllers/link_docController';
import { LinkDocumentDAO } from '../../../src/dao/link_docDAO';
import { LinkDocument, Relationship } from '../../../src/components/link_doc';
import { DocumentsError, LinkError, LinkNotFoundError } from '../../../src/errors/link_docError';

jest.mock('../../../src/dao/link_docDAO');

let controller : LinkDocumentController;

describe('LinkDocumentController', () => {

    beforeAll(() => {
        controller = new LinkDocumentController();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('createLink', () => {
        test('It should create a link between documents successfully with firstDoc<secondDoc', async () => {
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const other = [{id: '2', relationship: ['Direct consequence']}];
    
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValue(null);
            jest.spyOn(LinkDocumentDAO.prototype,"insertLink").mockResolvedValue(true);
    
            const result = await controller.createLink(firstDoc, other);
    
            expect(result).toEqual(true);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.insertLink).toHaveBeenCalledWith([[firstDoc, secondDoc, Relationship.DIRECT]]);
        });
    
        test('It should create a link between documents successfully with firstDoc>secondDoc', async () => {
            const firstDoc: number = 2;
            const secondDoc: number = 1;
            const other = [{id: '1', relationship: ['Direct consequence']}];
    
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValue(null);
            jest.spyOn(LinkDocumentDAO.prototype,"insertLink").mockResolvedValue(true);
    
            const result = await controller.createLink(firstDoc, other);
    
            expect(result).toEqual(true);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.insertLink).toHaveBeenCalledWith([[secondDoc, firstDoc, Relationship.DIRECT]]);
        });
    
    
        test('Should throw DocumentsError if documents are equal', async () => {
            const firstDoc: number = 1;
            const other = [{id: '1', relationship: ['Direct consequence']}];
    
            await expect(controller.createLink(firstDoc, other)).rejects.toThrow(DocumentsError);
    
            expect(LinkDocumentDAO.prototype.checkDocuments).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.checkLink).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.insertLink).not.toHaveBeenCalled();
        });
    
        
        test('It should throw DocumentsError if one of the documents does not exist', async () => {
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const other = [{id: '2', relationship: ['Direct consequence']}];
    
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValueOnce(false);
    
            await expect(controller.createLink(firstDoc, other)).rejects.toThrow(DocumentsError);
    
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.insertLink).not.toHaveBeenCalled();
        });
    
        test('It should throw LinkError if there is already a link between the documents', async () => {
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const other = [{id: '2', relationship: ['Direct consequence']}];
            const existingLink: LinkDocument = new LinkDocument(1, firstDoc, secondDoc, Relationship.DIRECT);
    
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValueOnce(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValueOnce(existingLink);
    
            await expect(controller.createLink(firstDoc, other)).rejects.toThrow(LinkError);
    
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.insertLink).not.toHaveBeenCalled();
        });

    })


    describe('modifyLink', () => {
        test('It should modify a link between documents successfully with firstDoc<secondDoc', async () => {
            const id: number = 1;
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const relationship: Relationship = Relationship.DIRECT;
            const existingLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.COLLATERAL);
            const newLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.DIRECT);
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(existingLink);
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValue(null);
            jest.spyOn(LinkDocumentDAO.prototype,"modifyLink").mockResolvedValue(newLink);
    
            const result = await controller.modifyLink(id, firstDoc, secondDoc, relationship);
    
            expect(result).toEqual(newLink);
            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.modifyLink).toHaveBeenCalledWith(newLink);
        });
    
        test('It should modify a link between documents successfully with firstDoc>secondDoc', async () => {
            const id: number = 1;
            const firstDoc: number = 2;
            const secondDoc: number = 1;
            const relationship: Relationship = Relationship.DIRECT;
            const existingLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.COLLATERAL);
            const newLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.DIRECT);
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(existingLink);
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValue(null);
            jest.spyOn(LinkDocumentDAO.prototype,"modifyLink").mockResolvedValue(newLink);
    
            const result = await controller.modifyLink(id, firstDoc, secondDoc, relationship);
    
            expect(result).toEqual(newLink);
            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.modifyLink).toHaveBeenCalledWith(newLink);
        });

        test('It should throw LinkNotFoundError if there is no link with this id', async () => {
            const id: number = 1;
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const relationship: Relationship = Relationship.DIRECT;
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(null);

            await expect(controller.modifyLink(id, firstDoc, secondDoc, relationship)).rejects.toThrow(LinkNotFoundError);
    
            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.checkLink).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.modifyLink).not.toHaveBeenCalled();
        });
    

        test('It should throw DocumentsError if documents are equal', async () => {
            const id: number = 1;
            const firstDoc: number = 1;
            const secondDoc: number = 1;
            const relationship: Relationship = Relationship.DIRECT;
            const existingLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.COLLATERAL);
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(existingLink);
    
            await expect(controller.modifyLink(id, firstDoc, secondDoc, relationship)).rejects.toThrow(DocumentsError);
            
            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.checkLink).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.modifyLink).not.toHaveBeenCalled();
        });
    
        
        test('It should throw DocumentsError if one of the documents does not exist', async () => {
            const id: number = 1;
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const relationship: Relationship = Relationship.DIRECT;
            const existingLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.COLLATERAL);
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(existingLink);
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(false);
    
            await expect(controller.modifyLink(id, firstDoc, secondDoc, relationship)).rejects.toThrow(DocumentsError);
    
            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).not.toHaveBeenCalled();
            expect(LinkDocumentDAO.prototype.modifyLink).not.toHaveBeenCalled();
        });
    
        test('It should throw LinkError if there is already a link between the documents', async () => {
            const id: number = 1;
            const firstDoc: number = 1;
            const secondDoc: number = 2;
            const relationship: Relationship = Relationship.DIRECT;
            const existingLink: LinkDocument = new LinkDocument(1, 1, 2, Relationship.DIRECT);
    
            jest.spyOn(LinkDocumentDAO.prototype,"getLink").mockResolvedValue(existingLink);
            jest.spyOn(LinkDocumentDAO.prototype,"checkDocuments").mockResolvedValue(true);
            jest.spyOn(LinkDocumentDAO.prototype,"checkLink").mockResolvedValue(existingLink);
    
            await expect(controller.modifyLink(id, firstDoc, secondDoc, relationship)).rejects.toThrow(LinkError);

            expect(LinkDocumentDAO.prototype.getLink).toHaveBeenCalledWith(id);
            expect(LinkDocumentDAO.prototype.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
            expect(LinkDocumentDAO.prototype.checkLink).toHaveBeenCalledWith(firstDoc, secondDoc, Relationship.DIRECT);
            expect(LinkDocumentDAO.prototype.modifyLink).not.toHaveBeenCalled();
        });

    })


});
