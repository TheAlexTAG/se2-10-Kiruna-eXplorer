import { test, expect, jest, beforeAll, beforeEach, afterAll , describe} from "@jest/globals"
import { DocumentDAO} from "../../src/dao/documentDAO"
import db, {closeDbPool} from "../../src/db/db"
import * as wellknown from "wellknown"
import { server } from "../../index"
import { cleanup } from "../../src/db/cleanup"
import { Zone } from "../../src/components/zone"
import { Document, DocumentData, DocumentEditData, DocumentGeoData } from "../../src/components/document" 
import * as turf from "@turf/turf"
import { ZoneDAO } from "../../src/dao/zoneDAO"
import { DocumentNotFoundError } from "../../src/errors/documentErrors"
import { InternalServerError } from "../../src/errors/link_docError"

const zones = [
    new Zone(1, {
        "type": "Polygon",
        "coordinates": [
            [
                [20.20639122940088, 67.85862825793728],
                [20.212732618595822, 67.85544133829652],
                [20.2171523747011, 67.85080504114305],
                [20.222148620732355, 67.8361656811918],
                [20.234831399121163, 67.83587570012043],
                [20.24309442140475, 67.85167441707196],
                [20.218689681172407, 67.86319058909814],
                [20.20735204594621, 67.86181474199265],
                [20.20639122940088, 67.85862825793728]
            ]
        ]
    }),
    new Zone(2, {
        "type": "Polygon",
        "coordinates": [
            [
                [20.297700126524404, 67.84836506650316],
                [20.308609676379803, 67.84813966568689],
                [20.30905801404529, 67.84943569063643],
                [20.3058449274441, 67.84912577817789],
                [20.30382740795031, 67.85022454013173],
                [20.299045139520757, 67.84943569063643],
                [20.298970416576225, 67.84909760411387],
                [20.297700126524404, 67.84904125588358],
                [20.297700126524404, 67.84836506650316]
            ]
        ]
    })
];

const centroids = zones.map(zone => turf.centroid(zone.coordinates));

const documents = [
    new Document(
        {
            documentID: 1, 
            title: "doc1", 
            description: "desc1", 
            stakeholders: "stakeholder1", 
            scale: "1:15,000", 
            issuanceDate: "2024", 
            parsedDate: new Date("2024-01-01"),
            type: "Prescriptive doc.",
            language: null,
            pages: null
        } as DocumentData,
        {
            zoneID: 1,
            coordinates: null,
            latitude: centroids[0].geometry.coordinates[1],
            longitude: centroids[0].geometry.coordinates[0]
        } as DocumentGeoData,
        0
    ),
    new Document(
        {
            documentID: 2, 
            title: "doc2", 
            description: "desc2", 
            stakeholders: "stakeholder1", 
            scale: "1:15,000", 
            issuanceDate: "07/2024", 
            parsedDate: new Date("2024-07-01"),
            type: "Design doc.",
            language: null,
            pages: null
        } as DocumentData,
        {
            zoneID: 1,
            coordinates: null,
            latitude: centroids[0].geometry.coordinates[1],
            longitude: centroids[0].geometry.coordinates[0]
        } as DocumentGeoData,
        0
    ),
    new Document(
        {
            documentID: 3, 
            title: "doc3", 
            description: "desc3", 
            stakeholders: "stakeholder3", 
            scale: "1:12,000", 
            issuanceDate: "15/07/2024", 
            parsedDate: new Date("2024-07-01"),
            type: "Technical doc.",
            language: null,
            pages: null
        } as DocumentData,
        {
            zoneID: null,
            coordinates: null,
            latitude: null,
            longitude: null
        } as DocumentGeoData,
        0
    ), 
]

