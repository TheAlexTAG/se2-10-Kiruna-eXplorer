import { DocumentController } from "../../../../controllers/documentController";
import { DocumentDAO } from "../../../../dao/documentDAO";
import { Document } from '../../../../components/document';


jest.mock("../../../../dao/documentDAO");


describe("DocumentController", () => {
    let documentController: DocumentController;
    let documentDAOMock: jest.Mocked<DocumentDAO>;

    beforeEach(() => {
        documentDAOMock = new DocumentDAO() as jest.Mocked<DocumentDAO>;
        documentController = new DocumentController();

        (documentController as any).dao = documentDAOMock;

        // Mock the getDocumentByID method
        documentController.getDocumentByID = jest.fn().mockResolvedValue(
            new Document(1, 'Test Doc 1', 'Description 1', 101, 40.7128, 74.006, 'Stakeholder A', '1:5000', '01/01/2024', 'Design doc.', 'English', 10, 0)
        );
    });

    describe("addResource", () => {
        test("should add a resource and return the lastID", async () => {
            const documentID = 1;
            const link = 'https://example.com';
            const lastID = 123;

            const mockDocuments = new Document(documentID, 'Test Doc 1', 'Description 1', 101, 40.7128, 74.006, 'Stakeholder A', '1:5000', '01/01/2024', 'Design doc.', 'English', 10, 0)

            documentDAOMock.addResource.mockResolvedValue(lastID);

            const result = await documentController.addResource(documentID, link);

            expect(result).toBe(lastID);
            expect(documentController.getDocumentByID).toHaveBeenCalledWith(documentID);
            expect(documentDAOMock.addResource).toHaveBeenCalledWith(documentID, link);
        });

        test("should return err if getDocumentByID fails", async () => {
            const documentID = 10;
            const link = 'https://example.com';
            const err = new Error("Document not found");

            documentController.getDocumentByID = jest.fn().mockRejectedValue(err);

            await expect(documentController.addResource(documentID, link)).rejects.toThrow("Document not found");
        });

        test("should return err if addResource fails", async () => {
            const documentID = 1;
            const link = 'https://example.com';
            const err = new Error("Resource not added");

            documentDAOMock.addResource.mockRejectedValue(err);

            await expect(documentController.addResource(documentID, link)).rejects.toThrow("Resource not added");
        });
    });

});
