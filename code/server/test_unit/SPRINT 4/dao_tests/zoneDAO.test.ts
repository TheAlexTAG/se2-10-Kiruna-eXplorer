import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import db from "../../../src/db/db"
import {ZoneDAO} from "../../../src/dao/zoneDAO"
import {Zone} from "../../../src/components/zone"
import {ModifyZoneError, ZoneError} from "../../../src/errors/zoneError"
import {WrongGeoreferenceUpdateError} from "../../../src/errors/documentErrors"
import { InternalServerError } from "../../../src/errors/link_docError";
import { Geometry } from "geojson";
import wellknown, { GeoJSONGeometryOrNull } from 'wellknown';

jest.mock("../../../src/db/db.ts")

let zoneDAO: ZoneDAO;

const connMock: any= {
    query: jest.fn(),
    release: jest.fn(),
    beginTransaction: jest.fn(),
    batch: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
};

describe("ZoneDAO test unit", () => {

    beforeAll(() => {
        zoneDAO = new ZoneDAO();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("createZone", () => {

        jest.mock('wellknown', () => ({
            parse: jest.fn(),
          }));
    
        test("It should create the Zone object", async () => {
            const coordinates: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            const parsedGeo: Geometry = {
                "type": "Polygon",
                "coordinates": [
                  [
                    [20.065539, 67.88885],
                    [20.065539, 67.80731],
                    [20.381416, 67.80731],
                    [20.381416, 67.88885],
                    [20.065539, 67.88885]
                  ]
                ]
              };               
            jest.spyOn(wellknown, 'parse').mockReturnValue(parsedGeo as GeoJSONGeometryOrNull);

            const result = ZoneDAO.createZone(1, coordinates);

            expect(result).toBeInstanceOf(Zone);
            expect(result.id).toBe(1);
            expect(result.coordinates).toEqual(parsedGeo);
        });

        test("It should return a ZoneError if coordinates are not right", async () => {
            jest.spyOn(wellknown, 'parse').mockReturnValue(null);

            expect(() => ZoneDAO.createZone(1, '')).toThrow(ZoneError);
        });
 
    });

    describe("getZone", () => {

        jest.mock("../../../src/dao/zoneDAO")
    
        test("It should get a specific zone", async () => {
            const coord: Geometry = {
                "type": "Polygon",
                "coordinates": [
                  [
                    [20.065539, 67.88885],
                    [20.065539, 67.80731],
                    [20.381416, 67.80731],
                    [20.381416, 67.88885],
                    [20.065539, 67.88885]
                  ]
                ]
              };     
            const zone: Zone = new Zone(1, coord); 

            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{zoneID: 1, coordinates: 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'}]);
            jest.spyOn(ZoneDAO, 'createZone').mockReturnValue(zone);
            jest.spyOn(connMock, 'release');
            const result = await zoneDAO.getZone(1);
            expect(result).toEqual(zone);
        });

        test("It should return a ZoneError if there are no zone with this id", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([]);
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getZone(1)).rejects.toThrow(ZoneError);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getZone(1)).rejects.toThrow(InternalServerError);
        });
        test("It should return an InternalServerError if the db call return a generic error", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error());
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getZone(1)).rejects.toThrow(InternalServerError);
        });
 
    });

    describe("zoneExistsCoord", () => {
    
        test("It should return true if coordinates are already saved", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{count: 1}]);
            jest.spyOn(connMock, 'release');

            const result = await ZoneDAO.zoneExistsCoord(coord);
            expect(result).toBe(true);
        });

        test("It should return false if there is no zone with these coordinates", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{count: 0}]);
            jest.spyOn(connMock, 'release');

            const result = await ZoneDAO.zoneExistsCoord(coord);
            expect(result).toBe(false);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(ZoneDAO.zoneExistsCoord(coord)).rejects.toThrow(InternalServerError);
        });

        test("It should return an InternalServerError if the db call returns a generic error", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error());
            jest.spyOn(connMock, 'release');

            await expect(ZoneDAO.zoneExistsCoord(coord)).rejects.toThrow(InternalServerError);
        });
 
    });

    describe("getAllZone", () => {

        jest.mock("../../../src/dao/zoneDAO")

        test("It should get all zone", async () => {
            const coord: Geometry = {
                "type": "Polygon",
                "coordinates": [
                  [
                    [20.065539, 67.88885],
                    [20.065539, 67.80731],
                    [20.381416, 67.80731],
                    [20.381416, 67.88885],
                    [20.065539, 67.88885]
                  ]
                ]
              };     
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([{zoneID: 1, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'},
                {zoneID: 2, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'},
                {zoneID: 3, coordinates:'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))'}]);
            jest.spyOn(connMock, 'release');
            jest.spyOn(ZoneDAO, 'createZone').mockReturnValueOnce(zone1);
            jest.spyOn(ZoneDAO, 'createZone').mockReturnValueOnce(zone2);
            jest.spyOn(ZoneDAO, 'createZone').mockReturnValueOnce(zone3);

            const result = await zoneDAO.getAllZone();

            expect(result).toEqual([zone1, zone2, zone3]);
        });

        test("It should return a ZoneError if there are no zone in db", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockResolvedValue([]);
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getAllZone()).rejects.toThrow(ZoneError);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getAllZone()).rejects.toThrow(InternalServerError);
        });

        test("It should return an InternalServerError if the db call returns a generic error", async () => {
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error());
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.getAllZone()).rejects.toThrow(InternalServerError);
        });

    })

    describe("modifyZone", () => {

        test("It should update the coordinates of a zone", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 1});
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 2});
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            const result = await zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080);

            expect(result).toBe(true);
        });

        test("It should return ModifyZoneError if there is no such zone", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 0});
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 2});
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080)).rejects.toThrow(ModifyZoneError);
            expect(connMock.rollback).toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceUpdateError if changed rows are not specified", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 1});
            jest.spyOn(connMock, 'query').mockResolvedValueOnce(null);
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080)).rejects.toThrow(WrongGeoreferenceUpdateError);
            expect(connMock.rollback).toHaveBeenCalled();
        });

        test("It should return WrongGeoreferenceUpdateError if there are no document related to this zone", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 1});
            jest.spyOn(connMock, 'query').mockResolvedValueOnce({affectedRows: 0});
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080)).rejects.toThrow(WrongGeoreferenceUpdateError);
            expect(connMock.rollback).toHaveBeenCalled();
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error('Database error'));
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080)).rejects.toThrow(InternalServerError);
            expect(connMock.rollback).toHaveBeenCalled();
        });

        test("It should return an InternalServerError if the db call returns a generic error", async () => {
            const coord: string = 'POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))';
            jest.spyOn(db, 'getConnection').mockResolvedValue(connMock);
            jest.spyOn(connMock, 'beginTransaction');
            jest.spyOn(connMock, 'query').mockRejectedValue(new Error());
            jest.spyOn(connMock, 'commit');
            jest.spyOn(connMock, 'release');

            await expect(zoneDAO.modifyZone(1, coord, 20.2234775, 67.848080)).rejects.toThrow(InternalServerError);
            expect(connMock.rollback).toHaveBeenCalled();
        });
    })

})
