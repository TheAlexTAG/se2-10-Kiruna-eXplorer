import request from "supertest";
import { app } from "../../../../index";
import { Document } from '../../../components/document';
import { DocumentController } from "../../../controllers/documentController";

jest.mock("../../../controllers/documentController");

describe("GET /api/documents/links", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return documents when valid query parameters are provided", async () => {
    const mockDocuments = [
      new Document(1, 'Test Doc 1', 'Description 1', 101, 40.7128, 74.006, 'Stakeholder A', '1:5000', '01/01/2024', 'Design doc.', 'English', 10, 0),
      new Document(2, 'Test Doc 2', 'Description 2', 102, 34.0522, 118.2437, 'Stakeholder B', '1:1000', '12/12/2023', 'Technical doc.', 'French', 5, 0),
    ];

    (DocumentController.prototype.getAllDocuments as jest.Mock).mockResolvedValueOnce(mockDocuments);

    const response = await request(app)
      .get("/api/documents/links")
      .query({
        zoneID: 101,
        stakeholders: "Stakeholder A",
        scale: "1:5000",
        issuanceDate: "01/01/2024",
        type: "Design doc.",
        language: "English",
      });

    expect(response.status).toBe(200); 
    expect(response.body).toEqual(mockDocuments); 
    expect(DocumentController.prototype.getAllDocuments).toHaveBeenCalledWith({
      zoneID: "101", 
      stakeholders: "Stakeholder A",
      scale: "1:5000",
      issuanceDate: "01/01/2024",
      type: "Design doc.",
      language: "English",
    });
  });

  test("should return 500 when an error occurs", async () => {
    (DocumentController.prototype.getAllDocuments as jest.Mock).mockRejectedValueOnce(new Error("Internal server error"));

    const response = await request(app).get("/api/documents/links");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error" }); 
  });
});
