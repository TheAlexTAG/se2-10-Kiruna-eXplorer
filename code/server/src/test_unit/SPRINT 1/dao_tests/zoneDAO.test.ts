import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import db from "../../../db/db"
import {ZoneDAO} from "../../../dao/zoneDAO"
import {Zone} from "../../../components/zone"
import {InsertZoneError, ZoneError} from "../../../errors/zoneError"
import { GeoJSON } from 'geojson';
import { InternalServerError } from "../../../errors/link_docError";

const wellknown = require('wellknown');

jest.mock("../../../db/db.ts")

let zoneDAO: ZoneDAO;

describe("ZoneDAO test unit", () => {

    beforeAll(() => {
        zoneDAO = new   ZoneDAO();
    });
    
    describe("getZone", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should get a specific zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone: Zone = new Zone(1, coord); 
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, {zoneID: 1, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'} );
            });

            const result = await zoneDAO.getZone(1);

            expect(result).toEqual(zone);
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("It should return a ZoneError if there are no zone with this id", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });

            await expect(zoneDAO.getZone(1)).rejects.toThrow(ZoneError);
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(Error, null);
            });

            await expect(zoneDAO.getZone(1)).rejects.toThrow(InternalServerError);
            expect(db.get).toHaveBeenCalledTimes(1);
        });
 
    });


    describe("getAllZone", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should get all zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, [{zoneID: 1, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'},
                    {zoneID: 2, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'},
                    {zoneID: 3, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'}] );
            });

            const result = await zoneDAO.getAllZone();

            expect(result).toEqual([zone1, zone2, zone3]);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("It should return a ZoneError if there are no zone in db", async () => {
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(null, []);
            });

            await expect(zoneDAO.getAllZone()).rejects.toThrow(ZoneError);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                return callback(Error, null);
            });

            await expect(zoneDAO.getAllZone()).rejects.toThrow(InternalServerError);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

    })

    describe("getKirunaPolygon", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should get Kiruna polygon", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, {coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'} );
            });

            const result = await zoneDAO.getKirunaPolygon();

            expect(result).toEqual('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("It should return an empty string if there are no Kiruna info in db", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });

            const result = await zoneDAO.getKirunaPolygon();

            expect(result).toEqual('');
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("It should return an Error if the db call fails", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(new Error, null);
            });

            await expect(zoneDAO.getKirunaPolygon()).rejects.toThrow(Error);
            expect(db.get).toHaveBeenCalledTimes(1);
        });
 
    });
 

    describe("insertKirunaPolygon", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should register Kiruna polygon", async () => {
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                return callback.call(null, null);
            });

            const result = await zoneDAO.insertKirunaPolygon();

            expect(result).toEqual(true);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("It return false if Kiruna info are already present", async () => {
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                return callback(new Error('UNIQUE constraint failed'));
            });

            const result = await zoneDAO.insertKirunaPolygon();

            expect(result).toEqual(false);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("It should return InternalServerError if db call fails", async () => {
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                return callback.call(null, new Error);
            });

            await expect(zoneDAO.insertKirunaPolygon()).rejects.toThrow(InternalServerError);

            expect(db.run).toHaveBeenCalledTimes(1);
        });
 
    });

})
