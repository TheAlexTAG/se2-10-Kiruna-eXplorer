import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../../index"
import { ZoneController } from "../../../src/controllers/zoneController"
import { Zone } from "../../../src/components/zone"
import { ZoneError } from "../../../src/errors/zoneError"
import { GeoJSON } from 'geojson';
import { InternalServerError } from "../../../src/errors/link_docError"
import {ErrorHandler} from "../../../src/helper"
import { Utilities } from "../../../src/utilities"

const wellknown = require('wellknown');

jest.mock("../../../src/controllers/zoneController")
jest.mock("../../../src/utilities")

describe("Route zone unit tests", () => {

    describe("GET /api/zones", () => {

        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should return the list of all zones", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);

            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(ZoneController.prototype, "getAllZone").mockResolvedValueOnce([zone1, zone2, zone3]);

            const response = await request(app).get("/api/zones");

            expect(response.body).toEqual([zone1, zone2, zone3]);
            expect(ZoneController.prototype.getAllZone).toHaveBeenCalledTimes(1);
        })


        test("It should fail and return 404 status if the controller's method returns a ZoneError", async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(ZoneController.prototype, "getAllZone").mockRejectedValue(new ZoneError());

            const response = await request(app).get("/api/zones");
            expect(response.status).toBe(404);
            expect(ZoneController.prototype.getAllZone).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a InternalServerError", async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(ZoneController.prototype, "getAllZone").mockRejectedValue(new InternalServerError(''));

            const response = await request(app).get("/api/zones");
            expect(response.status).toBe(500);
            expect(ZoneController.prototype.getAllZone).toHaveBeenCalledTimes(1);
        })

    })

    describe("GET /api/document/zone/:id", () => {

        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should return the zone specified", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone: Zone = new Zone(1, coord);
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isInt: () => ({})
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            }) 

            const mockController = jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);

            const response = await request(app).get("/api/document/zone/1");

            expect(response.body).toEqual(zone);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledWith(1);
        })

        test("It should return 422 status if the parameter is not an integer", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone: Zone = new Zone(1, coord);

            const mockController = jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);

            const response = await request(app).get("/api/document/zone/uno");

            expect(response.status).toBe(422);
            expect(ZoneController.prototype.getZone).not.toHaveBeenCalled();
        })

        test("It should fail and return 404 status if the controller's method returns a ZoneError", async () => {

            const mockController = jest.spyOn(ZoneController.prototype, "getZone").mockRejectedValue(new ZoneError());

            const response = await request(app).get("/api/document/zone/1");

            expect(response.status).toBe(404);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledWith(1);
        })

        test("It should fail and return 500 status if the controller's method returns a InternalServerError", async () => {

            const mockController = jest.spyOn(ZoneController.prototype, "getZone").mockRejectedValue(new InternalServerError(''));

            const response = await request(app).get("/api/document/zone/1");
            
            expect(response.status).toBe(500);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledWith(1);
        })

    })

})
