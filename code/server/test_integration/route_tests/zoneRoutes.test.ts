import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals"
import request from 'supertest';

import { app, server } from "../../index";
import { closeDbPool } from "../../src/db/db";
import {cleanup} from "../../src/db/cleanup";
import { Zone } from "../../src/components/zone";

import { Kiruna } from "../../src/utilities";

const baseURL: string= "/api";

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

/* TEST:  ZoneRoutes */

describe("GET api/zones tests --> integration", () => {
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
        const list= await request(app).get(`${baseURL}/zones`).expect(200);
        const zones= list.body;

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


    test("Test getAllZone with cookie", async () => {
        const list= await request(app).get(`${baseURL}/zones`).set("Cookie", upCookie).expect(200);
        const zones= list.body;

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


    test("Test getAllZone with random input", async () => {
        const list= await request(app).get(`${baseURL}/zones`).send({coordinates: 'Random'}).expect(200);
        const zones= list.body;

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

    test("Test getAllZone with cookie and random input", async () => {
        const list= await request(app).get(`${baseURL}/zones`).set("Cookie", upCookie).send({coordinates: 'Random'}).expect(200);
        const zones= list.body;

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

describe("GET api/document/zone/:id tests --> integration", () => {
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
        const firstList= await request(app).get(`${baseURL}/document/zone/1`).expect(200);
        const zoneOne= firstList.body;

        const secondList= await request(app).get(`${baseURL}/document/zone/3`).expect(200);
        const zoneTwo= secondList.body;

        const resultOne: Zone = {
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

        const resultTwo: Zone= {
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
        }; 
    
        expect(zoneOne).toEqual(resultOne);
        expect(zoneTwo).toEqual(resultTwo);
    });

    test("Test getZone Kiruna", async () => {
        const list= await request(app).get(`${baseURL}/document/zone/0`).expect(200);
        const zone= list.body;
        
        const kiruna= await Kiruna.getKirunaGeometry();
        expect(zone).toEqual(new Zone(0,kiruna));
    });



    test("Test getAllZone with cookie", async () => {
        const list= await request(app).get(`${baseURL}/document/zone/2`).set("Cookie", upCookie).expect(200);
        const zone: Zone= list.body;

        const result: Zone= {
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
        };
    
        expect(zone).toEqual(result);
    });


    test("Test getAllZone with random input", async () => {
        const list= await request(app).get(`${baseURL}/document/zone/2`).send({coordinates: 'Random'}).expect(200);
        const zone: Zone= list.body;

        const result: Zone= {
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
        };
    
        expect(zone).toEqual(result);
    });

    test("Test getAllZone with cookie and random input", async () => {
        const list= await request(app).get(`${baseURL}/document/zone/2`).set("Cookie", upCookie).send({coordinates: 'Random'}).expect(200);
        const zone: Zone= list.body;

        const result: Zone= {
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
        };
    
        expect(zone).toEqual(result);
    });

    test("Test getZone invalid input", async () => {
        await request(app).get(`${baseURL}/document/zone/random`).expect(422);
    });

    test("Test getZone invalid input", async () => {
        await request(app).get(`${baseURL}/document/zone/-1`).expect(422);
    });

    test("Test getZone zone not present", async () => {
        await request(app).get(`${baseURL}/document/zone/10`).expect(404);
    });
});

describe("PUT /api/zone/:id tests --> integration", () => {
    beforeEach(async () => {
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
        const coordinates= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        const list= await request(app).put(`${baseURL}/zone/1`).set("Cookie", upCookie).send({coordinates: coordinates}).expect(200);
        await request(app).put(`${baseURL}/zone/2`).set("Cookie", upCookie).send({coordinates: coordinates}).expect(400);

        const spy: boolean= list.body;
        expect(spy).toEqual(true);

        const listDoc= await request(app).get(`${baseURL}/document/1`).expect(200);
        
        const document= listDoc.body;
        expect(document.longitude).toEqual(20.089924800000002);
        expect(document.latitude).toEqual(67.82458333333334);
    });

    test("Test modifyZone double insert", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        const coordinatesTwo= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137872], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];

        const listOne= await request(app).put(`${baseURL}/zone/1`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(200);
        const listTwo= await request(app).put(`${baseURL}/zone/2`).set("Cookie", upCookie).send({coordinates: coordinatesTwo}).expect(200);

        const spyOne: boolean= listOne.body;
        const spyTwo: boolean= listTwo.body;

        expect(spyOne).toEqual(true);
        expect(spyTwo).toEqual(true);
    });

    /* ERRORS */
    test("Test modifyZone no cookie", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/random`).send({coordinates: coordinatesOne}).expect(401);
    });

    test("Test modifyZone invalid zoneID input (string)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/random`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZone invalid zoneID input (number)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/0`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZone zone not present", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/10`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZone zone no coordinates", async () => {
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).expect(422);
    });

    test("Test modifyZone zone wrong coordinates (more argumets)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752, 0.0]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZone zone wrong coordinates (less arguments)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    // LATITUDINE 
    test("Test modifyZonezone wrong coordinates (positive lat)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 90.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZonezone wrong coordinates (negative lat)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, -90.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    // LONGITUDINE
    test("Test modifyZonezone wrong coordinates (positive long)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [180.0959903, 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZonezone wrong coordinates (negative long)", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, 67.8137874],[-180.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    // NOT A NUMBER
    test("Test modifyZone long not a number", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], ["random", 67.8137874], [20.0959903, 67.8137874],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    test("Test modifyZone lat not a number", async () => {
        const coordinatesOne= [
            [20.0777938, 67.8461752], [20.0959903, 67.8137874], [20.0959903, "random"],[20.0777938, 67.8461752]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(422);
    });

    // ARGUMENTS
    test("Test modifyZone zone wrong coordinates (revers arguments) and not in Kiruna", async () => {
        const coordinatesOne= [
            [67.8461752, 20.0777938], [67.8137874, 20.0959903], [ 67.8137874, 20.0959903],[67.8461752, 20.0777938]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(400);
    });

    test("Test modifyZone zone not in Kiruna", async () => {
        const coordinatesOne= [
            [7.6761, 45.0677],
            [7.6861, 45.0677],
            [7.6861, 45.0737],
            [7.6761, 45.0737],
            [7.6761, 45.0677]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(400);
    });

    test("Test modifyZone zone not in Kiruna (overlap)", async () => {
        const coordinatesOne= [
            [19.971301926619645, 67.76509559600748],
            [19.95933550824741, 67.77082468629344],
            [19.957782383824856, 67.77124680283981],
            [19.98181893782372, 67.76088600678092],
            [19.982080501529776, 67.76079427150553],
            [19.944257512810758, 67.77525805233692],
            [19.98226277212635, 67.76066839293608],
            [19.982553338621855, 67.76057334063472],
            [19.971301926619645, 67.76509559600748]
        ];
        await request(app).put(`${baseURL}/zone/3`).set("Cookie", upCookie).send({coordinates: coordinatesOne}).expect(400);
    });
});