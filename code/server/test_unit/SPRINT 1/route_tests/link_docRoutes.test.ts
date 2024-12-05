import express, { Express } from 'express';
import request from 'supertest';
import { LinkDocumentRoutes } from '../../../routers/link_docRoutes';
import { LinkDocumentController } from '../../../controllers/link_docController';
import { LinkDocument, Relationship } from '../../../components/link_doc';
import { Utilities } from '../../../utilities';
import { app } from "../../../../index"
import {ErrorHandler} from "../../../helper"
import { DocumentsError, InternalServerError, LinkError } from '../../../errors/link_docError';
const { validationResult } = require('express-validator');

jest.mock('../../../controllers/link_docController');  // Mock del controller
jest.mock('../../../utilities');  // Mock dell'utility

jest.mock('express-validator', () => ({
    body: jest.fn().mockReturnThis(),
    validationResult: jest.fn()
  }));

describe('LinkDocumentRoutes', () => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test('Dovrebbe creare un link tra documenti con successo (200)', async () => {
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return next();
        })
        const mockController = jest.spyOn(LinkDocumentController.prototype, "createLink").mockResolvedValueOnce(true);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Direct consequence'}]});

        expect(response.status).toBe(200);  // Risposta positiva
        expect(response.body).toBe(true);  // Risultato corretto
        expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:'Direct consequence'}]); // Verifica parametri controller
    });
    

    test('Dovrebbe restituire un errore di validazione (422) per input non valido', async () => {
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return next();
        })

        const response1 = await request(app).post('/api/link').send({ firstDoc: 'documento', secondDoc:[{id:2, relationship: 'Direct consequence'}]});
        const response2 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:{}});
        const response3 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[2,3,4]});
        const response4 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:'due', relationship: 'Direct consequence'}]});
        const response5 = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Relationship'}]});

        expect(response1.status).toBe(422);  // Errore di validazione
        expect(response2.status).toBe(422);
        expect(response3.status).toBe(422);
        expect(response4.status).toBe(422);
        expect(response5.status).toBe(422);
        expect(LinkDocumentController.prototype.createLink).not.toHaveBeenCalled();  // Il controller non dovrebbe essere chiamato
    });

    test("Dovrebbe restituire un errore di autorizzazione (401) se l'utente non è up", async () => {
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return res.status(401).json({ error: "Unauthorized" });
        })

        const response = await request(app).post('/api/link').send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Direct consequence'}]});

        expect(response.status).toBe(401);  // Errore di validazione
        expect(LinkDocumentController.prototype.createLink).not.toHaveBeenCalled();  // Il controller non dovrebbe essere chiamato
    })

    test('Dovrebbe restituire DocumentsError se i documenti sono uguali', async () => {
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return next();
        })

        const mockController = jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new DocumentsError);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Direct consequence'}]});

        expect(response.status).toBe(409);  // Errore se i documenti sono uguali
        expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:'Direct consequence'}]);
    });

    test('Dovrebbe restituire LinkError il link tra questi due documenti è già presente', async () => {
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return next();
        })

        const mockController = jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new LinkError);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Direct consequence'}]});

        expect(response.status).toBe(404);
        expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:'Direct consequence'}]);
    });

    test('Dovrebbe restituire InternalServerError se il controller restitutisce questo errore', async () => {
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
            return next()
        })
        jest.spyOn(Utilities.prototype, "isUrbanPlanner").mockImplementation((req, res, next) => {
            return next();
        })

        const mockController = jest.spyOn(LinkDocumentController.prototype, "createLink").mockRejectedValueOnce(new InternalServerError(''));

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc:[{id:2, relationship: 'Direct consequence'}]});

        expect(response.status).toBe(500);
        expect(LinkDocumentController.prototype.createLink).toHaveBeenCalledWith(1, [{id:2, relationship:'Direct consequence'}]);
    });

});
