import { LinkDocumentController } from '../../controllers/link_daoController';
import { LinkDocumentDAO } from '../../dao/link_docDAO';
import { LinkDocument, Relationship } from '../../components/link_doc'; // Importiamo Relationship
import { DocumentsError } from '../../errors/link_docError';

jest.mock('../../dao/link_docDAO');

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
        const firstDoc = 1;
        const secondDoc = 2;
        const relationship = Relationship.DIRECT; 

        const mockLinkDocument: LinkDocument = { firstDoc, secondDoc, relationship };

        mockDAO.checkDocuments.mockResolvedValueOnce(true);
        mockDAO.getLink.mockResolvedValueOnce(null); 
        mockDAO.insertLink.mockResolvedValueOnce(mockLinkDocument);

        const result = await controller.creatLink(firstDoc, secondDoc, relationship);

        expect(result).toEqual(mockLinkDocument);
        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.insertLink).toHaveBeenCalledWith(firstDoc, secondDoc, relationship);
    });

    test('Should throw DocumentsError if documents are equal', async () => {
        const firstDoc = 1;
        const secondDoc = 1;
        const relationship = Relationship.DIRECT;

        await expect(controller.creatLink(firstDoc, secondDoc, relationship)).rejects.toThrow(DocumentsError);
        expect(mockDAO.checkDocuments).not.toHaveBeenCalled();
        expect(mockDAO.getLink).not.toHaveBeenCalled();
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });

    test('It should throw DocumentsError if one of the documents does not exist', async () => {
        const firstDoc = 1;
        const secondDoc = 2;
        const relationship = Relationship.COLLATERAL;

        mockDAO.checkDocuments.mockResolvedValueOnce(false);

        await expect(controller.creatLink(firstDoc, secondDoc, relationship)).rejects.toThrow(DocumentsError);
        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).not.toHaveBeenCalled();
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });

    test('It should throw DocumentsError if there is already a link between the documents', async () => {
        const firstDoc = 1;
        const secondDoc = 2;
        const relationship = Relationship.PROJECTION;
        const existingLink: LinkDocument = { firstDoc, secondDoc, relationship: Relationship.COLLATERAL };

        mockDAO.checkDocuments.mockResolvedValueOnce(true);
        mockDAO.getLink.mockResolvedValueOnce(existingLink);

        await expect(controller.creatLink(firstDoc, secondDoc, relationship)).rejects.toThrow(DocumentsError);
        expect(mockDAO.checkDocuments).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.getLink).toHaveBeenCalledWith(firstDoc, secondDoc);
        expect(mockDAO.insertLink).not.toHaveBeenCalled();
    });
});
