import { describe, test, expect, jest, beforeAll, afterEach} from "@jest/globals";
import {DocumentDAO} from "../../dao/documentDAO";
import {DocumentController} from "../../controllers/documentController";
import {CoordinatesOutOfBoundsError, WrongGeoreferenceError} from "../../errors/documentErrors"

jest.mock("../../dao/documentDAO")

let controller : DocumentController;

describe("Controller document unit tests", () => {

    beforeAll(() => {
        controller = new DocumentController();
    })

    describe("createNode", () => {
    
        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should post a new document that has specific coordinates", async () => {
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', null, 67.8300, 20.1900, 'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');
    
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalledTimes(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalledWith('Document1', 'https://example.com/icon.png', 'This is a sample description.', null, 67.8300, 20.1900,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');
        });

        test("It should return CoordinatesOutOfBandError if coordinates does not belong to Kiruna", async () => {
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            await expect(controller.createNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', null,	2, 2, 'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(CoordinatesOutOfBoundsError);
    
            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It returns a WrongGeoreferenceError if info about zone and coordinates are not consistent", async () => {

            await expect(controller.createNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', null,	null, null, 'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10')).rejects.toThrow(WrongGeoreferenceError);

            expect(DocumentDAO.prototype.createDocumentNode).not.toHaveBeenCalled();
        });

        test("It should post a new document that belongs to a specific zone", async () => {
            jest.spyOn(DocumentDAO.prototype,"createDocumentNode").mockResolvedValue(1);

            const result = await controller.createNode('Document1', 'https://example.com/icon.png', 'This is a sample description.', 1, null, null,	'John Doe, Jane Smith',	'1:100','12/09/2024','Report','EN',	'1-10');
    
            expect(result).toEqual(1);
            expect(DocumentDAO.prototype.createDocumentNode).toHaveBeenCalledTimes(1);
        });

    });


})

