import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import {ZoneDAO} from "../../../dao/zoneDAO";
import {ZoneController} from "../../../controllers/zoneController";
import {Zone} from "../../../components/zone"
import {ZoneError} from "../../../errors/zoneError"
import { GeoJSON } from 'geojson';
import { InternalServerError } from "../../../errors/link_docError";

const wellknown = require('wellknown');

jest.mock("../../../dao/zoneDAO")

let controller : ZoneController;

describe("Controller zone unit tests", () => {

    beforeAll(() => {
        controller = new ZoneController();
    })

    describe("getZone", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should get a specific zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone: Zone = new Zone(1, coord);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);

            const result = await controller.getZone(1);
    
            expect(result).toEqual(zone);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledWith(1);
        });

        test("It should return a ZoneError if the dao method returns it", async () => {
            jest.spyOn(ZoneDAO.prototype,"getZone").mockRejectedValue(new ZoneError());

            await expect(controller.getZone(1)).rejects.toThrow(ZoneError);
    
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledWith(1);
        });

        test("It should return an InternalServerError if the dao method returns it", async () => {
            jest.spyOn(ZoneDAO.prototype,"getZone").mockRejectedValue(new InternalServerError(''));

            await expect(controller.getZone(1)).rejects.toThrow(InternalServerError);
    
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledWith(1);
        });
 
    });

    
    describe("getAllZone", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should return all zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);
            jest.spyOn(ZoneDAO.prototype,"getAllZone").mockResolvedValue([zone1, zone2, zone3]);

            const result = await controller.getAllZone();
    
            expect(result).toEqual([zone1, zone2, zone3]);
            expect(ZoneDAO.prototype.getAllZone).toHaveBeenCalledTimes(1);
        });

        test("It should return a ZoneError if the dao method returns it", async () => {
            jest.spyOn(ZoneDAO.prototype,"getAllZone").mockRejectedValue(new ZoneError());

            await expect(controller.getAllZone()).rejects.toThrow(ZoneError);
    
            expect(ZoneDAO.prototype.getAllZone).toHaveBeenCalledTimes(1);
        });

        test("It should return an InternalServerError if the dao method returns it", async () => {
            jest.spyOn(ZoneDAO.prototype,"getAllZone").mockRejectedValue(new InternalServerError(''));

            await expect(controller.getAllZone()).rejects.toThrow(InternalServerError);
    
            expect(ZoneDAO.prototype.getAllZone).toHaveBeenCalledTimes(1);
        });
 
    });

})

