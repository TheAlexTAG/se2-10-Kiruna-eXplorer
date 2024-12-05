import { describe, test, expect, beforeAll, afterEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../../index"
import { DocumentController } from "../../../src/controllers/documentController"
import { Document } from "../../../src/components/document"
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

describe("Route document unit tests", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("POST /api/document", () => {

        test("It should insert a new document", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10',coordinates: null};

            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "createNode").mockResolvedValueOnce(1);

            const response = await request(app).post("/api/document").send(document);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(1);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should return a 401 code if user is not an urban planner", async () => {
            const document = {title:'Document1',description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};

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

        test("It should return 422 status if one or more body parms are not well formatted", async () => {
            const document1 = {title:'', description:'This is a sample description.', zoneID:2, latitude:null, longitude:null, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:null,pages:null, coordinates: null};
            const document2 = {title:'Document1', description:'', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document3 = {title:'Document1', description:'This is a sample description.', zoneID:'tre', latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document4 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:'tre', longitude:'due', stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document5 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document6 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            const document7 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'',language:'EN',pages:'1-10', coordinates: null};
            const document8 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:{},pages:'1-10', coordinates: null};
            const document9 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: {}};
            const document10 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[1, 2, 3]]};
            const document11 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[200, 20]]};
            const document12 = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:[], coordinates: [[80, 100]]};

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
            const response12 = await request(app).post("/api/document").send(document12);

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
            expect(response12.status).toBe(422);

            expect(DocumentController.prototype.createNode).not.toHaveBeenCalled();
        })

        test("It should fail and return a specific error if the controller's method returns this error like WrongeGeoreferenceError", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a generic error", async () => {
            const document = {title:'Document1', description:'This is a sample description.', zoneID:null, latitude:67.8300, longitude:20.1900, stakeholders:'John Doe, Jane Smith',scale:'1:100', issuanceDate:'12/09/2024',type:'Report',language:'EN',pages:'1-10', coordinates: null};
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "createNode").mockRejectedValue(new Error);

            const response = await request(app).post("/api/document").send(document);
            expect(response.status).toBe(500);
            expect(DocumentController.prototype.createNode).toHaveBeenCalledTimes(1);
        })

    }) 

    describe("PUT /api/document", () => {

        test("It should update the georeference of a document", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};

            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "updateDocumentGeoref").mockResolvedValueOnce(true);

            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(true);
            expect(DocumentController.prototype.updateDocumentGeoref).toHaveBeenCalledTimes(1);
        })

        test("It should return a 401 code if user is not an urban planner", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};

            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
        
            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(401);
            expect(DocumentController.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        })

        test("It should return a 422 if the parameter id is not an integer", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
        
            const response = await request(app).put("/api/document/uno").send(document);

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        })

        test("It should return a 404 if there is no document with such id", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return res.status(404).json({ error: 'Document not found' });
            })
        
            const response = await request(app).put("/api/document/1").send(document);

            expect(response.status).toBe(404);
            expect(DocumentController.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        })

        test("It should return 422 status if one or more body parms are not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            const document1 = {zoneID:'tre', latitude:null, longitude:null, coordinates: null};
            const document2 = {zoneID:null, latitude:'tre', longitude:20.1900, coordinates: null};
            const document3 = {zoneID:null, latitude:67.8300, longitude:'tre', coordinates: null};
            const document4 = {zoneID:null, latitude:null, longitude:null, coordinates: {}};
            const document5 = {zoneID:null, latitude:null, longitude:null, coordinates: [[1, 2, 3]]};
            const document6 = {zoneID:null, latitude:67.8300, longitude:20.1900, coordinates: [[200, 20.19]]};
            const document7 = {zoneID:null, latitude:67.8300, longitude:20.1900, coordinates: [[67.83, 100]]};
            
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

            expect(response1.status).toBe(422);
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(response7.status).toBe(422);

            expect(DocumentController.prototype.updateDocumentGeoref).not.toHaveBeenCalled();
        })

        test("It should fail and return a specific error if the controller's method returns this error like WrongeGeoreferenceError", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "updateDocumentGeoref").mockRejectedValue(new WrongGeoreferenceError());

            const response = await request(app).put("/api/document/1").send(document);
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.updateDocumentGeoref).toHaveBeenCalledTimes(1);
        })

        test("It should fail and return 500 status if the controller's method returns a generic error", async () => {
            const document = {zoneID:null, latitude:67.8300, longitude:20.1900,coordinates: null};
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })

            jest.spyOn(DocumentController.prototype, "updateDocumentGeoref").mockRejectedValue(new Error);

            const response = await request(app).put("/api/document/1").send(document);
            expect(response.status).toBe(500);
            expect(DocumentController.prototype.updateDocumentGeoref).toHaveBeenCalledTimes(1);
        })

    }) 

    
    describe("GET /api/document/:id", () => {
        test("It should return a document given the ID", async () => {
            const document: Document = new Document(1, "Documento Test", "Descrizione 1", 1, null, null, "Stakeholders 1", "1:100", "01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            

            const response = await request(app).get("/api/document/1");

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
            const document1: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            const document2: Document = new Document(2, "Documento 2", "Descrizione 2", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockResolvedValue([document1, document2]);

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([document1, document2]);
        });

        test("It should return 422 status if a parameter is not well formatted", async () => {
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })

            const response = await request(app).get("/api/documents?issuanceDate=data");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocuments).not.toHaveBeenCalled();
        });

        test("It should return 422 status if page size or page number missing", async () => {
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return res.status(422).json({error: "Pagination error: page size or page number missing"});
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(422);
            expect(DocumentController.prototype.getDocuments).not.toHaveBeenCalled();
        });

        test("It should return 500 status if controller method returns a generic error", async () => {
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockRejectedValue(new Error);

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(500);
        });

        test("It should return 503 status if controller method returns a specific error like DatabaseConnectionError", async () => {
            jest.spyOn(Utilities.prototype, "paginationCheck").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocuments').mockRejectedValue(new DatabaseConnectionError(''));

            const response = await request(app).get("/api/documents");

            expect(response.status).toBe(503);
        });

    });

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

    describe("POST /api/resource/:documentID", () => {

        const upload = multer();
      
        test("It should return 200 and confirm files are saved successfully when input is valid", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'file1.txt', buffer: Buffer.from('file content') },
                        { originalname: 'file2.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            jest.spyOn(DocumentController.prototype, 'addResource').mockResolvedValue(true);
        
            const response = await request(app)
                .post('/api/resource/1')
                .attach("files", Buffer.from("file content"), { filename: "test.txt" })
                .attach("files", Buffer.from("file content 2"), { filename: "test2.txt" });
        
            expect(response.status).toBe(200);
            expect(DocumentController.prototype.addResource).toHaveBeenCalledWith(1, ["test.txt","test2.txt"], ["resources/1-test.txt","resources/1-test2.txt"]);
        });

        test("It should return 422 when documentID is not a number", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'file1.txt', buffer: Buffer.from('file content') },
                        { originalname: 'file2.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
            const response = await request(app)
              .post("/api/resource/abc")
              .attach("files", Buffer.from("file content"), { filename: "test.txt" });
        
            expect(response.status).toBe(422);
            expect(DocumentController.prototype.addResource).not.toHaveBeenCalled();
        });

        test("It should return 401 if user is not an up", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "User is not authorized"});
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'file1.txt', buffer: Buffer.from('file content') },
                        { originalname: 'file2.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
        
            const response = await request(app)
                .post('/api/resource/1')
                .attach("files", Buffer.from("file content"), { filename: "test.txt" })
                .attach("files", Buffer.from("file content 2"), { filename: "test2.txt" });
        
            expect(response.status).toBe(401);
            expect(DocumentController.prototype.addResource).not.toHaveBeenCalled();
        });

        test("It should return 404 when document is not found", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return res.status(404).json({ error: 'Document not found' });
            })
        
            const response = await request(app)
              .post('/api/resource/1')
              .attach("files", Buffer.from("file content"), { filename: "test.txt" });
        
            expect(response.status).toBe(404);
            expect(DocumentController.prototype.addResource).not.toHaveBeenCalled();
          });

        test("should return 422 when no files are uploaded", async () => {
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422);
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [];
                    next();
                };
            });
      
            const response = await request(app)
                .post('/api/resource/1')
                .send();
        
            expect(response.status).toBe(422);
            expect(DocumentController.prototype.addResource).not.toHaveBeenCalled();
        });
      
        test("should return 400 when file name is invalid", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [{name:'test.txt', path: '1-test.txt'}], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                    return next();
                })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'test.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
        
            const response = await request(app)
                .post('/api/resource/1')
                .attach("files", Buffer.from("file content"), { filename: "test.txt" });
        
            expect(response.status).toBe(400);
            expect(DocumentController.prototype.addResource).not.toHaveBeenCalled();
        });
      
        test("It should return 500 status if it catch a genereic error", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'file1.txt', buffer: Buffer.from('file content') },
                        { originalname: 'file2.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            jest.spyOn(DocumentController.prototype, 'addResource').mockRejectedValue(new Error());
        
            const response = await request(app)
                .post('/api/resource/1')
                .attach("files", Buffer.from("file content"), { filename: "test.txt" })
                .attach("files", Buffer.from("file content 2"), { filename: "test2.txt" });
        
            expect(response.status).toBe(500);
        });

        test("It should return 500 status if it catch a generic error", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Utilities.prototype, "documentExists").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(upload, 'array').mockImplementation((fieldName: any, maxCount: any) => {
                return (req: any, res: any, next: any) => {
                    req.files = [
                        { originalname: 'file1.txt', buffer: Buffer.from('file content') },
                        { originalname: 'file2.txt', buffer: Buffer.from('file content') }
                    ];
                    next();
                };
            });
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            jest.spyOn(DocumentController.prototype, 'addResource').mockRejectedValue(new DatabaseConnectionError(''));
        
            const response = await request(app)
                .post('/api/resource/1')
                .attach("files", Buffer.from("file content"), { filename: "test.txt" })
                .attach("files", Buffer.from("file content 2"), { filename: "test2.txt" });
        
            expect(response.status).toBe(503);
        });
        
    })

    describe("GET /api/resource/download/:documentID/:fileName", () => {

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            download: jest.fn(),
          } as unknown as Response;
      
        test("It should download the requested file", async () => {
            const document: Document = new Document(1, "Documento 1", "Descrizione 1", 1, null, null,"Stakeholders 1", 
                "1:100","01/01/2023", "Report", "it", "5", 0, [], [{name:'test.txt', path: '1-test.txt'}], []);
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(DocumentController.prototype, 'getDocument').mockResolvedValue(document);
            jest.spyOn(path, 'join').mockReturnValue('/code/server/resources/1-test.txt');
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            jest.spyOn(res, 'download').mockImplementation((path: any, filename: any, callback: any) => {
                callback(null);
            });
        
            const response = await request(app).get('/api/resource/download/1/test.txt');
        
            expect(res.download).toHaveBeenCalled();
        });
    })

})
