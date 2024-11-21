import { LinkDocumentController } from '../../../controllers/link_docController';
import { LinkDocumentDAO } from '../../../dao/link_docDAO';
import { LinkDocument, Relationship } from '../../../components/link_doc'; // Importiamo Relationship
import { DocumentsError, InternalServerError, LinkError } from '../../../errors/link_docError';
import { InternalSymbolName } from 'typescript';

jest.mock('../../../dao/link_docDAO');

describe('LinkDocumentController', () => {
    let controller: LinkDocumentController;
    let mockDAO: jest.Mocked<LinkDocumentDAO>;

    beforeEach(() => {
        controller = new LinkDocumentController();
        mockDAO = new LinkDocumentDAO() as jest.Mocked<LinkDocumentDAO>;
        controller['dao'] = mockDAO;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('It should create a link between documents successfully', async () => {
        const firstDoc: number = 1;
        const secondDoc: number = 2;
        const relationship: string = 'Direct consequence'; 
        const other = [{id: secondDoc, relationship: relationship}];
        const linkDocument: LinkDocument = new LinkDocument(firstDoc, secondDoc, Relationship.DIRECT);

        mockDAO.checkDocuments.mockResolvedValueOnce(true);
        mockDAO.getLink.mockResolvedValueOnce(null); 
        mockDAO.insertLink.mockResolvedValueOnce(true);

        const result = await controller.createLink(firstDoc, other);

        expect(result).toEqual(true);
        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.insertLink).toHaveBeenCalledWith([linkDocument]);
    });


    test('Should throw DocumentsError if documents are equal', async () => {
        const firstDoc: number = 1;
        const secondDoc: number = 1;
        const relationship: string = 'Direct consequence'; 
        const other = [{id: secondDoc, relationship: relationship}];

        await expect(controller.createLink(firstDoc, other)).rejects.toThrow(DocumentsError);

        expect(mockDAO.checkDocuments).not.toHaveBeenCalled();
        expect(mockDAO.getLink).not.toHaveBeenCalled();
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });

    
    test('It should throw DocumentsError if one of the documents does not exist', async () => {
        const firstDoc: number = 1;
        const secondDoc: number = 2;
        const relationship: string = 'Direct consequence'; 
        const other = [{id: secondDoc, relationship: relationship}];

        mockDAO.checkDocuments.mockResolvedValueOnce(false);

        await expect(controller.createLink(firstDoc, other)).rejects.toThrow(DocumentsError);

        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).not.toHaveBeenCalled();
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });

    test('It should throw LinkError if there is already a link between the documents', async () => {
        const firstDoc: number = 1;
        const secondDoc: number = 2;
        const relationship: string = 'Direct consequence'; 
        const other = [{id: secondDoc, relationship: relationship}];
        const existingLink: LinkDocument = { firstDoc, secondDoc, relationship: Relationship.COLLATERAL};

        mockDAO.checkDocuments.mockResolvedValueOnce(true);
        mockDAO.getLink.mockResolvedValueOnce(existingLink);

        await expect(controller.createLink(firstDoc, other)).rejects.toThrow(LinkError);
        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });

});
