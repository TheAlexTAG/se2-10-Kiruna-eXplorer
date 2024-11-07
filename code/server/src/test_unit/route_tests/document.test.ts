import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../../index"
import { DocumentController } from "../../controllers/documentController"
import { Document } from "../../components/document"
import { WrongGeoreferenceError, CoordinatesOutOfBoundsError, DocumentZoneNotFoundError } from "../../errors/documentErrors"
import { ZoneError, MissingKirunaZoneError } from "../../errors/zoneError"
import { Utilities } from "../../utilities"
import ErrorHandler from "../../helper"

const wellknown = require('wellknown');

jest.mock("../../controllers/documentController")
jest.mock("../../utilities")

describe("Route document unit tests", () => {

    describe("POST /api/document", () => {

        afterEach(() => {
            jest.clearAllMocks();
            jest.resetAllMocks();
            jest.restoreAllMocks();
        });

        test("It should insert a new document", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockResolvedValueOnce(1);

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(1);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should return a 401 code if user is not an urban planner", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockResolvedValueOnce(1);

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should return 422 status if one or more body parms are not well formatted", async () => {
            const document1 = {title:'', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:2, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:null,pages:null};
            const document2 = {title:'Document1', icon:'', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            const document3 = {title:'Document1', icon:'https://example.com/icon.png', description:'', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            const document4 = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:'tre', longitude:'due', stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            const document5 = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            const document6 = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            const document7 = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'',language:'EN',pages:'1-10'};

            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockResolvedValueOnce(1);

            const response1 = await request(app).post("/api/document").send(document1);
            const response2 = await request(app).post("/api/document").send(document2);
            const response3 = await request(app).post("/api/document").send(document3);
            const response4 = await request(app).post("/api/document").send(document4);
            const response5 = await request(app).post("/api/document").send(document5);
            const response6 = await request(app).post("/api/document").send(document6);
            const response7 = await request(app).post("/api/document").send(document7);

            expect(response1.status).toBe(422);
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(response7.status).toBe(422);

            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should fail and return 400 status if the controller's method returns a WrongeGeoreferenceError", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 400 status if the controller's method returns a CoordinatesOutOfBoundError", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new CoordinatesOutOfBoundsError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 404 status if the controller's method returns a DocumentZoneNotFoundError", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new DocumentZoneNotFoundError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(404);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 404 status if the controller's method returns a ZoneError", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new ZoneError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(404);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 404 status if the controller's method returns a MissingKirunaZoneError", async () => {
            const document = {title:'Document1', icon:'https://example.com/icon.png', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10'};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const mockController = jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new MissingKirunaZoneError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(404);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })


    }) 

})
