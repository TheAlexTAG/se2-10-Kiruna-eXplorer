import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import db from "../../db/db"
import {DocumentDAO} from "../../dao/documentDAO"

const wellknown = require('wellknown');

jest.mock("../../db/db.ts")

let documentDAO: DocumentDAO;

describe("DocumentDAO test unit", () => {

    beforeAll(() => {
        documentDAO = new DocumentDAO();
    });
    
    describe("createDocumentNode", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should register a new document", async () => { 
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                return callback.call({lastID: 1}, null);
            });

            const result = await documentDAO.createDocumentNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', null,	67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');

            expect(result).toEqual(1);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("It should return an InternalServerError if the db call fails", async () => {
            jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                return callback.call(null, new Error);
            });

            await expect(documentDAO.createDocumentNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', null,	67.8525800000002, 20.3148144551419,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(Error);
            expect(db.run).toHaveBeenCalledTimes(1);
        });
 
    });


})
