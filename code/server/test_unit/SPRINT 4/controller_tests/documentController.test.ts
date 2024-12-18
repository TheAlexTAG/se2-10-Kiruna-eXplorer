import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import {DocumentDAO} from "../../../src/dao/documentDAO";
import {DocumentController, DocumentControllerHelper} from "../../../src/controllers/documentController";
import {CoordinatesOutOfBoundsError, WrongGeoreferenceError, InvalidPageNumberError, InvalidNewDateCoordinatesError} from "../../../src/errors/documentErrors"
import * as turf from "@turf/turf"
import { Feature, GeoJsonProperties, Geometry, Point } from "geojson"
import { ZoneDAO } from "../../../src/dao/zoneDAO";
import { Kiruna } from "../../../src/utilities";
import { InsertZoneError } from "../../../src/errors/zoneError";
import wellknown from "wellknown"
import { Zone } from "../../../src/components/zone";
import { Document, DocumentData, DocumentGeoData } from "../../../src/components/document";

jest.mock("../../../src/dao/documentDAO")
jest.mock("../../../src/dao/zoneDAO")

let controller : DocumentController;
let helper: DocumentControllerHelper;

describe("Controller document and helper unit tests", () => {

    beforeAll(() => {
        controller = new DocumentController();
        helper = new DocumentControllerHelper();
    })

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("checkCoordinatesValidity", () => {

        test("It should check if a point is in kiruna area", async () => {
            const point: Feature<Point, GeoJsonProperties> = {
                "type": "Feature",
                "geometry": {
                  "type": "Point",
                  "coordinates": [20.2253, 67.8558]
                },
                "properties": {}
            };
            jest.spyOn(turf,"point").mockReturnValue(point);
            jest.spyOn(turf,"booleanPointInPolygon").mockReturnValue(true);

            const result = await helper.checkCoordinatesValidity(20.2253, 67.8558);
            expect(result).toEqual(true);
        })
    })

    /*
    describe("nodeAssignedToKiruna", () => {

        test("It should throw an InternalServerError if Modality is not Create or Update", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 0, coordinates: null, latitude: null, longitude: null};
            await expect(helper.nodeAssignedToKiruna(documentData, documentGeoData, DocumentDAO.prototype, Modality)).rejects.toThrow(InternalServerError);
        })
        
    })

    describe("nodeAssignedToCustomZone", () => {

        test("It should throw an InternalServerError if Modality is not Create or Update", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            await expect(helper.nodeAssignedToCustomZone(documentData, documentGeoData, DocumentDAO.prototype, Modality)).rejects.toThrow(InternalServerError);
        })
        
    })

    describe("nodeAssignedToPoint", () => {

        test("It should throw an InternalServerError if Modality is not Create or Update", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.85, longitude: 20.22};
            jest.spyOn(controller as any,"checkCoordinatesValidity").mockResolvedValue(true);
            await expect(helper.nodeAssignedToCustomZone(documentData, documentGeoData, DocumentDAO.prototype, Modality)).rejects.toThrow(InternalServerError);
        })
        
    })

    describe("nodeAssignedToExistingZone", () => {

        test("It should throw an InternalServerError if Modality is not Create or Update", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 2, coordinates: null, latitude: null, longitude: null};
            const geometry: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const zone: Zone = new Zone(1, geometry);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            await expect(helper.nodeAssignedToCustomZone(documentData, documentGeoData, DocumentDAO.prototype, Modality)).rejects.toThrow(InternalServerError);
        })
        
    })*/

    describe("createNode", () => {

        test("It should post a new document that is assigned to Kiruna general area", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 0, coordinates: null, latitude: null, longitude: null};
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode(documentData, documentGeoData);
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should post a new document that defines a new custom zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode(documentData, documentGeoData);
            
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should return InsertZoneError if the new document defines a not new zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(true);

            await expect(controller.createNode(documentData, documentGeoData)).rejects.toThrow(InsertZoneError);
            
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should return CoordinatesOutOfBoundsError if the new document defines a new invalid zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(false);

            await expect(controller.createNode(documentData, documentGeoData)).rejects.toThrow(CoordinatesOutOfBoundsError);
            
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should post a new document that has specific coordinates", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.85, longitude: 20.22};
            jest.spyOn(DocumentControllerHelper.prototype,"checkCoordinatesValidity").mockResolvedValue(true);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode(documentData, documentGeoData);
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should return CoordinatesOutOfBoundsError if the new document has invalid specific coordinates", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 100, longitude: 20.22};
            jest.spyOn(DocumentControllerHelper.prototype,"checkCoordinatesValidity").mockResolvedValue(false);

            await expect(controller.createNode(documentData, documentGeoData)).rejects.toThrow(CoordinatesOutOfBoundsError);
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });
        
        test("It should post a new document that is refered to an existing zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const geometry: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const zone: Zone = new Zone(1, geometry);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode(documentData, documentGeoData);
            
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceError if parameters are not consistent", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: null, longitude: null};
            await expect(controller.createNode(documentData, documentGeoData)).rejects.toThrow(WrongGeoreferenceError);
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });
    });

    describe("updateDocument", () => {

        test("It should update a document that is assigned to Kiruna general area", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 0, coordinates: null, latitude: null, longitude: null};
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(DocumentDAO.prototype,"updateDocument").mockResolvedValue(true);

            const result = await controller.updateDocument(documentData, documentGeoData);
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocument).toHaveBeenCalledWith(documentData, documentGeoData, true);
        });

        test("It should update a document that defines a new custom zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"updateDocument").mockResolvedValue(true);

            const result = await controller.updateDocument(documentData, documentGeoData);
            
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocument).toHaveBeenCalledWith(documentData, documentGeoData, true);
        });

        test("It should return InsertZoneError if the document defines a not new zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(true);

            await expect(controller.updateDocument(documentData, documentGeoData)).rejects.toThrow(InsertZoneError);
            
            expect(DocumentDAO.prototype.updateDocument).not.toHaveBeenCalled();
        });

        test("It should return CoordinatesOutOfBoundsError if the document defines a new invalid zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const coordinates: [number, number][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const geo: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const coordString: string= "POLYGON ((67.86 20.225, 67.86 20.23, 67.855 20.235, 67.85 20.23, 67.85 20.22, 67.855 20.215, 67.86 20.225))";
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(turf,"geometry").mockReturnValue(geo);
            jest.spyOn(wellknown,"stringify").mockReturnValue(coordString);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(false);

            await expect(controller.updateDocument(documentData, documentGeoData)).rejects.toThrow(CoordinatesOutOfBoundsError);
            
            expect(DocumentDAO.prototype.updateDocument).not.toHaveBeenCalled();
        });

        test("It should update a document that has specific coordinates", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 67.85, longitude: 20.22};
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(DocumentControllerHelper.prototype,"checkCoordinatesValidity").mockResolvedValue(true);
            jest.spyOn(DocumentDAO.prototype,"updateDocument").mockResolvedValue(true);

            const result = await controller.updateDocument(documentData, documentGeoData);
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocument).toHaveBeenCalledWith(documentData, documentGeoData, true);
        });

        test("It should return CoordinatesOutOfBoundsError if the document has invalid specific coordinates", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: 100, longitude: 20.22};
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(DocumentControllerHelper.prototype,"checkCoordinatesValidity").mockResolvedValue(false);

            await expect(controller.updateDocument(documentData, documentGeoData)).rejects.toThrow(CoordinatesOutOfBoundsError);
            expect(DocumentDAO.prototype.updateDocument).not.toHaveBeenCalled();
        });
        
        test("It should update a document that is refered to an existing zone", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const geometry: Geometry= {
                type: 'Polygon',
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
            };
            const centroid: Feature<Point, GeoJsonProperties> = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [67.8550, 20.2250]
                },
                properties: {}
            };
            const zone: Zone = new Zone(1, geometry);
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);
            jest.spyOn(turf,"centroid").mockReturnValue(centroid);
            jest.spyOn(DocumentDAO.prototype,"updateDocument").mockResolvedValue(true);

            const result = await controller.updateDocument(documentData, documentGeoData);
            
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocument).toHaveBeenCalledWith(documentData, documentGeoData, true);
        });

        test("It should return WrongGeoreferenceError if parameters are not consistent", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 2, coordinates: null, latitude: 88.76, longitude: null};
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            await expect(controller.updateDocument(documentData, documentGeoData)).rejects.toThrow(WrongGeoreferenceError);
            expect(DocumentDAO.prototype.updateDocument).not.toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceError if parameters are not consistent", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: null, latitude: null, longitude: null};
            const date: Date = new Date(2023, 0, 2);
            jest.spyOn(DocumentDAO.prototype,"getParsedDate").mockResolvedValue(date);
            jest.spyOn(DocumentDAO.prototype,"updateDocument").mockResolvedValue(true);
            
            const result = await controller.updateDocument(documentData, documentGeoData);
            
            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDocument).toHaveBeenCalledWith(documentData, documentGeoData);
        });
    });

    describe("getDocument", () => {
        test("It should return the requested document", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
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
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento 2",
                description: "Descrizione 2",
                stakeholders: "Stakeholders 2",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
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


    describe("getDocumentsWithPagination", () => {
        test("It should return the requested documents", async () => {
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento 2",
                description: "Descrizione 2",
                stakeholders: "Stakeholders 2",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocsWithFilters").mockResolvedValue([document1, document2]);
            const expectedResult = {
                documents: [document1, document2],
                totalItems: 2,
                itemsPerPage: 2,
                currentPage: 1,
                totalPages: 1
            }

            const result = await controller.getDocumentsWithPagination(undefined, 1, 2);

            expect(result).toEqual(expectedResult);
            expect(DocumentDAO.prototype.getDocsWithFilters).toHaveBeenCalled();
        });

        test("It should return an empty list if there are no documents", async () => {
            const expectedResult = {
                documents: [],
                totalItems: 0,
                itemsPerPage: 5,
                currentPage: 2,
                totalPages: 0
            }
            jest.spyOn(DocumentDAO.prototype,"getDocsWithFilters").mockResolvedValue([]);

            const result = await controller.getDocumentsWithPagination(undefined, 2, 5);

            expect(result).toEqual(expectedResult);
            expect(DocumentDAO.prototype.getDocsWithFilters).toHaveBeenCalled();
        });

        test("It should return InvalidPageNumberError if pageNumber>totalPages", async () => {
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento 2",
                description: "Descrizione 2",
                stakeholders: "Stakeholders 2",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocsWithFilters").mockResolvedValue([document1, document2]);

            await expect(controller.getDocumentsWithPagination(undefined, 3, 2)).rejects.toThrow(InvalidPageNumberError);
            expect(DocumentDAO.prototype.getDocsWithFilters).toHaveBeenCalled();
        });
    });

    describe("getStakeholders", () => {

        test("It should return the list of all the stakeholders", async () => {
            const stakeholders: string[] = ['stakeholders1', 'stakeholders2', 'stakeholders3'];
            jest.spyOn(DocumentDAO.prototype, 'getStakeholders').mockResolvedValue(stakeholders);

            const result = await controller.getStakeholders();

            expect(result).toEqual(stakeholders);
            expect(DocumentDAO.prototype.getStakeholders).toHaveBeenCalled();
        });

        test("It should return 500 code if a generic error occurs", async () => {
            jest.spyOn(DocumentDAO.prototype, 'getStakeholders').mockRejectedValue(new Error);

            await expect(controller.getStakeholders()).rejects.toThrow(Error);
        });
    })

    describe("updateDiagramDate", () => {

        test("It should update the parseDate of the document having a month as issuanceDate", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            const result = await controller.updateDiagramDate(1, '2023-01-12');

            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDiagramDate).toHaveBeenCalled();
        });

        test("It should update the parseDate of the document having a year as issuanceDate", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            const result = await controller.updateDiagramDate(1, '2023-01-12');

            expect(result).toEqual(true);
            expect(DocumentDAO.prototype.updateDiagramDate).toHaveBeenCalled();
        });

        test("It should return InvalidNewDateCoordinatesError having a not matching issuanceDate", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "abc",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            await expect(controller.updateDiagramDate(1,'2023-01-12')).rejects.toThrow(InvalidNewDateCoordinatesError);
            expect(DocumentDAO.prototype.updateDiagramDate).not.toHaveBeenCalled();
        });

        test("It should return InvalidNewDateCoordinatesError if the parseDate is empty", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            await expect(controller.updateDiagramDate(1, '')).rejects.toThrow(InvalidNewDateCoordinatesError);
            expect(DocumentDAO.prototype.updateDiagramDate).not.toHaveBeenCalled();
        });

        test("It should return InvalidNewDateCoordinatesError if the parseDate is not in a valid format", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            await expect(controller.updateDiagramDate(1, '02/01/2023')).rejects.toThrow(InvalidNewDateCoordinatesError);
            expect(DocumentDAO.prototype.updateDiagramDate).not.toHaveBeenCalled();
        });

        test("It should return InvalidNewDateCoordinatesError if the parseDate is not in a valid", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            };
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);
            jest.spyOn(DocumentDAO.prototype,"getDocumentByID").mockResolvedValue(document);
            jest.spyOn(DocumentDAO.prototype, 'updateDiagramDate').mockResolvedValue(true);

            await expect(controller.updateDiagramDate(1, '2023-01-02')).rejects.toThrow(InvalidNewDateCoordinatesError);
            expect(DocumentDAO.prototype.updateDiagramDate).not.toHaveBeenCalled();
        });
    })

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

