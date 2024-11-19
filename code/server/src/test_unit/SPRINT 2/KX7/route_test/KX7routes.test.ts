import request from "supertest";
import { app } from "../../../../../index";
import { DocumentController } from "../../../../controllers/documentController";
import { Utilities } from "../../../../utilities";

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

  test("should return 200 and the lastID when input is valid", async () => {
    const lastID = 2;
    
    (DocumentController.prototype.addResource as jest.Mock)
      .mockResolvedValueOnce(lastID);

    const response = await request(app)
      .post("/api/resource/31") 
      .send({ link: "https://www.example.com" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(lastID);
    expect(DocumentController.prototype.addResource)
      .toHaveBeenCalledWith("31", "https://www.example.com");
  });

  test("should return 422 when link is missing", async () => {
    const response = await request(app)
      .post("/api/resource/31")
      .send({}) 
      .set("Content-Type", "application/json");

    expect(response.status).toBe(422);
  });

  test("should return 422 when documentID is not a number", async () => {
    const response = await request(app)
      .post("/api/resource/abc") 
      .send({ link: "https://www.example.com" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(422);
  });

  test("should return error status code and message when addResource fails", async () => {
    const mockError = {
      code: 500,
      message: "Database error"
    };
    
    (DocumentController.prototype.addResource as jest.Mock)
      .mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post("/api/resource/31")
      .send({ link: "https://www.example.com" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(mockError.code);
    expect(response.body).toEqual({ error: mockError.message });
    expect(DocumentController.prototype.addResource)
      .toHaveBeenCalledWith("31", "https://www.example.com");
  });

  test("should return 404 when document is not found", async () => {
    const mockError = {
      code: 404,
      message: "Document not found"
    };
    
    (DocumentController.prototype.addResource as jest.Mock)
      .mockRejectedValueOnce(mockError);

    const response = await request(app)
      .post("/api/resource/31")
      .send({ link: "https://www.example.com" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Document not found" });
  });
  
});