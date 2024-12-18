import { describe, test, expect, beforeAll, afterAll } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { ZoneController } from "../../src/controllers/zoneController";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { Zone } from "../../src/components/zone";

import { Kiruna } from "../../src/utilities";
import { Geometry } from "geojson";

const baseURL: string= "/api";
const controller= new ZoneController();

const urbanPlanner = { username: process.env.TEST_USERNAME, password: process.env.TEST_PASSWORD};
let upCookie: string;

const firstDoc = {
    title: "General Plan",
    description: "Plan for the entire Kiruna municipality",
    stakeholders: "Public Administration",
    scale: "1:1,000",
    issuanceDate: "2024",
    type: "Report",
    language: "English",
    pages: "120",
    coordinates: [
        [
            20.175,
            67.870
        ],
        [
            20.195,
            67.870
        ],
        [
            20.195,
            67.890
        ],
        [
            20.175,
            67.890
        ],
        [
            20.175,
            67.870
        ]
    ]

};

const secondDoc = {
    title: "General Plan",
    description: "Plan for the entire Kiruna municipality",
    stakeholders: "Public Administration",
    scale: "1:1,000",
    issuanceDate: "2024",
    type: "Report",
    language: "English",
    pages: "120",
    coordinates: [
        [
            20.200,
            67.850
        ],
        [
            20.220,
            67.850
        ],
        [
            20.220,
            67.870
        ],
        [
            20.200,
            67.870
        ],
        [
            20.200,
            67.850
        ]
    ]
};

const thirdDoc = {
    title: "General Plan",
    description: "Plan for the entire Kiruna municipality",
    stakeholders: "Public Administration",
    scale: "1:1,000",
    issuanceDate: "2024",
    type: "Report",
    language: "English",
    pages: "120",
    coordinates: [
        [
            20.150,
            67.860
        ],
        [
            20.170,
            67.860
        ],
        [
            20.170,
            67.880
        ],
        [
            20.150,
            67.880
        ],
        [
            20.150,
            67.860
        ]
    ]
};

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

afterAll(async() => {
    server.close(); // Chiude il server al termine dei test
    await closeDbPool();
});

/* TEST:  ZoneController */
describe("ZoneController.getZone tests --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        upCookie = await login(urbanPlanner);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(thirdDoc).expect(200);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test getZone", async () => {
        const zone: Zone = await controller.getZone(1);

        const result: Zone = {
            "id": 1,
            "coordinates": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            20.175,
                            67.87
                        ],
                        [
                            20.195,
                            67.87
                        ],
                        [
                            20.195,
                            67.89
                        ],
                        [
                            20.175,
                            67.89
                        ],
                        [
                            20.175,
                            67.87
                        ]
                    ]
                ]
            }
        };

        expect(zone).toEqual(result);
    });

    test("Test getZone Kiruna", async () => {
        const zone: Zone = await controller.getZone(0);
        const kiruna= await Kiruna.getKirunaGeometry();
        expect(zone).toEqual(new Zone(0,kiruna));
    });
});


describe("ZoneDAO.getAllZOne tests --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        upCookie = await login(urbanPlanner);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(thirdDoc).expect(200);
    });

    afterAll(async () => {
        await cleanup();
    });

    test("Test getAllZone", async () => {
        const zones: Zone[] = await controller.getAllZone();
    
        const result: Zone[] = [
            {
                "id": 1,
                "coordinates": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                20.175,
                                67.87
                            ],
                            [
                                20.195,
                                67.87
                            ],
                            [
                                20.195,
                                67.89
                            ],
                            [
                                20.175,
                                67.89
                            ],
                            [
                                20.175,
                                67.87
                            ]
                        ]
                    ]
                }
            },
            {
                "id": 2,
                "coordinates": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                20.2,
                                67.85
                            ],
                            [
                                20.22,
                                67.85
                            ],
                            [
                                20.22,
                                67.87
                            ],
                            [
                                20.2,
                                67.87
                            ],
                            [
                                20.2,
                                67.85
                            ]
                        ]
                    ]
                }
            },
            {
                "id": 3,
                "coordinates": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [
                                20.15,
                                67.86
                            ],
                            [
                                20.17,
                                67.86
                            ],
                            [
                                20.17,
                                67.88
                            ],
                            [
                                20.15,
                                67.88
                            ],
                            [
                                20.15,
                                67.86
                            ]
                        ]
                    ]
                }
            }
        ];

        const kiruna= await Kiruna.getKirunaGeometry();
        result.push(new Zone(0,kiruna));
    
        expect(zones).toEqual(result);
    });
});

describe("ZoneDAO.modifyZone tests --> integration", () => {
    beforeAll(async () => {
        await cleanup();
        upCookie = await login(urbanPlanner);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(firstDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(secondDoc).expect(200);
        await request(app).post(`${baseURL}/document`).set("Cookie", upCookie).send(thirdDoc).expect(200);
    });

    afterAll(async () => {
        await cleanup();
    });
    
    test("Test modifyZone", async () => {
        const geo: Geometry= {
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
        };
        const spy: boolean= await controller.modifyZone(2,geo);

        expect(spy).toEqual(true);
    });
});