import { describe, test, expect, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../../index"
import { ZoneController } from "../../../src/controllers/zoneController"
import { Zone } from "../../../src/components/zone"
import { ZoneError } from "../../../src/errors/zoneError"
import { InternalServerError } from "../../../src/errors/link_docError"
import { Utilities } from "../../../src/utilities"
import { Geometry } from "geojson"

jest.mock("../../../src/controllers/zoneController")
jest.mock("../../../src/utilities")

describe("Route zone unit tests", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("GET /api/zones", () => {

        test("It should return the list of all zones", async () => {
            const coord: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
            };
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);

            jest.spyOn(ZoneController.prototype, "getAllZone").mockResolvedValueOnce([zone1, zone2, zone3]);

            const response = await request(app).get("/api/zones");

            expect(response.body).toEqual([zone1, zone2, zone3]);
            expect(ZoneController.prototype.getAllZone).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a InternalServerError", async () => {
            jest.spyOn(ZoneController.prototype, "getAllZone").mockRejectedValue(new InternalServerError(''));

            const response = await request(app).get("/api/zones");
            expect(response.status).toBe(500);
            expect(ZoneController.prototype.getAllZone).toHaveBeenCalledTimes(1);
        })

    })

    describe("GET /api/document/zone/:id", () => {

        jest.mock('express-validator', () => ({
            validationResult: jest.fn(),
        }));

        test("It should return the zone specified", async () => {
            const coord: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, coord);
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);

            const response = await request(app).get("/api/document/zone/1");

            expect(response.body).toEqual(zone);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledWith(1);
        })

        
        test("It should return 422 status if the parameter is not an integer", async () => {
            const coord: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, coord);
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);

            const response = await request(app).get("/api/document/zone/uno");

            expect(response.status).toBe(422);
            expect(ZoneController.prototype.getZone).not.toHaveBeenCalled();
        })

        test("It should fail and return 500 status if the controller's method returns a InternalServerError", async () => {
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(ZoneController.prototype, "getZone").mockRejectedValue(new InternalServerError(''));

            const response = await request(app).get("/api/document/zone/1");
            
            expect(response.status).toBe(500);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.getZone).toHaveBeenCalledWith(1);
        })
    })

    
    describe("PUT /api/zone/:id", () => {

        jest.mock('express-validator', () => ({
            validationResult: jest.fn(),
        }));

        test("It should update the zone specified with new coordinates", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= {
                type: "Polygon",
                coordinates: [
                  [
                    [67.8600, 20.2250],
                    [67.8600, 20.2300],
                    [67.8550, 20.2350],
                    [67.8500, 20.2300],
                    [67.8500, 20.2200],
                    [67.8550, 20.2150],
                    [67.8600, 20.2250]
                  ]
                ]
              }
            const previous: Geometry = {
                type: 'Polygon',
                coordinates: [coordinates
                ]
              };
            const zone: Zone = new Zone(1, previous);
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);
            jest.spyOn(require('@turf/helpers'), 'geometry').mockReturnValue(geo);
            jest.spyOn(ZoneController.prototype, "modifyZone").mockResolvedValueOnce(true);

            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});

            expect(response.body).toEqual(true);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledWith(1, geo);
        })

        test("It should return 401 is user is not an up", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
    
            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});

            expect(response.status).toBe(401); 
            expect(ZoneController.prototype.modifyZone).not.toHaveBeenCalled(); 
        })

        test("It should return 422 status if the parameter is not an integer", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });

            const response = await request(app).put("/api/zone/uno").send({coordinates: coordinates});

            expect(response.status).toBe(422);
            expect(ZoneController.prototype.modifyZone).not.toHaveBeenCalled();
        })

        test("It should return 422 status if the zone does not exist", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ZoneController.prototype, "getZone").mockRejectedValue(new ZoneError);
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });

            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});

            expect(response.status).toBe(422);
            expect(ZoneController.prototype.modifyZone).not.toHaveBeenCalled();
        })

        test("It should return 422 status if body's content is not valid", async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            const previous: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, previous);
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });

            const response1 = await request(app).put("/api/zone/1").send({coordinates: 3});
            const response2 = await request(app).put("/api/zone/1").send({coordinates: [1,2,3]});
            const response3 = await request(app).put("/api/zone/1").send({coordinates: [[67.8600, 20.2250, 3.176],[67.8600]]});
            const response4 = await request(app).put("/api/zone/1").send({coordinates: [[190, 20.2250]]});
            const response5 = await request(app).put("/api/zone/1").send({coordinates: [[79.835, 120]]});

            expect(response1.status).toBe(422);
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(ZoneController.prototype.modifyZone).not.toHaveBeenCalled();
        })

        test("It should fail and return 500 status if the controller's method returns a InternalServerError", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= {
                type: "Polygon",
                coordinates: [coordinates]
              };
            const previous: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, previous);
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(require('@turf/helpers'), 'geometry').mockReturnValue(geo);
            jest.spyOn(ZoneController.prototype, "modifyZone").mockRejectedValue(new InternalServerError(''));

            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});
            
            expect(response.status).toBe(500);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledWith(1, geo);
        })

        test("It should fail and return 422 status if the controller's method returns a generic error", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= {
                type: "Polygon",
                coordinates: [coordinates]
              };
            const previous: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, previous);
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);
            
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(require('@turf/helpers'), 'geometry').mockReturnValue(geo);
            jest.spyOn(ZoneController.prototype, "modifyZone").mockRejectedValue(new Error);

            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});
            
            expect(response.status).toBe(422);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledWith(1, geo);
        })

        test("It should fail and return 422 status if the controller's method returns a database error", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= {
                type: "Polygon",
                coordinates: [coordinates]
              };
            const previous: Geometry = {
                type: 'Polygon',
                coordinates: [
                  [
                    [20.065539, 67.888850],
                    [20.065539, 67.807310],
                    [20.381416, 67.807310],
                    [20.381416, 67.888850],
                    [20.065539, 67.888850]
                  ]
                ]
              };
            const zone: Zone = new Zone(1, previous);
            jest.spyOn(ZoneController.prototype, "getZone").mockResolvedValueOnce(zone);
            
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
            jest.spyOn(require('@turf/helpers'), 'geometry').mockReturnValue(geo);
            jest.spyOn(ZoneController.prototype, "modifyZone").mockRejectedValue(new Error('Database error'));

            const response = await request(app).put("/api/zone/1").send({coordinates: coordinates});
            
            expect(response.status).toBe(422);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneController.prototype.modifyZone).toHaveBeenCalledWith(1, geo);
        })

    })

})
