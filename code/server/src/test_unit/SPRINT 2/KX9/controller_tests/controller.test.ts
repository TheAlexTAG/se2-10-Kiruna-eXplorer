import { describe, test, expect, beforeAll, afterAll, jest, afterEach } from "@jest/globals"
import { ZoneDAO } from "../../../../dao/zoneDAO"
import { ZoneController } from "../../../../controllers/zoneController"
import * as booleanContainsModule from "@turf/boolean-contains";
import { InternalServerError } from "../../../../errors/link_docError";
import { InsertZoneError, ModifyZoneError, ZoneError } from "../../../../errors/zoneError";
import { rejects } from "assert";
import { WrongGeoreferenceError } from "../../../../errors/documentErrors";

const wellknown = require("wellknown");

jest.mock("../../../../dao/zoneDAO");

afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
})

const kirunaZone = {
    id: 0,
    coordinates: wellknown.parse("POLYGON ((20.0884348 67.8795522, 20.0777938 67.8461752, 20.0959903 67.8137874, 20.1313601 67.8009557, 20.20173 67.789142, 20.2526948 67.780064, 20.3284129 67.8017275, 20.3586137 67.820848, 20.3775067 67.8372408, 20.3644607 67.8659746, 20.2542569 67.8805869, 20.2082529 67.8834303, 20.0884348 67.8795522))")
}

