import { describe, test, expect, beforeAll, afterAll, jest, afterEach } from "@jest/globals"
import { ZoneRoutes } from "../../../routers/zoneRoutes"
import { ZoneController } from "../../../controllers/zoneController"
import * as geometryModule from "@turf/helpers";
import { app, server} from "../../../../index";
import { Geometry, Polygon } from "geojson";
import { validationResult } from "express-validator";
import request from 'supertest'
import { Utilities } from "../../../utilities";

const wellknown = require("wellknown")

jest.mock("../../../controllers/zoneController");
jest.mock("../../../utilities");

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
        test("it should return status code 200", async() => {
            const testPolygon: Polygon = wellknown.parse("POLYGON ((20.200 67.870, 20.200 67.840, 20.230 67.840, 20.230 67.870, 20.200 67.870))");
            const zoneID = 15;
            (Utilities.prototype.isUrbanPlanner as jest.Mock).mockImplementation((req: any, res: any, next: any) => next());
            (ZoneController.prototype.checkKiruna as jest.Mock).mockReturnValue(undefined);
            (ZoneController.prototype.insertZone as jest.Mock).mockResolvedValueOnce(zoneID as never);
            const response = await request(app).post("/api/zone").send({coordinates: testPolygon.coordinates.flat()}).set("Content-Type", "application/json");
            console.log(testPolygon.coordinates);
            expect(response.status).toBe(200);
        })
    })
})
