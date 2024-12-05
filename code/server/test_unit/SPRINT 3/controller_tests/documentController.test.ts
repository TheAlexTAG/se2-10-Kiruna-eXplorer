import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import {DocumentDAO} from "../../../src/dao/documentDAO";
import {DocumentController} from "../../../src/controllers/documentController";
import {CoordinatesOutOfBoundsError, WrongGeoreferenceError} from "../../../src/errors/documentErrors"
import * as turf from "@turf/turf"
import { Geometry } from "geojson"
import { ZoneDAO } from "../../../src/dao/zoneDAO";
import { Kiruna } from "../../../src/utilities";
import { InsertZoneError } from "../../../src/errors/zoneError";
import wellknown from "wellknown"
import { Zone } from "../../../src/components/zone";
import { Document } from "../../../src/components/document";

jest.mock("../../../src/dao/documentDAO")
jest.mock("../../../src/dao/zoneDAO")

let controller : DocumentController;

describe("Controller document unit tests", () => {

    beforeAll(() => {
        controller = new DocumentController();
    })

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("checkCoordinatesValidity", () => {

        test("It checks if a couple of coorinates belong to Kiruna area", async () => {
            const point = turf.point([67.85, 20.22]);
            jest.spyOn(turf,"point").mockReturnValue(point);
            jest.spyOn(turf,"booleanPointInPolygon").mockReturnValue(true);

            const result = await (controller as any).checkCoordinatesValidity(67.85, 20.22);
    
            expect(result).toEqual(true);
        });
    })

    describe("createNode", () => {

        test("It should post a new document that belongs to Kiruna general area", async () => {
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'This is a sample description.', 0, null, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN','1-10');
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should post a new document that defines a new zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates]);
            const centroid = turf.centroid(geo);
            const coordString: string= wellknown.stringify(geo as wellknown.GeoJSONGeometry);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'This is a sample description.', null, coordinates, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN','1-10');
            
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should post a new document that defines a not new zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates]);
            const coordString: string= wellknown.stringify(geo as wellknown.GeoJSONGeometry);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(true);

            await expect(controller.createNode('Document1', 'This is a sample description.', null, coordinates, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(InsertZoneError);
            
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should post a new document that defines a new invalid zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates]);
            const centroid = turf.centroid(geo);
            const coordString: string= wellknown.stringify(geo as wellknown.GeoJSONGeometry);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(false);

            await expect(controller.createNode('Document1', 'This is a sample description.', null, coordinates, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(CoordinatesOutOfBoundsError);
            
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should post a new document that has specific coordinates", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates]);
            const coordString: string= wellknown.stringify(geo as wellknown.GeoJSONGeometry);
            jest.spyOn(controller as any,"checkCoordinatesValidity").mockResolvedValue(true);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'This is a sample description.', null, null, 67.85, 20.22, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN','1-10');
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should post a new document that has invalid specific coordinates", async () => {
            jest.spyOn(controller as any,"checkCoordinatesValidity").mockResolvedValue(false);
            jest.spyOn(DocumentDAO.prototype, "createDocumentNode").mockResolvedValue(1);

            await expect(controller.createNode('Document1', 'This is a sample description.', null, null, 100, 20.22, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(CoordinatesOutOfBoundsError);
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should post a new document that is refered to an existing zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geometry: Geometry= turf.geometry("Polygon", [coordinates]);
            const centroid = turf.centroid(geometry);
            const zone: Zone = new Zone(1, geometry);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'This is a sample description.', 1, null, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN','1-10');
            
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceError if parameters are not consistent", async () => {
            await expect(controller.createNode('Document1', 'This is a sample description.', null, null, null, null, 'John Doe, Jane Smith','1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(WrongGeoreferenceError);
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });
    });

    describe("updateDocumentGeorefde", () => {
        test("It should assign the document to Kiruna general area", async () => {
            jest.spyOn(DocumentDAO.prototype,"updateDocumentGeoref").mockResolvedValue(true);

            const result = await controller.updateDocumentGeoref(1, 0, null, null, null);
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocumentGeoref).toHaveBeenCalled();
        });

        test("It should assign the document to a new zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates])
            let centroid = turf.centroid(geo);
            const coordString: string= wellknown.stringify(geo as wellknown.GeoJSONGeometry);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"updateDocumentGeoref").mockResolvedValue(true);

            const result = await controller.updateDocumentGeoref(1, null, coordinates, null, null);
            
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocumentGeoref).toHaveBeenCalled();
        });

        test("It should assign the document to a not new zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates])
            let centroid = turf.centroid(geo);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(true);

            await expect(controller.updateDocumentGeoref(1, null, coordinates, null, null)).rejects.toThrow(InsertZoneError);
            
            expect(DocumentDAO.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        });

        test("It should assign the document to a new invalid zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates])
            let centroid = turf.centroid(geo);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(false);

            await expect(controller.updateDocumentGeoref(1, null, coordinates, null, null)).rejects.toThrow(CoordinatesOutOfBoundsError);
            
            expect(DocumentDAO.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        });

        test("It should assign to the document specific coordinates", async () => {
            jest.spyOn(controller as any,"checkCoordinatesValidity").mockResolvedValue(true);
            jest.spyOn(DocumentDAO.prototype,"updateDocumentGeoref").mockResolvedValue(true);
            
            const result = await controller.updateDocumentGeoref(1, null, null, 67.85, 20.22);
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocumentGeoref).toHaveBeenCalled();
        });

        test("It should post a new document that has invalid specific coordinates", async () => {
            jest.spyOn(controller as any,"checkCoordinatesValidity").mockResolvedValue(false);
            jest.spyOn(DocumentDAO.prototype,"updateDocumentGeoref").mockResolvedValue(true);

            await expect(controller.updateDocumentGeoref(1, null, null, 100, 20.22)).rejects.toThrow(CoordinatesOutOfBoundsError);
            expect(DocumentDAO.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        });

        test("It should post a new document that is refered to an existing zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= turf.geometry("Polygon", [coordinates])
            const zone: Zone = new Zone(1, geo);
            let centroid = turf.centroid(geo);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"updateDocumentGeoref").mockResolvedValue(true);

            const result = await controller.updateDocumentGeoref(1, 1, null, null, null);
            
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.updateDocumentGeoref).toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceError if parameters are not consistent", async () => {
            expect(controller.updateDocumentGeoref(1, null, null, null, null)).rejects.toThrow(WrongGeoreferenceError);
            expect(DocumentDAO.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        });

    })

    describe("getDocument", () => {
        test("It should return the requested document", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);

            const result = await controller.getDocument(1);

            expect(result).toEqual(document);
            expect(DocumentDAO.prototype.getDocumentByID).toHaveBeenCalled();
        });

        test("It should return an error if dao method returns it", async () => {
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockRejectedValue(new Error('Database error'));

            await expect(controller.getDocument(1)).rejects.toThrow(Error);
            expect(DocumentDAO.prototype.getDocumentByID).toHaveBeenCalled();
        });
    });

    describe("getDocuments", () => {
        test("It should return the requested documents", async () => {
            const document1: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            const document2: Document = new Document(2, "Documento 2", "Descrizione 2", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocsWithFilters").mockResolvedValue([document1, document2]);

            const result = await controller.getDocuments(undefined);

            expect(result).toEqual([document1, document2]);
            expect(DocumentDAO.prototype.getDocsWithFilters).toHaveBeenCalled();
        });

        test("It should return an error if dao method returns it", async () => {
            jest.spyOn(DocumentDAO.prototype,"getDocsWithFilters").mockRejectedValue(new Error('Database error'));

            await expect(controller.getDocuments(undefined)).rejects.toThrow(Error);
            expect(DocumentDAO.prototype.getDocsWithFilters).toHaveBeenCalled();
        });
    });

    describe("deleteAllDocuments", () => {
        test("It should delete all documents", async () => {
            jest.spyOn(DocumentDAO.prototype,"deleteAllDocuments").mockResolvedValue(true);

            const result = await controller.deleteAllDocuments();

            expect(result).toBe(true);
            expect(DocumentDAO.prototype.deleteAllDocuments).toHaveBeenCalled();
        });

        test("It should return an error if dao method returns it", async () => {
            jest.spyOn(DocumentDAO.prototype,"deleteAllDocuments").mockRejectedValue(new Error('Database error'));

            await expect(controller.deleteAllDocuments()).rejects.toThrow(Error);
            expect(DocumentDAO.prototype.deleteAllDocuments).toHaveBeenCalled();
        });
    });

    describe("addResource", () => {
        test("It should add a resource to a document", async () => {
            jest.spyOn(DocumentDAO.prototype,"addResource").mockResolvedValue(true);

            const result = await controller.addResource(1, ['file.txt'], ['resources/1-fileURLToPath.txt']);

            expect(result).toBe(true);
            expect(DocumentDAO.prototype.addResource).toHaveBeenCalled();
        });

        test("It should return an error if dao method returns it", async () => {
            jest.spyOn(DocumentDAO.prototype,"addResource").mockRejectedValue(new Error('Database error'));

            await expect(controller.addResource(1, ['file.txt'], ['resources/1-fileURLToPath.txt'])).rejects.toThrow(Error);
            expect(DocumentDAO.prototype.addResource).toHaveBeenCalled();
        });
    });

})