describe("KX9 controller unit tests", () => {
    /**
     * verifyContainedInKiruna unit tests
     */
    describe("verifyContainedInKiruna unit tests", () => {
        test("It should return true", async() => {
            const controller = new ZoneController();
            const testZone = {
                id: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(ZoneDAO.prototype, "getZone").mockResolvedValueOnce(kirunaZone);
            jest.spyOn(booleanContainsModule, "booleanContains");
            const result = await controller.verifyContainedInKiruna(testZone.coordinates);
            expect(result).toBe(true);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledWith(kirunaZone.coordinates, testZone.coordinates);
        })

        test("It should return false", async() => {
            const controller = new ZoneController();
            const testZone = {
                id: 1,
                coordinates: wellknown.parse("POLYGON ((67.860 20.180, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(ZoneDAO.prototype, "getZone").mockResolvedValueOnce(kirunaZone);
            jest.spyOn(booleanContainsModule, "booleanContains");
            const result = await controller.verifyContainedInKiruna(testZone.coordinates);
            expect(result).toBe(false);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledWith(kirunaZone.coordinates, testZone.coordinates);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const testZone = {
                id: 1,
                coordinates: wellknown.parse("POLYGON ((67.860 20.180, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(ZoneDAO.prototype, "getZone").mockRejectedValue(new InternalServerError("error"));
            jest.spyOn(booleanContainsModule, "booleanContains");
            await expect(controller.verifyContainedInKiruna(testZone.coordinates)).rejects.toThrow(InternalServerError);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledTimes(0);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const testZone = {
                id: 1,
                coordinates: wellknown.parse("POLYGON ((67.860 20.180, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(ZoneDAO.prototype, "getZone").mockRejectedValue(new ZoneError());
            jest.spyOn(booleanContainsModule, "booleanContains");
            await expect(controller.verifyContainedInKiruna(testZone.coordinates)).rejects.toThrow(ZoneError);
            expect(ZoneDAO.prototype.getZone).toHaveBeenCalledTimes(1);
            expect(booleanContainsModule.booleanContains).toHaveBeenCalledTimes(0);
        })
    })
    /**
     * insertZone unit tests
     */
    describe("insertZone unit tests", () => {
        test("It should return the id of the last inserted zone", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "insertZone").mockResolvedValueOnce(15);
            const result = await controller.insertZone(coordinates);
            expect(result).toBe(15);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledWith(wellknown.stringify(coordinates));
        })
        
        test("It should reject WrongGeoreferenceError", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(false);
            await expect(controller.insertZone(coordinates)).rejects.toThrow(WrongGeoreferenceError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockRejectedValueOnce(new InternalServerError("error"));
            await expect(controller.insertZone(coordinates)).rejects.toThrow(InternalServerError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject ZoneError", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockRejectedValueOnce(new ZoneError());
            await expect(controller.insertZone(coordinates)).rejects.toThrow(ZoneError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "insertZone").mockRejectedValueOnce(new InternalServerError("error"));
            await expect(controller.insertZone(coordinates)).rejects.toThrow(InternalServerError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledWith(wellknown.stringify(coordinates));
        })

        test("It should reject InsertZoneError", async() => {
            const controller = new ZoneController();
            const coordinates = wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "insertZone").mockRejectedValueOnce(new InsertZoneError());
            await expect(controller.insertZone(coordinates)).rejects.toThrow(InsertZoneError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(coordinates);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.insertZone).toHaveBeenCalledWith(wellknown.stringify(coordinates));
        })
    })
    /**
     * countDocumentsInZone unit tests
     */
    describe("countDocumentsInZone unit tests", () => {
        test("It should return the number of documents in zone", async() => {
            const controller = new ZoneController();
            jest.spyOn(ZoneDAO.prototype, "countDocumentsInZone").mockResolvedValueOnce(7);
            const result = await controller.countDocumentsInZone(5);
            expect(result).toBe(7);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledWith(5);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            jest.spyOn(ZoneDAO.prototype, "countDocumentsInZone").mockRejectedValueOnce(new InternalServerError("error"));
            await expect(controller.countDocumentsInZone(5)).rejects.toThrow(InternalServerError);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledWith(5);
        })

        test("It should reject ZoneError", async() => {
            const controller = new ZoneController();
            jest.spyOn(ZoneDAO.prototype, "countDocumentsInZone").mockRejectedValueOnce(new ZoneError());
            await expect(controller.countDocumentsInZone(5)).rejects.toThrow(ZoneError);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.countDocumentsInZone).toHaveBeenCalledWith(5);
        })
    })
    /**
     * modifyZone unit tests
     */
    describe("modifyZone unit tests", () => {
        test("It should return true", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "modifyZone").mockResolvedValueOnce(true);
            const response = await controller.modifyZone(testZone.zoneID, testZone.coordinates);
            expect(response).toBe(true);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(testZone.coordinates);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledWith(testZone.zoneID, wellknown.stringify(testZone.coordinates));
        })

        test("It should reject WrongGeoreferenceError", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(false);
            jest.spyOn(ZoneDAO.prototype, "modifyZone");
            await expect(controller.modifyZone(testZone.zoneID, testZone.coordinates)).rejects.toThrow(WrongGeoreferenceError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(testZone.coordinates);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockRejectedValueOnce(new InternalServerError("error"));
            jest.spyOn(ZoneDAO.prototype, "modifyZone");
            await expect(controller.modifyZone(testZone.zoneID, testZone.coordinates)).rejects.toThrow(InternalServerError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(testZone.coordinates);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject ZoneError", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockRejectedValueOnce(new ZoneError);
            jest.spyOn(ZoneDAO.prototype, "modifyZone");
            await expect(controller.modifyZone(testZone.zoneID, testZone.coordinates)).rejects.toThrow(ZoneError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledWith(testZone.coordinates);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(0);
        })

        test("It should reject InternalServerError", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "modifyZone").mockRejectedValueOnce(new InternalServerError("error"));
            await expect(controller.modifyZone(testZone.zoneID, testZone.coordinates)).rejects.toThrow(InternalServerError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledWith(testZone.zoneID, wellknown.stringify(testZone.coordinates));
        })

        test("It should reject ModifyZoneError", async() => {
            const controller = new ZoneController();
            const testZone = {
                zoneID: 1,
                coordinates: wellknown.parse("POLYGON ((20.180 67.860, 20.180 67.830, 20.210 67.830, 20.210 67.860, 20.180 67.860))")
            }
            jest.spyOn(controller, "verifyContainedInKiruna").mockResolvedValueOnce(true);
            jest.spyOn(ZoneDAO.prototype, "modifyZone").mockRejectedValueOnce(new ModifyZoneError());
            await expect(controller.modifyZone(testZone.zoneID, testZone.coordinates)).rejects.toThrow(ModifyZoneError);
            expect(controller.verifyContainedInKiruna).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledTimes(1);
            expect(ZoneDAO.prototype.modifyZone).toHaveBeenCalledWith(testZone.zoneID, wellknown.stringify(testZone.coordinates));
        })
    })
})