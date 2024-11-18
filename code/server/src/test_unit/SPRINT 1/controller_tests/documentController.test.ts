import { DocumentController } from "../../controllers/documentController";
import { DocumentDAO } from "../../dao/documentDAO";
import { ZoneDAO } from "../../dao/zoneDAO";
import { CoordinatesOutOfBoundsError, InvalidDocumentZoneError, WrongGeoreferenceError } from "../../errors/documentErrors";
import { MissingKirunaZoneError } from "../../errors/zoneError";
import * as turf from "@turf/turf";
import * as wellknown from "wellknown";

jest.mock("../../dao/documentDAO");
jest.mock("../../dao/zoneDAO");
jest.mock("@turf/turf");
jest.mock("wellknown");

describe("DocumentController", () => {
    let documentController: DocumentController;
    let documentDAOMock: jest.Mocked<DocumentDAO>;
    let zoneDAOMock: jest.Mocked<ZoneDAO>;

    beforeEach(() => {
        documentDAOMock = new DocumentDAO() as jest.Mocked<DocumentDAO>;
        zoneDAOMock = new ZoneDAO() as jest.Mocked<ZoneDAO>;
        documentController = new DocumentController();

        (documentController as any).dao = documentDAOMock;
        (documentController as any).zoneDao = zoneDAOMock;
    });

    describe("createNode", () => {
        test("It should create a node with valid latitude and longitude", async () => {
            documentDAOMock.createDocumentNode.mockResolvedValue(1);
            jest.spyOn(documentController as any, 'checkCoordinatesValidity').mockResolvedValue(true);

            const result = await documentController.createNode(
                "Titolo", "icon_url", "Descrizione", null, 67.85, 20.225, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            );

            expect(result).toBe(1);
            expect(documentDAOMock.createDocumentNode).toHaveBeenCalledWith(
                "Titolo", "icon_url", "Descrizione", null, 67.85, 20.225, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            );
        });

        test("should throw CoordinatesOutOfBoundsError for coordinates out of bounds", async () => {
            jest.spyOn(documentController as any, 'checkCoordinatesValidity').mockResolvedValue(false);

            await expect(documentController.createNode(
                "Titolo", "icon_url", "Descrizione", null, 90, 200, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            )).rejects.toThrow(CoordinatesOutOfBoundsError);
        });


        test("should throw WrongGeoreferenceError if both latitude and zoneID are specified", async () => {
            await expect(documentController.createNode(
                "Titolo", "icon_url", "Descrizione", 1, 67.85, 20.225, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            )).rejects.toThrow(WrongGeoreferenceError);
        });
    });

    describe("getDocumentByID", () => {
        test("should create a node with a valid zone ID", async () => {
            const mockZone = { coordinates: { type: "Polygon", coordinates: [[[20.0, 67.0], [21.0, 67.0], [21.0, 68.0], [20.0, 68.0], [20.0, 67.0]]] } };

            jest.spyOn(ZoneDAO.prototype, 'getZone').mockResolvedValue(mockZone);

            jest.spyOn(documentController as any, 'getRandCoordinates').mockResolvedValue({ latitude: 67.5, longitude: 20.5 });

            documentDAOMock.createDocumentNode.mockResolvedValue(2);

            const result = await documentController.createNode(
                "Titolo", "icon_url", "Descrizione", 1, null, null, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            );

            expect(result).toBe(2);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledWith(1);
            expect(documentDAOMock.createDocumentNode).toHaveBeenCalledWith(
                "Titolo", "icon_url", "Descrizione", 1, 67.5, 20.5, "Stakeholders", "1:100", "2023-01-01", "Report", "it", "5"
            );
        });
    });

    describe("getDocumentsTitles", () => {
        test("should return a list of document IDs and titles", async () => {
            const mockTitles = [{ documentID: 1, title: "Documento 1" }, { documentID: 2, title: "Documento 2" }];
            documentDAOMock.getDocumentsTitles.mockResolvedValue(mockTitles);

            const result = await documentController.getDocumentsTitles();

            expect(result).toEqual(mockTitles);
        });
    });

    describe("getAllDocuments", () => {
        test("should return a list of documents", async () => {
            const mockDocuments = [{ id: 1, title: "Documento Test", icon : "icon_url", description: "Description", zoneID: 1, 
                latitude: null, longitude: null, stakeholders: "Stakeholders", scale: "1:100", issuanceDate: "2023-01-01", 
                type: "Report", language: "it", pages: 5, connections: 0, attachment: [], resource: []  }];
            documentDAOMock.getDocumentsFull.mockResolvedValue(mockDocuments);

            const result = await documentController.getAllDocuments();

            expect(result).toEqual(mockDocuments);
        });
    });

    describe("deleteAllDocuments", () => {
        test("should delete all documents", async () => {
            await documentController.deleteAllDocuments();

            expect(documentDAOMock.deleteAllDocuments).toHaveBeenCalled();
        });
    });

    describe("getAllDocumentsCoordinates", () => {
        test("should return error if there is Database Error", async () => {
            documentDAOMock.getAllDocumentsCoordinates.mockRejectedValue(new Error("Database Error"));

            await expect(documentController.getAllDocumentsCoordinates()).rejects.toThrow("Database Error");
        });
    });

    describe("checkCoordinatesValidity", () => {
        test("should return true for valid coordinates within the polygon", async () => {
            const kirunaPolygonWKT = "POLYGON((20.0 67.0, 21.0 67.0, 21.0 68.0, 20.0 68.0, 20.0 67.0))";
            const kirunaPolygonGeoJSON = { type: "Polygon", coordinates: [[[20.0, 67.0], [21.0, 67.0], [21.0, 68.0], [20.0, 68.0], [20.0, 67.0]]] };
            
            // Mock del metodo getKirunaPolygon per restituire un poligono WKT
            jest.spyOn(ZoneDAO.prototype, 'getKirunaPolygon').mockResolvedValue(kirunaPolygonWKT);
            
            // Mock di wellknown.parse per restituire GeoJSON
            (wellknown.parse as jest.Mock).mockReturnValue(kirunaPolygonGeoJSON);
            
            // Mock di turf.booleanPointInPolygon per restituire true
            (turf.booleanPointInPolygon as jest.Mock).mockReturnValue(true);

            // Testa la funzione checkCoordinatesValidity
            const result = await documentController['checkCoordinatesValidity'](20.5, 67.5);

            expect(result).toBe(true);
            expect(ZoneDAO.prototype.getKirunaPolygon).toHaveBeenCalled();
            expect(wellknown.parse).toHaveBeenCalledWith(kirunaPolygonWKT);
            expect(turf.booleanPointInPolygon).toHaveBeenCalledWith(
                turf.point([20.5, 67.5]),
                kirunaPolygonGeoJSON
            );
        });

        test("should throw MissingKirunaZoneError if the polygon does not exist", async () => {
            jest.spyOn(ZoneDAO.prototype, 'getKirunaPolygon').mockResolvedValue("");

            await expect(documentController['checkCoordinatesValidity'](20.5, 67.5)).rejects.toThrow(MissingKirunaZoneError);
        });
    });
});