beforeAll(async() => {
    await cleanup();
    let conn;
    try {
        conn = await db.getConnection();
        
        const zoneSQL = `INSERT INTO zone(coordinates) VALUES ( ? );`
        const zoneParams = zones.map((zone) => [wellknown.stringify(zone.coordinates as wellknown.GeoJSONGeometry)]);
        await conn.batch(zoneSQL, zoneParams);

        const documentSQL = `INSERT INTO document(title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, parsedDate, type, language, pages)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const documentParams = documents.map(doc => [
            doc.title,
            doc.description,
            doc.zoneID,
            doc.latitude,
            doc.longitude,
            doc.stakeholders,
            doc.scale,
            doc.issuanceDate,
            doc.parsedDate,
            doc.type,
            doc.language,
            doc.pages
        ])

        await conn.batch(documentSQL, documentParams);
    } finally {
        conn?.release();
    }
})

beforeEach(() => {
    jest.clearAllMocks();
})

afterAll(async() => {
    await closeDbPool();
    server.close();
})

describe("DocumentDAO integration test suite", () => {

    describe("documentExists test cases", () => {

        test("It should return true", async() => {
            jest.spyOn(DocumentDAO, "documentExists")
            const response = await DocumentDAO.documentExists(documents[0].id);
            expect(response).toBe(true);
        })

        test("It should return false", async() => {
            jest.spyOn(DocumentDAO, "documentExists")
            const response = await DocumentDAO.documentExists(25);
            expect(response).toBe(false);
        })
    })

    describe("createDocumentNode test cases", () => {
        
        const dao = new DocumentDAO();

        test("Assigned to entire Kiruna. It should return the new document ID", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentData = {
                documentID: 0,
                title: "trial title",
                description: "trial title",
                stakeholders: "trial stakeholders",
                scale: "1:1,000",
                issuanceDate: "2004",
                parsedDate: new Date("2004-01-01"),
                type: "Design doc.",
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: null,
                latitude: null,
                longitude: null
            }

            const response = await dao.createDocumentNode(documentData, documentGeoData);
            expect(response).toBe(documents[documents.length - 1].id + 1);
            
            const document = await dao.getDocumentByID(response);
            expect(document).toBeDefined();
            expect(document.id).toEqual(response);
            expect(document.title).toEqual(documentData.title);
            expect(document.description).toEqual(documentData.description);
            expect(document.stakeholders).toEqual(documentData.stakeholders);
            expect(document.scale).toEqual(documentData.scale);
            expect(document.issuanceDate).toEqual(documentData.issuanceDate);
            expect(document.parsedDate).toEqual(documentData.parsedDate);
            expect(document.type).toEqual(documentData.type);
            expect(document.language).toEqual(documentData.language);
            expect(document.pages).toEqual(documentData.pages);
            expect(document.zoneID).toEqual(0);
            expect(document.latitude).toEqual(documentGeoData.latitude);
            expect(document.longitude).toEqual(documentGeoData.longitude);
        })

        test("Assigned to a custom zone. It should return the new document ID", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentData = {
                documentID: 0,
                title: "trial title",
                description: "trial title",
                stakeholders: "trial stakeholders",
                scale: "1:1,000",
                issuanceDate: "2004",
                parsedDate: new Date("2004-01-01"),
                type: "Design doc.",
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: wellknown.stringify({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [20.20639122940088, 67.85862825793728],
                            [20.212732618595822, 67.85544133829652],
                            [20.2171523747011, 67.85080504114305],
                            [20.222148620732355, 67.8361656811918],
                            [20.234831399121163, 67.83587570012043],
                            [20.24309442140475, 67.85167441707196],
                            [20.218689681172407, 67.86319058909814],
                            [20.20639122940088, 67.85862825793728]
                        ]
                    ]
                }),
                latitude: 67.85025443212274,
                longitude: 20.22214862073264
            }

            const response = await dao.createDocumentNode(documentData, documentGeoData);
            expect(response).toBe(documents[documents.length - 1].id + 2);

            const document = await dao.getDocumentByID(response);
            const zone = await ZoneDAO.prototype.getZone(zones[zones.length - 1].id + 2);
            const centroid = turf.centroid(zone.coordinates);

            expect(document).toBeDefined();
            expect(document.id).toEqual(response);
            expect(document.title).toEqual(documentData.title);
            expect(document.description).toEqual(documentData.description);
            expect(document.stakeholders).toEqual(documentData.stakeholders);
            expect(document.scale).toEqual(documentData.scale);
            expect(document.issuanceDate).toEqual(documentData.issuanceDate);
            expect(document.parsedDate).toEqual(documentData.parsedDate);
            expect(document.type).toEqual(documentData.type);
            expect(document.language).toEqual(documentData.language);
            expect(document.pages).toEqual(documentData.pages);
            expect(document.zoneID).toEqual(zone.id);
            expect(document.latitude).toEqual(centroid.geometry.coordinates[1]);
            expect(document.longitude).toEqual(centroid.geometry.coordinates[0]);
        })

        test("Assigned to a point. It should return the new document ID", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentData = {
                documentID: 0,
                title: "trial title",
                description: "trial title",
                stakeholders: "trial stakeholders",
                scale: "1:1,000",
                issuanceDate: "2004",
                parsedDate: new Date("2004-01-01"),
                type: "Design doc.",
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: null,
                latitude: 67.85025443212274,
                longitude: 20.22214862073264
            }

            const response = await dao.createDocumentNode(documentData, documentGeoData);
            expect(response).toBe(documents[documents.length - 1].id + 3);

            const document = await dao.getDocumentByID(response);

            expect(document).toBeDefined();
            expect(document.id).toEqual(response);
            expect(document.title).toEqual(documentData.title);
            expect(document.description).toEqual(documentData.description);
            expect(document.stakeholders).toEqual(documentData.stakeholders);
            expect(document.scale).toEqual(documentData.scale);
            expect(document.issuanceDate).toEqual(documentData.issuanceDate);
            expect(document.parsedDate).toEqual(documentData.parsedDate);
            expect(document.type).toEqual(documentData.type);
            expect(document.language).toEqual(documentData.language);
            expect(document.pages).toEqual(documentData.pages);
            expect(document.zoneID).toEqual(documentGeoData.zoneID);
            expect(document.latitude).toEqual(documentGeoData.latitude);
            expect(document.longitude).toEqual(documentGeoData.longitude);
        })
    })

    describe("updateDocument test cases", () => {
        const dao = new DocumentDAO();

        test("No georef edit. It should return true", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentEditData = {
                documentID: 1,
                title: "updated title",
                description: "updated description",
                stakeholders: "updated stakeholder",
                scale: "1:5,000",
                issuanceDate: "12/07/2015",
                parsedDate: new Date("2015-07-12"),
                type: "Design doc.",
                language: "Swedish",
                pages: "15-17"
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: null,
                latitude: null,
                longitude: null
            }

            const oldDocument = await dao.getDocumentByID(documentData.documentID);

            const response = await dao.updateDocument(documentData, documentGeoData);
            expect(response).toBe(true);
            
            const document = await dao.getDocumentByID(documentData.documentID);
            expect(document).toBeDefined();
            expect(document.id).toEqual(documentData.documentID);
            expect(document.title).toEqual(documentData.title);
            expect(document.description).toEqual(documentData.description);
            expect(document.stakeholders).toEqual(documentData.stakeholders);
            expect(document.scale).toEqual(documentData.scale);
            expect(document.issuanceDate).toEqual(documentData.issuanceDate);
            expect(document.parsedDate).toEqual(documentData.parsedDate);
            expect(document.type).toEqual(documentData.type);
            expect(document.language).toEqual(documentData.language);
            expect(document.pages).toEqual(documentData.pages);
            expect(document.zoneID).toEqual(oldDocument.zoneID);
            expect(document.latitude).toEqual(oldDocument.latitude);
            expect(document.longitude).toEqual(oldDocument.longitude);
        })

        test("Georef edit, existing zone and less document edit data. It should return true", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentEditData = {
                documentID: 2,
                title: "updated title",
                description: "updated description",
                stakeholders: null,
                scale: null,
                issuanceDate: null,
                parsedDate: null,
                type: "Design doc.",
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: 2,
                coordinates: null,
                latitude: centroids[1].geometry.coordinates[1],
                longitude: centroids[1].geometry.coordinates[0]
            }

            const oldDocument = await dao.getDocumentByID(documentData.documentID);

            const response = await dao.updateDocument(documentData, documentGeoData, true);
            expect(response).toBe(true);
            
            const document = await dao.getDocumentByID(documentData.documentID);

            expect(document).toBeDefined();
            expect(document.id).toEqual(documentData.documentID);
            expect(document.title).toEqual(documentData.title);
            expect(document.description).toEqual(documentData.description);
            expect(document.stakeholders).toEqual(oldDocument.stakeholders);
            expect(document.scale).toEqual(oldDocument.scale);
            expect(document.issuanceDate).toEqual(oldDocument.issuanceDate);
            expect(document.parsedDate).toEqual(oldDocument.parsedDate);
            expect(document.type).toEqual(documentData.type);
            expect(document.language).toEqual(oldDocument.language);
            expect(document.pages).toEqual(oldDocument.pages);
            expect(document.zoneID).toEqual(documentGeoData.zoneID);
            expect(document.latitude).toEqual(documentGeoData.latitude);
            expect(document.longitude).toEqual(documentGeoData.longitude);
        })

        test("Georef edit, custom zone. It should return true", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentEditData = {
                documentID: 2,
                title: null,
                description: null,
                stakeholders: null,
                scale: null,
                issuanceDate: null,
                parsedDate: null,
                type: null,
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: wellknown.stringify({
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [20.20639122940088, 67.85862825793728],
                            [20.212732618595822, 67.85544133829652],
                            [20.2171523747011, 67.85080504114305],
                            [20.222148620732355, 67.8361656811918],
                            [20.234831399121163, 67.83587570012043],
                            [20.20639122940088, 67.85862825793728]
                        ]
                    ]
                }),
                latitude: 67.84738320373782,
                longitude: 20.218651248510263
            }

            const oldDocument = await dao.getDocumentByID(documentData.documentID);

            const response = await dao.updateDocument(documentData, documentGeoData, true);
            expect(response).toBe(true);
            
            const document = await dao.getDocumentByID(documentData.documentID);
            const zone = await ZoneDAO.prototype.getZone(zones[zones.length - 1].id + 3)

            expect(document).toBeDefined();
            expect(document.id).toEqual(documentData.documentID);
            expect(document.title).toEqual(oldDocument.title);
            expect(document.description).toEqual(oldDocument.description);
            expect(document.stakeholders).toEqual(oldDocument.stakeholders);
            expect(document.scale).toEqual(oldDocument.scale);
            expect(document.issuanceDate).toEqual(oldDocument.issuanceDate);
            expect(document.parsedDate).toEqual(oldDocument.parsedDate);
            expect(document.type).toEqual(oldDocument.type);
            expect(document.language).toEqual(oldDocument.language);
            expect(document.pages).toEqual(oldDocument.pages);
            expect(document.zoneID).toEqual(zone.id);
            expect(document.latitude).toEqual(documentGeoData.latitude);
            expect(document.longitude).toEqual(documentGeoData.longitude);
        })

        test("Georef edit, point. It should return true", async() => {
            jest.spyOn(dao, "createDocumentNode");

            const documentData: DocumentEditData = {
                documentID: 2,
                title: null,
                description: null,
                stakeholders: null,
                scale: null,
                issuanceDate: null,
                parsedDate: null,
                type: null,
                language: null,
                pages: null
            }
            const documentGeoData: DocumentGeoData = {
                zoneID: null,
                coordinates: null,
                latitude: 68,
                longitude: 22
            }

            const oldDocument = await dao.getDocumentByID(documentData.documentID);

            const response = await dao.updateDocument(documentData, documentGeoData, true);
            expect(response).toBe(true);
            
            const document = await dao.getDocumentByID(documentData.documentID);

            expect(document).toBeDefined();
            expect(document.id).toEqual(documentData.documentID);
            expect(document.title).toEqual(oldDocument.title);
            expect(document.description).toEqual(oldDocument.description);
            expect(document.stakeholders).toEqual(oldDocument.stakeholders);
            expect(document.scale).toEqual(oldDocument.scale);
            expect(document.issuanceDate).toEqual(oldDocument.issuanceDate);
            expect(document.parsedDate).toEqual(oldDocument.parsedDate);
            expect(document.type).toEqual(oldDocument.type);
            expect(document.language).toEqual(oldDocument.language);
            expect(document.pages).toEqual(oldDocument.pages);
            expect(document.zoneID).toEqual(documentGeoData.zoneID);
            expect(document.latitude).toEqual(documentGeoData.latitude);
            expect(document.longitude).toEqual(documentGeoData.longitude);
        })
    })

    describe("getDocsWithFilters test cases", () => {
        const dao = new DocumentDAO();

        test("it Should return all documents", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any[] = [];

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(documents.length + 3);
        })

        test("It should return all documents respecting the filters", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any = {
                title: "do"
            }

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(1);
            expect(response[0].title.includes(filters.title)).toBe(true);
        })

        test("It should return all documents respecting the filters", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any = {
                description: "descr"
            }

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(2);
            response.forEach(res => expect(res.description.includes(filters.description)).toBe(true))
        })

        test("It should return all documents respecting the filters", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any = {
                zoneID: 1
            }

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(1);
            expect(response[0].zoneID).toBe(filters.zoneID);
        })

        test("It should return all documents respecting the filters", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any = {
                stakeholders: "stakeholder3"
            }

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(1);
            expect(response[0].stakeholders.includes(filters.stakeholders)).toBe(true);
        })

        test("It should return all documents respecting the filters", async() => {
            jest.spyOn(dao, "getDocsWithFilters");

            const filters: any = {
                scale: "1:12,000"
            }

            const response = await dao.getDocsWithFilters(filters);
            expect(response).toBeDefined();
            expect(response.length).toBe(1);
            expect(response[0].scale).toEqual(filters.scale);
        })
    })

    describe("getDocumentByID test cases", () => {
        const dao = new DocumentDAO();

        test("It should return the right document", async() => {
            jest.spyOn(dao, "getDocumentByID");

            const document = documents[2];

            const response = await dao.getDocumentByID(document.id);

            expect(response).toBeDefined;
            expect(response.id).toEqual(document.id);
            expect(response.title).toEqual(document.title);
            expect(response.description).toEqual(document.description);
            expect(response.stakeholders).toEqual(document.stakeholders);
            expect(response.scale).toEqual(document.scale);
            expect(response.issuanceDate).toEqual(document.issuanceDate);
            expect(response.parsedDate).toEqual(document.parsedDate);
            expect(response.type).toEqual(document.type);
            expect(response.language).toEqual(document.language);
            expect(response.pages).toEqual(document.pages);
            expect(response.zoneID).toEqual(document.zoneID? document.zoneID : 0);
            expect(response.latitude).toEqual(document.latitude);
            expect(response.longitude).toEqual(document.longitude);
        })

        test("It should reject DocumentNotFoundError", async() => {
            jest.spyOn(dao, "getDocumentByID");

            await expect(dao.getDocumentByID(25)).rejects.toThrow(DocumentNotFoundError);
        })
    })

    describe("getStakeholders test cases", () => {
        const dao = new DocumentDAO();

        test("it should return a list of custom stakeholders", async() => {
            jest.spyOn(dao, "getStakeholders");
            const stakeholders = [
                'updated stakeholder',
                'stakeholder1',
                'stakeholder3',
                'trial stakeholders'
            ]

            const response = await dao.getStakeholders();
            expect(response).toBeDefined();
            expect(response).toEqual(stakeholders);
        })
    })

    describe("updateDiagramDate test cases", () => {
        const dao = new DocumentDAO();

        test("It should return true", async() => {
            jest.spyOn(dao, "updateDiagramDate");

            const parsedDate = "2004-07-05";

            const response = await dao.updateDiagramDate(2, parsedDate);
            
            const document = await dao.getDocumentByID(2);

            expect(response).toBeDefined();
            expect(response).toBe(true);
            expect(document.parsedDate.toISOString().split("T")[0]).toEqual(parsedDate);
        })

        test("It should throw an Error", async() => {
            jest.spyOn(dao, "updateDiagramDate");

            const parsedDate = "2004-07-05";

            await expect(dao.updateDiagramDate(25, parsedDate)).rejects.toThrow(InternalServerError);
        })
    })

    describe("addResource test cases", () => {
        const dao = new DocumentDAO();

        test("It should return true", async() => {
            jest.spyOn(dao, "addResource")
            const resource = {
                documentID: 1,
                names: [
                    "res name"
                ],
                paths: [
                    "res path"
                ]
            }
            const response = await dao.addResource(resource.documentID, resource.names, resource.paths);
            const document = await dao.getDocumentByID(resource.documentID);

            expect(response).toBe(true);
            
            expect(document.resource.length).toBe(1);
            expect(document.resource[0].name).toEqual(resource.names[0]);
            expect(document.resource[0].path).toEqual(resource.paths[0]);
        })
    })

    describe("getParsedDate test cases", () => {
        const dao = new DocumentDAO();

        test("It should return the right date", async() => {
            jest.spyOn(dao, "getParsedDate");

            const document = await dao.getDocumentByID(1);
            const response = await dao.getParsedDate(1);

            expect(response).toEqual(document.parsedDate);
        })
    })

    describe("deleteAllDocuments test cases", () => {
        const dao = new DocumentDAO();

        test("It should return true", async() => {
            jest.spyOn(dao, "deleteAllDocuments");

            await dao.deleteAllDocuments();
            const documents = await dao.getDocsWithFilters({});

            expect(documents.length).toBe(0);
        })
    })
})