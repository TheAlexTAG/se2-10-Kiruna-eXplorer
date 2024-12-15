import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import {ZoneDAO} from "../../../src/dao/zoneDAO";
import {ZoneController} from "../../../src/controllers/zoneController";
import {Zone} from "../../../src/components/zone"
import {ZoneError} from "../../../src/errors/zoneError"
import { Geometry } from 'geojson';
import { InternalServerError } from "../../../src/errors/link_docError";
import { Kiruna } from "../../../src/utilities";
import kiruna from "../../../src/kiruna.json"
import { geometry } from "@turf/helpers";
import { InvalidDocumentZoneError } from "../../../src/errors/documentErrors";

const wellknown = require('wellknown');

jest.mock("../../../src/dao/zoneDAO")

let controller : ZoneController;

describe("Controller zone unit tests", () => {

    beforeAll(() => {
        controller = new ZoneController();
    })

    afterEach(() => {
        jest.resetAllMocks();
    });


    describe("getZone", () => {
    
        test("It should get a specific zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone: Zone = new Zone(1, coord);
            jest.spyOn(ZoneDAO.prototype,"getZone").mockResolvedValue(zone);

            const result = await controller.getZone(1);
    
            expect(result).toEqual(zone);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledWith(1);
        });

        test("It should get Kiruna zone", async () => {
            const coord: Geometry = kiruna.features[0].geometry as Geometry;
            const zone: Zone = new Zone(0, coord);
            jest.spyOn(Kiruna,"getKirunaGeometry").mockResolvedValue(coord);

            const result = await controller.getZone(0);
    
            expect(result).toEqual(zone);
            expect(ZoneDAO.prototype.getZone).not.toHaveBeenCalled();
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

        test("It should return all zone", async () => {
            const coord = wellknown.parse('POLYGON((20.065539 67.888850, 20.065539 67.807310, 20.381416 67.807310, 20.381416 67.888850, 20.065539 67.888850))');
            const zone1: Zone = new Zone(1, coord);
            const zone2: Zone = new Zone(2, coord);
            const zone3: Zone = new Zone(3, coord);
            const coordKiruna: Geometry = kiruna.features[0].geometry as Geometry;
            const zoneKiruna: Zone = new Zone(0, coordKiruna);
            jest.spyOn(Kiruna,"getKirunaGeometry").mockResolvedValue(coordKiruna);
            jest.spyOn(ZoneDAO.prototype,"getAllZone").mockResolvedValue([zone1, zone2, zone3]);

            const result = await controller.getAllZone();
    
            expect(result).toEqual([zone1, zone2, zone3, zoneKiruna]);
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


    describe("modifyZone", () => {

        test("It should modify the coordinates of the zone", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= geometry("Polygon", [coordinates]);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(ZoneDAO.prototype,"modifyZone").mockResolvedValue(true);

            const result = await controller.modifyZone(1, geo);
    
            expect(result).toBe(true);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(1);
        });

        test("It should return InvalidDocumentZoneError if new coordinates are not contained in Kiruna", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 1],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= geometry("Polygon", [coordinates]);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(false);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);

            await expect(controller.modifyZone(1, geo)).rejects.toThrow(InvalidDocumentZoneError);
            expect(ZoneDAO.prototype.modifyZone).not.toHaveBeenCalled();
        });

        test("It should return InvalidDocumentZoneError if new coordinates are already saved", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= geometry("Polygon", [coordinates]);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(true);

            await expect(controller.modifyZone(1, geo)).rejects.toThrow(InvalidDocumentZoneError);
            expect(ZoneDAO.prototype.modifyZone).not.toHaveBeenCalled();
        });

        test("It should return an InternalServerError if the dao method returns it", async () => {
            const coordinates: number[][] = [ [67.8600, 20.2250],[67.8600, 20.2300],[67.8550, 20.2350],[67.8500, 20.2300],[67.8500, 20.2200],[67.8550, 20.2150],[67.8600, 20.2250]];
            const geo: Geometry= geometry("Polygon", [coordinates]);
            jest.spyOn(Kiruna,"verifyContainedInKiruna").mockResolvedValue(true);
            jest.spyOn(ZoneDAO,"zoneExistsCoord").mockResolvedValue(false);
            jest.spyOn(ZoneDAO.prototype,"modifyZone").mockRejectedValue(new InternalServerError(''));

            await expect(controller.modifyZone(1, geo)).rejects.toThrow(InternalServerError);
    
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(1);
        });
 
    });

})

