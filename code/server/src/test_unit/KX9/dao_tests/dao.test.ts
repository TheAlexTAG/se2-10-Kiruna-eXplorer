import { Zone } from "../../../components/zone";
import db from "../../../db/db";
import { Database } from "sqlite3";
import * as turf from "@turf/turf"
import { Geometry } from 'geojson';
import { describe, test, expect, beforeAll, afterAll, jest, afterEach } from "@jest/globals"
import { ZoneDAO } from "../../../dao/zoneDAO";
import { InternalServerError } from "../../../errors/link_docError";
import { InsertZoneError, ModifyZoneError, ZoneError } from "../../../errors/zoneError";

jest.mock("../../../db/db");

afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
})
/**
 * insertZone test cases
 */
describe("KX9 DAO unit tests", () => {
    describe("insertZone test cases", () => {
        test("It should return the id of the last inserted zone", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (this: any, sql, params, callback) {
                const boundCallback = callback.bind(this);
                this.lastID = 1;
                boundCallback(null);
                return {} as Database;
              });
            const result = await zoneDAO.insertZone("testCoordinates"); //only wkt is accepted to be stored in the database but this function will recive only wkt from its controller

            expect(mockDBRun).toHaveBeenCalledTimes(1);
            expect(result).toBe(1);
        })

        test("It should reject InternalServerError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error());
                return {} as Database;
            })
            await expect(zoneDAO.insertZone("testCoordinates")).rejects.toThrow(InternalServerError);
            expect(mockDBRun).toHaveBeenCalledTimes(1);
        })

        test("It should reject InsertZoneError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function (this: any, sql, params, callback) {
                const boundCallback = callback.bind(this);
                this.lastID = undefined;
                boundCallback(null);
                return {} as Database;
              });
              await expect(zoneDAO.insertZone("testCoordinates")).rejects.toThrow(InsertZoneError);
              expect(mockDBRun).toHaveBeenCalledTimes(1);
        })
    })
/**
 * countDocumentsInZone test cases
 */
    describe("countDocumentsInZone test cases", () => {
        test("It should return the number of documents in zone", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, 
                    {
                        tot: 30
                    });
                return {} as Database;
            })
            const result = await zoneDAO.countDocumentsInZone(5);
            expect(result).toBe(30);
            expect(mockDBGet).toHaveBeenCalledTimes(1);
        })
        
        test("It should reject InternalServerError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error());
                return {} as Database;
            })
            await expect(zoneDAO.countDocumentsInZone(5)).rejects.toThrow(InternalServerError);
            expect(mockDBGet).toHaveBeenCalledTimes(1);
        })

        test("It should reject ZoneError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, 
                    {
                        tot: undefined
                    }
                );
                return {} as Database;
            })
            await expect(zoneDAO.countDocumentsInZone(5)).rejects.toThrow(ZoneError);
            expect(mockDBGet).toHaveBeenCalledTimes(1);
        })
    })
    /**
     * modifyZone test cases
     */
    describe("modifyZone test cases", () => {
        test("It should return true", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(this: any, sql, params, callback) {
                const boundCallback = callback.bind(this);
                this.changes = 1;
                boundCallback(null);
                return {} as Database;
            })
            const result = await zoneDAO.modifyZone(1, "testCoordinates");
            expect(result).toBe(true);
            expect(mockDBRun).toHaveBeenCalledTimes(1);
        })

        test("It should reject InternalServerError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(this: any, sql, params, callback) {
                callback(new Error());
                return {} as Database;
            })
            await expect(zoneDAO.modifyZone(1, "testCoordinates")).rejects.toThrow(InternalServerError);
            expect(mockDBRun).toHaveBeenCalledTimes(1);
        })
        
        test("It should reject ModifyZoneError", async() => {
            const zoneDAO = new ZoneDAO();
            const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(this: any, sql, params, callback) {
                const boundCallback = callback.bind(this);
                this.changes = 3;
                boundCallback(null);
                return {} as Database;
            })
            await expect(zoneDAO.modifyZone(1, "testCoordinates")).rejects.toThrow(ModifyZoneError);
            expect(mockDBRun).toHaveBeenCalledTimes(1);
        })
    })
})