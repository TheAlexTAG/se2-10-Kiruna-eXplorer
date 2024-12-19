import { describe, test, expect, jest, beforeAll, afterEach, afterAll} from "@jest/globals";
import request from 'supertest';
import { LinkDocumentController } from '../../../src/controllers/link_docController';
import { Utilities } from '../../../src/utilities';
import { app, server } from "../../../index"
import { DocumentsError, InternalServerError, LinkError } from '../../../src/errors/link_docError';
import { LinkDocument, Relationship } from "../../../src/components/link_doc";
import { closeDbPool } from "../../../src/db/db";

jest.mock('../../../src/controllers/link_docController'); 
jest.mock('../../../src/utilities');

describe('LinkDocumentRoutes', () => {

    beforeAll(() => {
        jest.mock('express-validator', () => ({
            validationResult: jest.fn(),
        }));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(async () => {
        server.close();
        await closeDbPool();
    })

    describe("POST api/link", () => {

        test('Dovrebbe creare un link tra documenti con successo (200)', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "createLink").mockResolvedValueOnce(true);
    
            const response = await request(app)
                .post('/api/link')
                .send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence']}]});
    
            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
            expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:['Direct consequence']}]);
        });
        
    
        test('Dovrebbe restituire un errore di validazione (422) per input non valido', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });
    
            const response1 = await request(app).post('/api/link').send({ firstDoc: 'documento', secondDoc:[{id:2, relationship: ['Direct consequence']}]});
            const response2 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:{}});
            const response3 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[2,3,4]});
            const response4 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:'due', relationship: ['Direct consequence']}]});
            const response5 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Relationship']}]});
            const response6 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence','Direct consequence']}]});
    
            expect(response1.status).toBe(422); 
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(LinkDocumentController.prototype.createLink).not.toHaveBeenCalled(); 
        });
    
        test("Dovrebbe restituire un errore di autorizzazione (401) se l'utente non è up", async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
    
            const response = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence']}]});
    
            expect(response.status).toBe(401); 
            expect(LinkDocumentController.prototype.createLink).not.toHaveBeenCalled(); 
        })
    
        test('Dovrebbe restituire DocumentsError se i documenti sono uguali', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new DocumentsError);
    
            const response = await request(app)
                .post('/api/link')
                .send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence']}]});
    
            expect(response.status).toBe(409);
            expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:['Direct consequence']}]);
        });
    
        test('Dovrebbe restituire LinkError il link tra questi due documenti è già presente', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new LinkError);
    
            const response = await request(app)
                .post('/api/link')
                .send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence']}]});
    
            expect(response.status).toBe(404);
            expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:['Direct consequence']}]);
        });
    
        test('Dovrebbe restituire InternalServerError se il controller restitutisce questo errore', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new InternalServerError(''));
    
            const response = await request(app)
                .post('/api/link')
                .send({ firstDoc: 1, secondDoc:[{id:2, relationship: ['Direct consequence']}]});
    
            expect(response.status).toBe(500);
            expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:['Direct consequence']}]);
        });

    })


    describe("PUT api/link/:id", () => {

        test('Dovrebbe modificare un link tra documenti con successo (200)', async () => {
            const link: LinkDocument = new LinkDocument(1, 1, 2, Relationship.COLLATERAL);
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "modifyLink").mockResolvedValueOnce(link);
    
            const response = await request(app)
                .put('/api/link/1')
                .send({ firstDoc: 1, secondDoc:2, relationship: 'Direct consequence'});
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual(link);
            expect(LinkDocumentController.prototype.modifyLink).toHaveBeenCalledWith(1, 1, 2, 'Direct consequence');
        });
        
    
        test('Dovrebbe restituire un errore di validazione (422) per input non valido', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => false,
            });
    
            const response1 = await request(app).put('/api/link/0').send({ firstDoc: 1, secondDoc:2, relationship: 'Direct consequence'});
            const response2 = await request(app).put('/api/link/uno').send({ firstDoc: 1, secondDoc:2, relationship: 'Direct consequence'});
            const response3 = await request(app).put('/api/link/1').send({ firstDoc: 'uno', secondDoc:2, relationship: 'Direct consequence'});
            const response4 = await request(app).put('/api/link/1').send({ firstDoc: 0, secondDoc:2, relationship: 'Direct consequence'});
            const response5 = await request(app).put('/api/link/1').send({ firstDoc: 1, secondDoc:'due', relationship: 'Direct consequence'});
            const response6 = await request(app).put('/api/link/1').send({ firstDoc: 1, secondDoc:0, relationship: 'Direct'});
    
            expect(response1.status).toBe(422); 
            expect(response2.status).toBe(422);
            expect(response3.status).toBe(422);
            expect(response4.status).toBe(422);
            expect(response5.status).toBe(422);
            expect(response6.status).toBe(422);
            expect(LinkDocumentController.prototype.modifyLink).not.toHaveBeenCalled(); 
        });
    
        test("Dovrebbe restituire un errore di autorizzazione (401) se l'utente non è up", async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
    
            const response = await request(app).put('/api/link/1').send({ firstDoc: 1, secondDoc:2, relationship: 'Direct consequence'});
    
            expect(response.status).toBe(401); 
            expect(LinkDocumentController.prototype.modifyLink).not.toHaveBeenCalled(); 
        })
    
    
        test('Dovrebbe restituire un determinato errore se il controller restitutisce questo errore', async () => {
            jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
                return next();
            })
            require('express-validator').validationResult.mockReturnValue({
                isEmpty: () => true,
            });
    
            jest.spyOn(LinkDocumentController.prototype, "modifyLink").mockRejectedValueOnce(new InternalServerError(''));
    
            const response = await request(app)
                .put('/api/link/1')
                .send({ firstDoc: 1, secondDoc:2, relationship: 'Direct consequence'});
    
            expect(response.status).toBe(500);
            expect(LinkDocumentController.prototype.modifyLink).toHaveBeenCalledWith(1, 1, 2, 'Direct consequence');
        });

    })


});
