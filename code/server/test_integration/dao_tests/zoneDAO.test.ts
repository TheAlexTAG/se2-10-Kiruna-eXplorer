import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { ZoneDAO } from "../../src/dao/zoneDAO";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { Zone } from "../../src/components/zone";

import wellknown from "wellknown";
import { geometry } from "@turf/turf";

const baseURL: string= "/api";
const zoneDAO= new ZoneDAO();

const urbanPlanner = { username: "up", password: "pwd"};
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

afterAll(() => {
    server.close(); // Chiude il server al termine dei test
    closeDbPool();
});

/* TEST:  ZoneDAO  */
describe("ZoneDAO.createZone tests --> integration", () => {
    test("Test createZone", async () => {
        const zone: Zone= ZoneDAO.createZone(1, 'POLYGON((20.175 67.870, 20.195 67.870, 20.195 67.890, 20.175 67.890, 20.175 67.870))');

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
});


describe("ZoneDAO.getZone tests --> integration", () => {
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
        const zone: Zone = await zoneDAO.getZone(1);

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
});

describe("ZoneDAO.zoneExistsCoord tests --> integration", () => {
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

    test("Test zoneExistsCoord --> true", async () => {
        const spy: boolean = await ZoneDAO.zoneExistsCoord(wellknown.stringify(geometry("Polygon", [thirdDoc.coordinates]) as wellknown.GeoJSONGeometry));
        expect(spy).toEqual(true);
    });

    test("Test zoneExistsCoord --> false", async () => {
        const spy: boolean = await ZoneDAO.zoneExistsCoord("POLYGON((20.150 67.860, 20.170 67.861, 20.170 67.880, 20.150 67.880, 20.150 67.860))");
        expect(spy).toEqual(false);
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
        const zones: Zone[] = await zoneDAO.getAllZone();
    
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
        const spy: boolean= await zoneDAO.modifyZone(2,'POLYGON((20.200 67.850, 20.220 67.850, 20.220 67.870, 20.200 67.870, 20.200 67.850))',67.85165993465826, 20.288109604482475);

        expect(spy).toEqual(true);
    });
});