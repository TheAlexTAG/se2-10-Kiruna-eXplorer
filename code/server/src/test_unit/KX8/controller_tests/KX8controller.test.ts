import { DocumentController } from "../../../controllers/documentController";
import { DocumentDAO } from "../../../dao/documentDAO";
import { Document } from '../../../components/document';


jest.mock("../../../dao/documentDAO");


describe("DocumentController", () => {
    let documentController: DocumentController;
    let documentDAOMock: jest.Mocked<DocumentDAO>;

    beforeEach(() => {
        documentDAOMock = new DocumentDAO() as jest.Mocked<DocumentDAO>;
        documentController = new DocumentController();

        (documentController as any).dao = documentDAOMock;

    });

    describe("getAllDocuments", () => {
        test("should return documents when DAO fetch is successful", async () => {
            const mockDocuments = [
                new Document(1, 'Test Doc 1', 'Description 1', 101, 40.7128, 74.006, 'Stakeholder A', '1:5000', '01/01/2024', 'Design doc.', 'English', 10, 0),
                new Document(2, 'Test Doc 2', 'Description 2', 102, 34.0522, 118.2437, 'Stakeholder B', '1:1000', '12/12/2023', 'Technical doc.', 'French', 5, 0),
              ];

            documentDAOMock.getDocumentsFull.mockResolvedValue(mockDocuments);

            const filters = {};
            const result = await documentController.getAllDocuments(filters);

            expect(documentDAOMock.getDocumentsFull).toHaveBeenCalledWith(filters);
            expect(result).toEqual(mockDocuments);
        });

        test("should return err when DAO fetch fails", async () => {
            const err = new Error("DAO fetch failed");
            documentDAOMock.getDocumentsFull.mockRejectedValue(err);

            const filters = {};
            await expect(documentController.getAllDocuments(filters)).rejects.toThrowError(err);
        });
    });

});
