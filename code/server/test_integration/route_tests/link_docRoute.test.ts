import { describe, test, expect, afterAll, beforeEach } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { Relationship } from "../../src/components/link_doc";

const baseURL: string= "/api";

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

afterAll(async () => {
    await cleanup();
    server.close();
    await closeDbPool();
})


describe("LinkDoc integration test from route to db", () => {
    
    test("POST api/link", async () => {
        upCookie = await login(urbanPlanner);
        const firstDoc = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const secondDoc = {title:'Document2', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
        const firstResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        const secondResponse = await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        const firstID =firstResponse.body;
        const secondID =secondResponse.body;

        const response = await request(app).post('/api/link').set("Cookie", upCookie).send({ firstDoc: firstID, secondDoc:[{id:secondID, relationship: ['Direct consequence']}]});
        expect(response.status).toBe(200);
        expect(response.body).toBe(true);
    })

    test("PUT api/link", async () => {
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

        const response = await request(app).put(`${baseURL}/link/${linkID}`).set("Cookie", upCookie).send({ firstDoc: firstID, secondDoc:secondID, relationship: 'Collateral consequence'});
        expect(response.status).toBe(200);
        expect(response.body.relationship).toEqual(Relationship.COLLATERAL);
    })
})