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
import { InsertZoneError } from "../../src/errors/zoneError"

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
        const zoneParams = zones.map((zone) => {console.log(zone); return [wellknown.stringify(zone.coordinates as wellknown.GeoJSONGeometry)]});
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

        const response = await conn.batch(documentSQL, documentParams);
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
})