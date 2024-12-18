import { describe, test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { DocumentController } from "../../src/controllers/documentController";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { DocumentData, DocumentGeoData } from "../../src/components/document";

const baseURL: string= "/api";
let documentController: DocumentController;

const urbanPlanner = { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD};
let upCookie: string;

const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
};

beforeEach(async () => {
    await cleanup();
});

beforeAll(async () => {
    documentController = new DocumentController();
});

afterAll(async () => {
    await cleanup();
    server.close();
    await closeDbPool();
})


describe("Document integration test from controller to db", () => {
    
    describe("createNode", () => {

        test("It should post a new document that is assigned to Kiruna general area", async () => {
            const documentData : DocumentData = {
                documentID: 0,
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
            const documentID = await documentController.createNode(documentData, documentGeoData);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(0);
            expect(document.body.latitude).toBe(null);
            expect(document.body.longitude).toBe(null);
        })

        test("It should post a new document that defines a new custom zone", async () => {
            const documentData : DocumentData = {
                documentID: 0,
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
            const coordinates: [number, number][] = [
                [20.20639122940088, 67.85862825793728],
                [20.212732618595822, 67.85544133829652],
                [20.2171523747011, 67.85080504114305],
                [20.222148620732355, 67.8361656811918],
                [20.234831399121163, 67.83587570012043],
                [20.24309442140475, 67.85167441707196],
                [20.218689681172407, 67.86319058909814],
                [20.20735204594621, 67.86181474199265],
                [20.20639122940088, 67.85862825793728]
            ];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const documentID = await documentController.createNode(documentData, documentGeoData);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(typeof document.body.zoneID).toBe('number');
            expect(typeof document.body.latitude).toBe('number');
            expect(typeof document.body.longitude).toBe('number');
        })

        test("It should post a new document that is assigned to a point", async () => {
            const documentData : DocumentData = {
                documentID: 0,
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
            const documentID = await documentController.createNode(documentData, documentGeoData);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(null);
            expect(document.body.latitude).toBe(67.85);
            expect(document.body.longitude).toBe(20.22);
        })

        test("It should post a new document that is refered to an existing zone", async () => {
            upCookie = await login(urbanPlanner);
            const coordinates: [number, number][] = [
                [20.20639122940088, 67.85862825793728],
                [20.212732618595822, 67.85544133829652],
                [20.2171523747011, 67.85080504114305],
                [20.222148620732355, 67.8361656811918],
                [20.234831399121163, 67.83587570012043],
                [20.24309442140475, 67.85167441707196],
                [20.218689681172407, 67.86319058909814],
                [20.20735204594621, 67.86181474199265],
                [20.20639122940088, 67.85862825793728] 
            ];
            const documentPrevious = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: coordinates};
            const documentPreviousID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentPrevious).expect(200)).body;
            const zoneID = (await request(app).get(`${baseURL}/document/${documentPreviousID}`).expect(200)).body.zoneID;

            const documentData : DocumentData = {
                documentID: 0,
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
            const documentGeoData: DocumentGeoData = {zoneID: zoneID, coordinates: null, latitude: null, longitude: null};
            const documentID = await documentController.createNode(documentData, documentGeoData);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(zoneID);
            expect(typeof document.body.latitude).toBe('number');
            expect(typeof document.body.longitude).toBe('number');
        })

    })

    describe("updateDocument", () => {

        test("It should update a document that is assigned to Kiruna general area", async () => {
            upCookie = await login(urbanPlanner);
            const documentPrevious = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentPrevious).expect(200)).body;
           
            const documentData : DocumentData = {
                documentID: documentID,
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
            const updated = await documentController.updateDocument(documentData, documentGeoData);
            expect(updated).toBe(true);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(0);
            expect(document.body.latitude).toBe(null);
            expect(document.body.longitude).toBe(null);
        })

        test("It should update a document that defines a new custom zone", async () => {
            upCookie = await login(urbanPlanner);
            const documentPrevious = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentPrevious).expect(200)).body;

            const documentData : DocumentData = {
                documentID: documentID,
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
            const coordinates: [number, number][] = [
                [20.20639122940088, 67.85862825793728],
                [20.212732618595822, 67.85544133829652],
                [20.2171523747011, 67.85080504114305],
                [20.222148620732355, 67.8361656811918],
                [20.234831399121163, 67.83587570012043],
                [20.24309442140475, 67.85167441707196],
                [20.218689681172407, 67.86319058909814],
                [20.20735204594621, 67.86181474199265],
                [20.20639122940088, 67.85862825793728]
            ];
            const documentGeoData: DocumentGeoData = {zoneID: null, coordinates: coordinates, latitude: null, longitude: null};
            const updated = await documentController.updateDocument(documentData, documentGeoData);
            expect(updated).toBe(true);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(typeof document.body.zoneID).toBe('number');
            expect(typeof document.body.latitude).toBe('number');
            expect(typeof document.body.longitude).toBe('number');
        })

        test("It should update a document that is assigned to a point", async () => {
            upCookie = await login(urbanPlanner);
            const documentPrevious = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentPrevious).expect(200)).body;

            const documentData : DocumentData = {
                documentID: documentID,
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
            const updated = await documentController.updateDocument(documentData, documentGeoData);
            expect(updated).toBe(true);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(null);
            expect(document.body.latitude).toBe(67.85);
            expect(document.body.longitude).toBe(20.22);
        })

        test("It update a document that is refered to an existing zone", async () => {
            upCookie = await login(urbanPlanner);
            const coordinates: [number, number][] = [
                [20.20639122940088, 67.85862825793728],
                [20.212732618595822, 67.85544133829652],
                [20.2171523747011, 67.85080504114305],
                [20.222148620732355, 67.8361656811918],
                [20.234831399121163, 67.83587570012043],
                [20.24309442140475, 67.85167441707196],
                [20.218689681172407, 67.86319058909814],
                [20.20735204594621, 67.86181474199265],
                [20.20639122940088, 67.85862825793728] 
            ];
            const documentOther = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: coordinates};
            const documentOtherID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentOther).expect(200)).body;
            const zoneID = (await request(app).get(`${baseURL}/document/${documentOtherID}`).expect(200)).body.zoneID;

            const documentPrevious = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(documentPrevious).expect(200)).body;

            const documentData : DocumentData = {
                documentID: documentID,
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
            const documentGeoData: DocumentGeoData = {zoneID: zoneID, coordinates: null, latitude: null, longitude: null};
            const updated = await documentController.updateDocument(documentData, documentGeoData);
            expect(updated).toBe(true);
           
            const document = await request(app).get(`${baseURL}/document/${documentID}`).expect(200);
            expect(document.body.zoneID).toBe(zoneID);
            expect(typeof document.body.latitude).toBe('number');
            expect(typeof document.body.longitude).toBe('number');
        })
    })

    describe("getDocument", () => {

        test("It should return the requested document", async () => {
            upCookie = await login(urbanPlanner);
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(document).expect(200)).body;

            const response = await documentController.getDocument(documentID);
            expect(response.id).toBe(documentID);
        })
    })

    describe("getDocuments", () => {

        test("It should return all the requested documents", async () => {
            upCookie = await login(urbanPlanner);
            const document1 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const document2 = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            await request(app).post("/api/document").set("Cookie", upCookie).send(document1).expect(200);
            await request(app).post("/api/document").set("Cookie", upCookie).send(document2).expect(200);

            const response = await documentController.getDocuments({scale:'1:100', language: 'EN'});
            expect(response.length).toBe(2);
        })
    })

    describe("getDocumentsWithPagination", () => {

        test("It should return all the requested documents", async () => {
            upCookie = await login(urbanPlanner);
            const document1 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const document2 = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            await request(app).post("/api/document").set("Cookie", upCookie).send(document1).expect(200);
            await request(app).post("/api/document").set("Cookie", upCookie).send(document2).expect(200);

            const response = await documentController.getDocumentsWithPagination({scale:'1:100', language: 'EN'}, 1, 2);
            expect(response.totalItems).toBe(2);
        })
    })

    describe("getStakeholders", () => {

        test("It should return all the requested documents", async () => {
            upCookie = await login(urbanPlanner);
            const document1 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder1',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const document2 = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder2',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            await request(app).post("/api/document").set("Cookie", upCookie).send(document1).expect(200);
            await request(app).post("/api/document").set("Cookie", upCookie).send(document2).expect(200);

            const response = await documentController.getStakeholders();
            expect(response).toEqual(['Stakeholder1', 'Stakeholder2']);
        })
    })

    describe("updateDiagramDate", () => {

        test("It should update the parseDate of the document", async () => {
            upCookie = await login(urbanPlanner);
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder1',scale:'1:100', issuanceDate:'04/2023', type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(document).expect(200)).body;

            const updated = await documentController.updateDiagramDate(documentID, '2023-04-10');
            expect(updated).toBe(true);

            const response = (await request(app).get(`${baseURL}/document/${documentID}`).expect(200)).body;
            expect(response.parsedDate).toBe('2023-04-10T00:00:00.000Z');
        })
    })

    describe("deleteAllDocuments", () => {

        test("It should delete all documents", async () => {
            upCookie = await login(urbanPlanner);
            const document1 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder1',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const document2 = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder2',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            await request(app).post("/api/document").set("Cookie", upCookie).send(document1).expect(200);
            await request(app).post("/api/document").set("Cookie", upCookie).send(document2).expect(200);

            const deleted = await documentController.deleteAllDocuments();
            expect(deleted).toBe(true);

            const documents = (await request(app).get(`${baseURL}/documents`).expect(200)).body;
            expect(documents).toEqual([]);
        })
    })

    describe("addResource", () => {

        test("It should add a resource to a document", async () => {
            upCookie = await login(urbanPlanner);
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude: 67.85, longitude: 20.22, stakeholders:'Stakeholder1',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const documentID = (await request(app).post("/api/document").set("Cookie", upCookie).send(document).expect(200)).body;

            const added = await documentController.addResource(documentID, ['text.txt'], [`resources/${documentID}-text.txt`]);
            expect(added).toBe(true);

            const resource = (await request(app).get(`${baseURL}/document/${documentID}`).expect(200)).body.resource;
            expect(resource[0].name).toEqual('text.txt');
            expect(resource[0].path).toEqual(`resources/${documentID}-text.txt`);
        })
    })

})