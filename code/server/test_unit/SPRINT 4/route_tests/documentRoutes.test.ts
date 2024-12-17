import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../../index"
import { DocumentController } from "../../../src/controllers/documentController"
import { DocumentRoutesHelper } from "../../../src/routers/documentRoutes"
import { Document, DocumentData, DocumentGeoData } from "../../../src/components/document"
import { WrongGeoreferenceError, CoordinatesOutOfBoundsError, DocumentNotFoundError } from "../../../src/errors/documentErrors"
import { ZoneError, MissingKirunaZoneError, DatabaseConnectionError } from "../../../src/errors/zoneError"
import { Utilities } from "../../../src/utilities"
import {ErrorHandler} from "../../../src/helper"
import { InternalServerError } from "../../../src/errors/link_docError"
import { Response, Express } from 'express';

const wellknown = require('wellknown');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

jest.mock("../../../src/controllers/documentController")
jest.mock("../../../src/utilities")

let documentHelper: DocumentRoutesHelper;

describe("Route document helper unit test", () => {

    beforeAll(() => {
        documentHelper = new DocumentRoutesHelper();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("parseDate", () => {

        test('It should parse a valid date in DD/MM/YYYY format', () => {
            const result = documentHelper.parseDate('15/12/2024');
            expect(result).toEqual(new Date(2024, 11, 15));
        });
        
        test('It should parse a valid date in MM/YYYY format', () => {
            const result = documentHelper.parseDate('12/2024');
            expect(result).toEqual(new Date(2024, 11, 1));
        });
    
        test('It should parse a valid date in YYYY format', () => {
            const result = documentHelper.parseDate('2024');
            expect(result).toEqual(new Date(2024, 0, 1));
        });
    
        test('should throw an error for invalid date format', () => {
            expect(() => documentHelper.parseDate('2024/12/15')).toThrow('Invalid date format: 2024/12/15');
        });

    })

})

describe("Route document unit tests", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("POST /api/document", () => {

        test("It should insert a new document", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);
            jest.spyOn(DocumentController.prototype, "createNode").mockResolvedValueOnce(1);

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(1);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should return a 401 code if user is not an urban planner", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should return a 422 code if scale is not valid", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'Scale', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should return a 422 code if issuanceDate is not valid", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:1000', issuanceDate:'31/02/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should return 422 status if one or more body parms are not well formatted", async () => {
            const document1 = {title:'', description:'This is a sample description.', zoneID:2, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:null,pages:null, coordinates: null};
            const document2 = {title:'Document1', description:'', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document3 = {title:'Document1', description:'This is a sample description.', zoneID:'tre', latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document4 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:'tre', longitude:'due', stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document5 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document6 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'',language:'EN',pages:'1-10', coordinates: null};
            const document7 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:{},pages:'1-10', coordinates: null};
            const document8 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: {}};
            const document9 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[1, 2, 3]]};
            const document10 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[200, 20]]};
            const document11 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[80, 100]]};

            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response1 = await request(app).post("/api/document").send(document1);
            const response2 = await request(app).post("/api/document").send(document2);
            const response3 = await request(app).post("/api/document").send(document3);
            const response4 = await request(app).post("/api/document").send(document4);
            const response5 = await request(app).post("/api/document").send(document5);
            const response6 = await request(app).post("/api/document").send(document6);
            const response7 = await request(app).post("/api/document").send(document7);
            const response8 = await request(app).post("/api/document").send(document8);
            const response9 = await request(app).post("/api/document").send(document9);
            const response10 = await request(app).post("/api/document").send(document10);
            const response11 = await request(app).post("/api/document").send(document11);

            expect(response1.status).toBe(422);
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(response7.status).toBe(422);
            expect(response8.status).toBe(422);
            expect(response9.status).toBe(422);
            expect(response10.status).toBe(422);
            expect(response11.status).toBe(422);

            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should fail and return a specific error if the controller's method returns this error like WrongeGeoreferenceError", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);
            jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a generic error", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);

            jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new Error);

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(500);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

    }) 

    describe("PUT /api/document", () => {

        test("It should update the document specified", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);
            jest.spyOn(DocumentController.prototype, "updateDocument").mockResolvedValueOnce(true);

            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(true);
            expect(DocumentController.prototype.updateDocument).toHaveBeenCalledTimes(1);
        })

        test("It should return a 401 code if user is not an urban planner", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })

            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })

        test("It should return a 422 if the parameter id is not an integer", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};

            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
        
            const response = await request(app).put("/api/document/uno").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })

        test("It should return a 404 if there is no document with such id", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return res.status(404).json({ error: 'Document not found' });
            })
        
            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(404);
            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })


        test("It should return a 422 code if scale is not valid", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'Scale', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })

        test("It should return a 422 code if issuanceDate is not valid", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:1000', issuanceDate:'31/02/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })

        test("It should return 422 status if one or more body parms are not well formatted", async () => {
            const document1 = {title:'', description:'This is a sample description.', zoneID:2, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:null,pages:null, coordinates: null};
            const document2 = {title:'Document1', description:'', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document3 = {title:'Document1', description:'This is a sample description.', zoneID:'tre', latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document4 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:'tre', longitude:'due', stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document5 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document6 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'',language:'EN',pages:'1-10', coordinates: null};
            const document7 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:{},pages:'1-10', coordinates: null};
            const document8 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: {}};
            const document9 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[1, 2, 3]]};
            const document10 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[200, 20]]};
            const document11 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[80, 100]]};

            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            const response1 = await request(app).put("/api/document/1").send(document1);
            const response2 = await request(app).put("/api/document/1").send(document2);
            const response3 = await request(app).put("/api/document/1").send(document3);
            const response4 = await request(app).put("/api/document/1").send(document4);
            const response5 = await request(app).put("/api/document/1").send(document5);
            const response6 = await request(app).put("/api/document/1").send(document6);
            const response7 = await request(app).put("/api/document/1").send(document7);
            const response8 = await request(app).put("/api/document/1").send(document8);
            const response9 = await request(app).put("/api/document/1").send(document9);
            const response10 = await request(app).put("/api/document/1").send(document10);
            const response11 = await request(app).put("/api/document/1").send(document11);

            expect(response1.status).toBe(422);
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(response7.status).toBe(422);
            expect(response8.status).toBe(422);
            expect(response9.status).toBe(422);
            expect(response10.status).toBe(422);
            expect(response11.status).toBe(422);

            expect(DocumentController.prototype.updateDocument).not.toHaveBeenCalled();
        })

        test("It should fail and return a specific error if the controller's method returns this error like WrongeGeoreferenceError", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);
            jest.spyOn(DocumentController.prototype, "updateDocument").mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app).put("/api/document/1").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.updateDocument).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a generic error", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};
            const parseDate: Date = new Date(2024, 8, 12);
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentRoutesHelper.prototype, "parseDate").mockReturnValueOnce(parseDate);

            jest.spyOn(DocumentController.prototype, "updateDocument").mockRejectedValue(new Error);

            const response = await request(app).put("/api/document/1").send(document);
            expect(response.status).toBe(500);
            expect(DocumentController.prototype.updateDocument).toHaveBeenCalledTimes(1);
        })
    
    }) 
    
    describe("GET /api/document/:id", () => {
        test("It should return a document given the ID", async () => {
            const documentData : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document: Document = new Document(documentData, documentGeoData, 0, [], [], []);jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            

            const response = await request(app).get("/api/document/1");
            response.body.parsedDate = new Date(2023, 0, 1);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(document);
        });

        test("It should return a 422 error if param id is not an integer", async () => {
            const response = await request(app).get("/api/document/uno");

            expect(response.status).toBe(422);
        });

        test("should return a DocumentNotFoundError if there is no such document", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocument').mockRejectedValue(new DocumentNotFoundError());

            const response = await request(app).get("/api/document/99");

            expect(response.status).toBe(404);
        });

        test("should return a 500 status if controller method returns a generic error", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocument').mockRejectedValue(new Error);

            const response = await request(app).get("/api/document/99");

            expect(response.status).toBe(500);
        });

    });

    describe("GET /api/documents", () => {
        test("It should return the list of the selected documents", async () => {
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento 2",
                description: "Descrizione 2",
                stakeholders: "Stakeholders 2",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockResolvedValue([document1, document2]);

            const response = await request(app).get("/api/documents?scale=1:100&issuanceDate=01/01/2023");
            response.body[0].parsedDate = new Date(response.body[0].parsedDate);
            response.body[1].parsedDate = new Date(response.body[1].parsedDate);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([document1, document2]);
        });

        test("It should return 422 status if a query parameter scale is not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).get("/api/documents?scale=scale");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocuments).not.toHaveBeenCalled();
        });

        test("It should return 422 status if a query parameter issuanceDate is not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).get("/api/documents?issuanceDate=data");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocuments).not.toHaveBeenCalled();
        });

        test("It should return 500 status if controller method returns a generic error", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockRejectedValue(new Error);

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(500);
        });

        test("It should return 503 status if controller method returns a specific error like DatabaseConnectionError", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockRejectedValue(new DatabaseConnectionError(''));

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(503);
        });

    });

    describe("GET /api/pagination/documents", () => {

        test("It should return the list of the selected documents", async () => {
            const documentData1 : DocumentData = {
                documentID: 1,
                title: "Documento 1",
                description: "Descrizione 1",
                stakeholders: "Stakeholders 1",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentData2 : DocumentData = {
                documentID: 2,
                title: "Documento 2",
                description: "Descrizione 2",
                stakeholders: "Stakeholders 2",
                scale: "1:100",
                issuanceDate: "01/01/2023",
                parsedDate: new Date(2023, 0, 1),
                type: "Report",
                language: "it",
                pages: "5"
            }
            const documentGeoData: DocumentGeoData = {zoneID: 1, coordinates: null, latitude: null, longitude: null};
            const document1: Document = new Document(documentData1, documentGeoData, 0, [], [], []);
            const document2: Document = new Document(documentData2, documentGeoData, 0, [], [], []);
            const paginedDocs = {
                documents: [document1, document2],
                totalItems: 2,
                itemsPerPage: 2,
                currentPage: 1,
                totalPages: 1
            }
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocumentsWithPagination').mockResolvedValue(paginedDocs);

            const response = await request(app).get("/api/pagination/documents?pageSize=2&pageNumber=1&scale=1:100&issuanceDate=01/01/2023");
            response.body.documents[0].parsedDate = new Date(response.body.documents[0].parsedDate);
            response.body.documents[1].parsedDate = new Date(response.body.documents[1].parsedDate);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(paginedDocs);
        });

        test("It should return 422 status if a query parameter scale is not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).get("/api/pagination/documents?pageSize=2&pageNumber=1&scale=Scale");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocumentsWithPagination).not.toHaveBeenCalled();
        });

        test("It should return 422 status if a query parameter issuanceDate is not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return false;
            });
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).get("/api/pagination/documents?pageSize=2&pageNumber=1&issuanceDate=data");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocumentsWithPagination).not.toHaveBeenCalled();
        });

        test("It should return 500 status if controller method returns a generic error", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocumentsWithPagination').mockRejectedValue(new Error);

            const response = await request(app).get("/api/pagination/documents?pageSize=2");

            expect(response.status).toBe(500);
        });

        test("It should return 503 status if controller method returns a specific error like DatabaseConnectionError", async () => {
            jest.spyOn(Utilities.prototype, "isValidScale").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "isValidDate").mockImplementation((value: string) => {
                return true;
            });
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            });
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocumentsWithPagination').mockRejectedValue(new DatabaseConnectionError(''));

            const response = await request(app).get("/api/pagination/documents?pageSize=2");

            expect(response.status).toBe(503);
        });

    });

    describe("GET /api/stakeholders", () => {

        test("It should return the list of all the stakeholders", async () => {
            const stakeholders: string[] = ['stakeholders1', 'stakeholders2', 'stakeholders3'];
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getStakeholders').mockResolvedValue(stakeholders);

            const response = await request(app).get("/api/stakeholders");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(stakeholders);
        });

        test("It should return 401 if user is not an urban planner", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "User is not authorized"});
            })

            const response = await request(app).get("/api/stakeholders");

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.getStakeholders).not.toHaveBeenCalled();
        });

        test("It should return 500 code if a generic error occurs", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getStakeholders').mockRejectedValue(new Error);

            const response = await request(app).get("/api/stakeholders");

            expect(response.status).toBe(500);
        });
    })

    describe("PUT /api/diagram/:id", () => {

        test("It should update the parse date of the specified document", async () => {
            const date: string = new Date(2024,5,16).toISOString();
            const parsedDate = {parsedDate: date};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'updateDiagramDate').mockResolvedValue(true);

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
        })

        test("It should update the parse date of the specified document", async () => {
            const date: string = new Date(2024,5,16).toISOString();
            const parsedDate = {parsedDate: date};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'updateDiagramDate').mockResolvedValue(true);

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
        })

        test("It should return 401 status if user in not an urban planner", async () => {
            const date: string = new Date(2024,5,16).toISOString();
            const parsedDate = {parsedDate: date};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "User is not authorized"});
            })

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.updateDiagramDate).not.toHaveBeenCalled();
        })

        test("It should return 404 status if this document does not exist", async () => {
            const date: string = new Date(2024,5,16).toISOString();
            const parsedDate = {parsedDate: date};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return res.status(404).json({ error: 'Document not found' });
            })

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(404);
            expect(DocumentController.prototype.updateDiagramDate).not.toHaveBeenCalled();
        })

        test("It should return 422 status if the date is not valid", async () => {
            const parsedDate = {parsedDate: 'data'};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.updateDiagramDate).not.toHaveBeenCalled();
        })

        test("It should return 500 status if the controller method returns an error", async () => {
            const date: string = new Date(2024,5,16).toISOString();
            const parsedDate = {parsedDate: date};
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'updateDiagramDate').mockRejectedValue(new Error);

            const response = await request(app).put("/api/diagram/1").send(parsedDate);

            expect(response.status).toBe(500);
        })

    })

    describe("DELETE /api/documents", () => {
            test("It should delete all documents", async () => {
                jest.spyOn(Utilities.prototype, "isAdmin").mockImplementation((req, res, next) => {
                    return next();
                })
                jest.spyOn(DocumentController.prototype, 'deleteAllDocuments').mockResolvedValue(true);
    
                const response = await request(app).delete("/api/documents");
    
                expect(response.status).toBe(200);
                expect(response.body).toBeDefined();  
            });
    
            test("It should delete all documents", async () => {
                jest.spyOn(Utilities.prototype, "isAdmin").mockImplementation((req, res, next) => {
                    return next();
                })
                jest.spyOn(DocumentController.prototype, 'deleteAllDocuments').mockResolvedValue(true);
    
                const response = await request(app).delete("/api/documents");
    
                expect(response.status).toBe(200);
                expect(response.body).toBeDefined();  
            });
    
            test("It should return a 401 code if user is not an admin", async () => {
                jest.spyOn(Utilities.prototype, "isAdmin").mockImplementation((req, res, next) => {
                    return res.status(401).json({ error: "User is not authorized"});
                })
    
                const response = await request(app).delete("/api/documents");
    
                expect(response.status).toBe(401);
                expect(DocumentController.prototype.deleteAllDocuments).not.toHaveBeenCalled();
            });
    
            test("It should return 500 code if controller method returns a generic error", async () => {
                jest.spyOn(Utilities.prototype, "isAdmin").mockImplementation((req, res, next) => {
                    return next();
                })
                jest.spyOn(DocumentController.prototype, 'deleteAllDocuments').mockRejectedValue(new Error());
    
                const response = await request(app).delete("/api/documents");
    
                expect(response.status).toBe(500);
            });
    
            test("It should return 500 code if controller method returns a specific error like InternalServerError", async () => {
                jest.spyOn(Utilities.prototype, "isAdmin").mockImplementation((req, res, next) => {
                    return next();
                })
                jest.spyOn(DocumentController.prototype, 'deleteAllDocuments').mockRejectedValue(new InternalServerError(''));
    
                const response = await request(app).delete("/api/documents");
    
                expect(response.status).toBe(500);
            });
        });

         


})
