import express, { Express } from 'express';
import request from 'supertest';
import { LinkDocumentRoutes } from '../../routers/link_docRoutes';
import { LinkDocumentController } from '../../controllers/link_daoController';
import { LinkDocument, Relationship } from '../../components/link_doc';
import { Utilities } from '../../utilities';

jest.mock('../../controllers/link_daoController');  // Mock del controller
jest.mock('../../utilities');  // Mock dell'utility

describe('LinkDocumentRoutes', () => {
    let app: Express;
    let mockController: jest.Mocked<LinkDocumentController>;
    let mockUtility: jest.Mocked<Utilities>;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        // Creazione di mock per il controller e l'utility
        mockController = new LinkDocumentController() as jest.Mocked<LinkDocumentController>;
        mockUtility = new Utilities() as jest.Mocked<Utilities>;

        // Mock della funzione isUrbanPlanner
        mockUtility.isUrbanPlanner = jest.fn((req, res, next) => next());

        // Inizializzazione delle rotte
        new LinkDocumentRoutes(app);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Dovrebbe creare un link tra documenti con successo (200)', async () => {
        jest.setTimeout(10000);
        const mockLinkDocument: LinkDocument = { firstDoc: 1, secondDoc: 2, relationship: Relationship.DIRECT };
        mockController.creatLink.mockResolvedValueOnce(mockLinkDocument);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence' });

        expect(response.status).toBe(200);  // Risposta positiva
        expect(response.body).toEqual(mockLinkDocument);  // Risultato corretto
        expect(mockController.creatLink).toHaveBeenCalledWith(1, 2, 'Direct consequence'); // Verifica parametri controller
    });

    test('Dovrebbe restituire un errore di validazione (422) per input non valido', async () => {
        jest.setTimeout(10000);
        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 'not_a_number', secondDoc: 2, relationship: 'Direct consequence' });

        expect(response.status).toBe(422);  // Errore di validazione
        expect(response.body).toEqual({ error: 'Invalid input' });
        expect(mockController.creatLink).not.toHaveBeenCalled();  // Il controller non dovrebbe essere chiamato
    });

    test('Dovrebbe restituire un errore se i documenti sono uguali (400)', async () => {
        jest.setTimeout(10000);
        const error = new Error('Documents cannot be the same');
        mockController.creatLink.mockRejectedValueOnce(error);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc: 1, relationship: 'Direct consequence' });

        expect(response.status).toBe(400);  // Errore se i documenti sono uguali
        expect(response.body).toEqual({ error: 'Documents cannot be the same' });
    });

    test('Dovrebbe restituire un errore generico dal controller (500)', async () => {
        jest.setTimeout(10000);
        const error = new Error('Internal Server Error');
        mockController.creatLink.mockRejectedValueOnce(error);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc: 2, relationship: 'Direct consequence' });

        expect(response.status).toBe(500);  // Errore generico
        expect(response.body).toEqual({ error: 'Internal Server Error' });
    });

    test('Dovrebbe restituire errore se il relationship non è valido (422)', async () => {
        jest.setTimeout(10000);
        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: 1, secondDoc: 2, relationship: 'Invalid relationship' });

        expect(response.status).toBe(422);  // Errore di validazione sul relationship
        expect(response.body).toEqual({ error: 'Invalid input' });
        expect(mockController.creatLink).not.toHaveBeenCalled();  // Il controller non dovrebbe essere chiamato
    });

    test('Dovrebbe chiamare creatLink con valori sanificati (sanitize)', async () => {
        jest.setTimeout(10000);
        const mockLinkDocument: LinkDocument = { firstDoc: 1, secondDoc: 2, relationship: Relationship.DIRECT };
        mockController.creatLink.mockResolvedValueOnce(mockLinkDocument);

        const response = await request(app)
            .post('/api/link')
            .send({ firstDoc: '<script>1</script>', secondDoc: '<script>2</script>', relationship: '<script>Direct consequence</script>' });

        // Verifica che i dati vengano sanitizzati
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockLinkDocument);
        expect(mockController.creatLink).toHaveBeenCalledWith(1, 2, 'Direct consequence');
    });
});
