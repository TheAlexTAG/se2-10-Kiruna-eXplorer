import request from "supertest";
import express from "express";
import { DocumentRoutes } from "../../routers/documentRoutes";  
import { DocumentController } from "../../controllers/documentController";
import { DocumentNotFoundError, WrongGeoreferenceError, CoordinatesOutOfBoundsError } from "../../errors/documentErrors";
import { ZoneError } from "../../errors/zoneError";
import { MissingKirunaZoneError } from "../../errors/zoneError";
import { app } from "../../../index";

jest.mock("../../controllers/documentController");
jest.mock("../../helper");
jest.mock("../../utilities");

describe("DocumentRoutes", () => {
    describe("POST /api/document", () => {
        test("should create a new node and return the ID", async () => {
            const mockCreateNode = jest.spyOn(DocumentController.prototype, 'createNode').mockResolvedValue(1);

            const response = await request(app)
                .post("/api/document")
                .send({
                    title: "Titolo Documento",
                    icon: "icon_url",
                    description: "Descrizione",
                    stakeholders: "Stakeholders",
                    scale: "1:100",
                    issuanceDate: "01/01/2023",
                    type: "Report",
                    language: "it",
                    pages: "5"
                });

            expect(response.status).toBe(200);
            expect(response.body).toBe(1);
            expect(mockCreateNode).toHaveBeenCalledWith(
                "Titolo Documento", "icon_url", "Descrizione", undefined, null, null, 
                "Stakeholders", "1:100", "01/01/2023", "Report", "it", "5"
            );
        });

        test("should return an error for incorrect georeferencing", async () => {
            jest.setTimeout(5000);
            const mockCreateNode = jest.spyOn(DocumentController.prototype, 'createNode').mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app)
                .post("/api/document")
                .send({
                    title: "Titolo Documento",
                    icon: "icon_url",
                    description: "Descrizione",
                    stakeholders: "Stakeholders",
                    scale: "1:100",
                    issuanceDate: "01/01/2023",
                    type: "Report",
                    language: "it",
                    pages: "5"
                });

            expect(response.status).toBe(400); 
            expect(response.body).toBe("Wrong Georeference Error");
        });
    });

    describe("GET /api/document/:id", () => {
        test("should return a document given the ID", async () => {
            jest.setTimeout(5000);
            const mockGetDocumentByID = jest.spyOn(DocumentController.prototype, 'getDocumentByID').mockResolvedValue({ id: 1, title: "Documento Test",
                    description: "Descrizione 1", icon: "icon_url", stakeholders: "Stakeholders 1", scale: "1:100", 
                    issuanceDate: "01/01/2023", type: "Report", language: "it", pages: 5, zoneID: 1, latitude: null, longitude: null,
                    connections : 0, attachment: [], resource: []
             });

            const response = await request(app)
                .get("/api/document/1");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ id: 1, title: "Documento Test" });
        });

        test("should return an error if the document is not found", async () => {
            jest.setTimeout(5000);
            const mockGetDocumentByID = jest.spyOn(DocumentController.prototype, 'getDocumentByID').mockRejectedValue(new DocumentNotFoundError());

            const response = await request(app)
                .get("/api/document/99");

            expect(response.status).toBe(404);
            expect(response.body).toBe("Document Not Found Error");
        });
    });

    describe("GET /api/document/titles/get", () => {
        test("should return a list of document titles", async () => {
            jest.setTimeout(5000);
            const mockGetDocumentsTitles = jest.spyOn(DocumentController.prototype, 'getDocumentsTitles').mockResolvedValue([
                { documentID: 1, title: "Documento 1" },
                { documentID: 2, title: "Documento 2" }
            ]);

            const response = await request(app)
                .get("/api/document/titles/get");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { documentID: 1, title: "Documento 1" },
                { documentID: 2, title: "Documento 2" }
            ]);
        });
    });

    describe("GET /api/documents", () => {
        test("should return a list of document titles should return a list of documents", async () => {
            jest.setTimeout(5000);
            const mockGetAllDocuments = jest.spyOn(DocumentController.prototype, 'getAllDocuments').mockResolvedValue([
                { id: 1, title: "Documento 1", description: "Descrizione 1", icon: "icon_url", stakeholders: "Stakeholders 1", scale: "1:100", 
                    issuanceDate: "01/01/2023", type: "Report", language: "it", pages: 5, zoneID: 1, latitude: null, longitude: null,
                    connections : 0, attachment: [], resource: [] },
                { id: 2, title: "Documento 2", description: "Descrizione 1", icon: "icon_url", stakeholders: "Stakeholders 1", scale: "1:100", 
                    issuanceDate: "01/01/2023", type: "Report", language: "it", pages: 5, zoneID: 1, latitude: null, longitude: null,
                    connections : 0, attachment: [], resource: [] }
            ]);

            const response = await request(app)
                .get("/api/documents");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { id: 1, title: "Documento 1" },
                { id: 2, title: "Documento 2" }
            ]);
        });
    });

    describe("GET /api/documents/coordinates", () => {
        test("should return all document coordinates", async () => {
            jest.setTimeout(5000);
            const mockGetAllDocumentsCoordinates = jest.spyOn(DocumentController.prototype, 'getAllDocumentsCoordinates').mockResolvedValue({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [20.5, 67.5] },
                        properties: { documentID: 1, title: "Documento 1" }
                    }
                ]
            });

            const response = await request(app)
                .get("/api/documents/coordinates");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [20.5, 67.5] },
                        properties: { documentID: 1, title: "Documento 1" }
                    }
                ]
            });
        });
    });

    describe("DELETE /api/documents/delete/all", () => {
        test("should delete all documents", async () => {
            jest.setTimeout(5000);
            const mockDeleteAllDocuments = jest.spyOn(DocumentController.prototype, 'deleteAllDocuments').mockResolvedValue(undefined);

            const response = await request(app)
                .delete("/api/documents/delete/all");

            expect(response.status).toBe(200);
            expect(response.body).toBeDefined();  
        });
    });
});
