import { describe, test, expect, beforeAll, beforeEach, afterAll } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { LinkDocumentDAO } from "../../src/dao/link_docDAO";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { LinkDocument, Relationship } from "../../src/components/link_doc";

import wellknown from "wellknown";
import { geometry } from "@turf/turf";

const baseURL: string= "/api";
let link_docDAO: LinkDocumentDAO;

const urbanPlanner = { username: 'up', password: 'pwd'};
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
    link_docDAO = new LinkDocumentDAO();
});

afterAll(async () => {
    await cleanup();
})

describe("LinkDoc integration test from dao to db", () => {
    test("checkLink", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;
        const link = { firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Direct consequence']}]};
        await request(app).post(`${baseURL}/link`).set("Cookie", upCookie).send(link).expect(200);
        const firstDocument = (await request(app).get(`${baseURL}/document/${firstID}`)).body;
        const expectedResponse = new LinkDocument(firstDocument.links[0].linkID, firstID, secondID, Relationship.DIRECT);

        const response = await link_docDAO.checkLink(firstID, secondID, Relationship.DIRECT);
        expect(response).toEqual(expectedResponse);
    })

    test("getLink", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;
        const link = { firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Direct consequence']}]};
        await request(app).post(`${baseURL}/link`).set("Cookie", upCookie).send(link).expect(200);
        const firstDocument = (await request(app).get(`${baseURL}/document/${firstID}`)).body;
        const linkID = firstDocument.links[0].linkID;
        const expectedResponse = new LinkDocument(linkID, firstID, secondID, Relationship.DIRECT);

        const response = await link_docDAO.getLink(linkID);
        expect(response).toEqual(expectedResponse);
    })

    test("getDocumentConnections", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;
        const link1 = { firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Direct consequence']}]};
        await request(app).post(`${baseURL}/link`).set("Cookie", upCookie).send(link1).expect(200);
        const link2 = { firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Collateral consequence']}]};
        await request(app).post(`${baseURL}/link`).set("Cookie", upCookie).send(link2).expect(200);
        const firstDocument = (await request(app).get(`${baseURL}/document/${firstID}`)).body;
        const expectedResponse = firstDocument.links.length;

        const response = await link_docDAO.getDocumentConnections(firstID);
        expect(response).toEqual(expectedResponse);
    })

    test("checkDocuments", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;

        const response = await link_docDAO.checkDocuments(firstID, secondID);
        expect(response).toBe(true);
    })

    test("insertLink", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;

        const response = await link_docDAO.insertLink([[firstID, secondID, Relationship.DIRECT]]);
        expect(response).toBe(true);
    })

    test("modifyLink", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;
        const link1 = { firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Direct consequence']}]};
        await request(app).post(`${baseURL}/link`).set("Cookie", upCookie).send(link1).expect(200);
        let firstDocument = (await request(app).get(`${baseURL}/document/${firstID}`)).body;
        const linkID = firstDocument.links[0].linkID;
        const link2 = new LinkDocument(linkID, firstID, secondID, Relationship.COLLATERAL);
        
        const response = await link_docDAO.modifyLink(link2);
        expect(response.relationship).toEqual(Relationship.COLLATERAL);
    })

})