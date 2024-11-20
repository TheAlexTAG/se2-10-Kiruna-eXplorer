import request from "supertest";
import { app } from "../../../../../index"; 
import { DocumentController } from "../../../../controllers/documentController";
import { Utilities } from "../../../../utilities";
import { DocumentNotFoundError } from "../../../../errors/documentErrors";

jest.mock("../../../../controllers/documentController");
jest.mock("../../../../utilities");

describe("POST /api/resource/:documentID", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock isUrbanPlanner
    (Utilities.prototype.isUrbanPlanner as jest.Mock).mockImplementation(
      (req: any, res: any, next: any) => next()
    );

  });

  test("should return 200 and confirm files are saved successfully when input is valid", async () => {
    const documentID = 31;
    const mockDocument = { id: documentID, resource: [] };
    
    (DocumentController.prototype.getDocumentByID as jest.Mock).mockResolvedValueOnce(mockDocument);
    (DocumentController.prototype.addResource as jest.Mock).mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post(`/api/resource/${documentID}`)
      .attach("files", Buffer.from("file content"), { filename: "test.txt" })
      .attach("files", Buffer.from("file content 2"), { filename: "test2.txt" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("Files saved successfully");
    expect(DocumentController.prototype.getDocumentByID).toHaveBeenCalledWith(documentID.toString());
    expect(DocumentController.prototype.addResource).toHaveBeenCalledWith(
      documentID,
      expect.arrayContaining([
        `resources/${documentID}-test.txt`,
        `resources/${documentID}-test2.txt`
      ])
    );
  });

  test("should return 422 when no files are uploaded", async () => {
    const documentID = 31;

    (DocumentController.prototype.getDocumentByID as jest.Mock).mockResolvedValueOnce({
      id: documentID,
      resource: []
    });

    const response = await request(app)
      .post(`/api/resource/${documentID}`)
      .send();

    expect(response.status).toBe(422);
    expect(response.body).toEqual({ error: "Missing files" });
  });

  test("should return 400 when file name is invalid", async () => {
    const documentID = 31;

    (DocumentController.prototype.getDocumentByID as jest.Mock).mockResolvedValueOnce({
      id: documentID,
      resource: [`resources/${documentID}-test.txt`]
    });

    const response = await request(app)
      .post(`/api/resource/${documentID}`)
      .attach("files", Buffer.from("file content"), { filename: "test.txt" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid file name" });
  });

  test("should return 404 when document is not found", async () => {
    const documentID = 999;

    (DocumentController.prototype.getDocumentByID as jest.Mock).mockRejectedValueOnce(
      new DocumentNotFoundError()
    );

    const response = await request(app)
      .post(`/api/resource/${documentID}`)
      .attach("files", Buffer.from("file content"), { filename: "test.txt" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Document not found" });
  });

  test("should return 500 on server error", async () => {
    const documentID = 31;

    (DocumentController.prototype.getDocumentByID as jest.Mock).mockRejectedValueOnce(
      new Error("Internal server error")
    );

    const response = await request(app)
      .post(`/api/resource/${documentID}`)
      .attach("files", Buffer.from("file content"), { filename: "test.txt" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error" });
  });

  test("should return 422 when documentID is not a number", async () => {
    const response = await request(app)
      .post("/api/resource/abc")
      .attach("files", Buffer.from("file content"), { filename: "test.txt" });

    expect(response.status).toBe(422);
  });
});
