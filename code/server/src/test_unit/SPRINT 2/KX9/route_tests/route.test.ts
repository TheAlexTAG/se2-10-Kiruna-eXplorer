import { describe, test, expect, beforeAll, afterAll, jest, afterEach } from "@jest/globals"
import { ZoneRoutes } from "../../../../routers/zoneRoutes"
import { ZoneController } from "../../../../controllers/zoneController"
import * as geometryModule from "@turf/helpers";
import { app, server} from "../../../../../index";
import { Geometry, Polygon } from "geojson";
import { validationResult } from "express-validator";
import request from 'supertest'
import { Utilities } from "../../../../utilities";
import { Kiruna} from "../../../../helper";
import {ErrorHandler} from "../../../../helper";

const wellknown = require("wellknown")

jest.mock("../../../../controllers/zoneController");
jest.mock("../../../../utilities");
jest.mock("../../../../helper", () => {
    const actualHelper: any = jest.requireActual("../../../../helper");
    console.log(actualHelper.default);
    return {
        ErrorHandler: actualHelper.ErrorHandler,
        Kiruna: jest.fn().mockImplementation(() => {
            return {
                checkKiruna: jest.fn().mockResolvedValue(undefined as never),
            };
        }),
    };
});

afterEach(async() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
})

afterAll(async () => {
    await new Promise<void>((resolve) => {
        server.close(() => { resolve(); });
    });
});

describe("KX9 routes unit tests", () => {
    /**
     * POST api/zone
     */
    describe("POST /api/zone unit tests", () => {
        test("It should return status code 200", async() => {
            const testPolygon: Polygon = wellknown.parse("POLYGON ((20.200 67.870, 20.200 67.840, 20.230 67.840, 20.230 67.870, 20.200 67.870))");
            const zoneID = 15;
            (Utilities.prototype.isUrbanPlanner as jest.Mock).mockImplementation((req: any, res: any, next: any) => next());
            (ZoneController.prototype.insertZone as jest.Mock).mockResolvedValueOnce(zoneID as never);
            const response = await request(app).post("/api/zone").send({coordinates: testPolygon.coordinates.flat()}).set("Content-Type", "application/json");
            expect(response.status).toBe(200);
            expect(response.body).toBe(zoneID);
            expect(Utilities.prototype.isUrbanPlanner).toBeCalledTimes(1);
            expect(ZoneController.prototype.insertZone).toBeCalledTimes(1);
            expect(ZoneController.prototype.insertZone).toBeCalledWith(testPolygon);
        })

        test("It should return status code 422", async() => {
            (Utilities.prototype.isUrbanPlanner as jest.Mock).mockImplementation((req: any, res: any, next: any) => next());
            const response = await request(app).post("/api/zone").send({coordinates: "coordinates"}).set("Content-Type", "application/json");
            expect(response.status).toBe(422);
            expect(Utilities.prototype.isUrbanPlanner).toBeCalledTimes(1);
            expect(ZoneController.prototype.insertZone).toBeCalledTimes(0);
        })

        test("It should return status code 401", async() => {
            (Utilities.prototype.isUrbanPlanner as jest.Mock).mockImplementation((req: any, res: any, next: any) => res.status(401).json({ error: "User is not authorized"}));
            const response = await request(app).post("/api/zone").send({coordinates: "coordinates"}).set("Content-Type", "application/json");
            expect(response.status).toBe(401);
            expect(Utilities.prototype.isUrbanPlanner).toBeCalledTimes(1);
            expect(ZoneController.prototype.insertZone).toBeCalledTimes(0);
        })

        
    })
})
