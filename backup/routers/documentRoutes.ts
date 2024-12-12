import express from "express";
import { DocumentController } from "../controllers/documentController";
import { body, param, query} from "express-validator";
import { ErrorHandler } from "../helper";
import { Document } from "../components/document";
import { CoordinatesOutOfBoundsError, DocumentNotFoundError, DocumentZoneNotFoundError, InvalidDocumentZoneError, WrongGeoreferenceError, WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import { MissingKirunaZoneError } from "../errors/zoneError";
import * as turf from '@turf/turf';
import {Utilities} from '../utilities'
import { ZoneError } from "../errors/zoneError";

const path = require('path');
const multer = require('multer');

const resourceDir = path.join(__dirname,'..','resources');

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, resourceDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const doc: number = req.params.documentID;
    const fullname: string = doc+'-'+file.originalname;
    cb(null, fullname);
  }
});

const upload = multer({storage: storage});

/**
 * Router for handling all the http requests for the documents
 */
class DocumentRoutes {
    private app: express.Application
    private controller: DocumentController
    private errorHandler: ErrorHandler

    constructor(app: express.Application) {
        this.app = app;
        this.controller = new DocumentController();
        this.errorHandler = new ErrorHandler();
        this.initRoutes();
    }

    documentExist = (req: any, res: any, next: any) => {
        this.controller.getDocumentByID(+req.params.documentID)
        .then(()=> {return next();})
        .catch((err) => {
            if (err instanceof DocumentNotFoundError) {
                res.status(err.code).json({error: err.message});
            } else {
                res.status(500).json({error: err.message});
            }
        })
    }

/**
 * function for initializing all the routes
 */
    initRoutes = () => {
        /**
         * route for inserting a document node into the database. It returns the id of the last document node created
         */
        this.app.post("/api/document", 
            body("title").isString().notEmpty(),
            body("description").isString().notEmpty(),
            body("zoneID").optional({nullable: true}).isInt(),
            body("latitude").optional({nullable:true}).isFloat(),
            body("longitude").optional({nullable:true}).isFloat(),
            body("stakeholders").isString().notEmpty(),
            body("scale").isString().notEmpty(),
            body("issuanceDate").matches(/^(?:(?:31\/(0[13578]|1[02])\/\d{4})|(?:30\/(0[1-9]|1[0-2])\/\d{4})|(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048]00)))|(?:0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}|(?:0[1-9]|1[0-2])\/\d{4}|\d{4})$/),
            body("type").isString().notEmpty(),
            body("language").optional({nullable:true}).isString(),
            body("pages").optional({nullable:true}).isString(),
            Utilities.prototype.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.createNode(req.body.title, req.body.description, req.body.zoneID, req.body.latitude, req.body.longitude, req.body.stakeholders, req.body.scale, req.body.issuanceDate, req.body.type, req.body.language, req.body.pages)
        .then((lastID:number) => res.status(200).json(lastID))
        .catch((err: Error) => {
            if(err instanceof WrongGeoreferenceError) res.status(err.code).json({error: err.message});
            else if(err instanceof InvalidDocumentZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof ZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof MissingKirunaZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof CoordinatesOutOfBoundsError) res.status(err.code).json({error: err.message});
            else res.status(500).json({error: err.message});
        }))
/**
 * route for getting a document given its id
 */
        this.app.get("/api/document/:id",
            param("id").isInt(),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.getDocumentByID(req.params.id)
        .then((document: Document) => res.status(200).json(document))
        .catch((err: Error) => {
            if(err instanceof DocumentNotFoundError) res.status(err.code).json({error: err.message});
            else res.status(500).json({error: err.message});
        }))
/**
 * route for retrieving all the documents titles and their ids
 */
        this.app.get("/api/document/titles/get",
            Utilities.prototype.isUrbanPlanner,
        (req: any, res: any, next: any) => this.controller.getDocumentsTitles()
        .then((titles: {documentID: number, title: string}[]) => res.status(200).json(titles))
        .catch((err: Error) => res.status(500).json({error: err.message})))
/**
 * route for retrieving all the documents in the database
 */
        this.app.get("/api/documents/links",
            query("zoneID").optional().isInt(),
            query("stakeholders").optional().isString(),
            query("scale").optional().isString(),
            query("issuanceDate").optional().isString().matches(/^(?:(?:31\/(0[13578]|1[02])\/\d{4})|(?:30\/(0[1-9]|1[0-2])\/\d{4})|(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048]00)))|(?:0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}|(?:0[1-9]|1[0-2])\/\d{4}|\d{4})$/),
            query("type").optional().isString(),
            query("language").optional().isString(),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.getAllDocuments(req.query)
        .then((documents: Document[]) => res.status(200).json(documents))
        .catch((err: Error) => res.status(500).json({error: err.message})))
/**
 * route for retrieving all the documents and their coordinates
 */
        this.app.get("/api/documents/coordinates",
        (req: any, res: any, next: any) => this.controller.getAllDocumentsCoordinates()
        .then((coordinates: turf.AllGeoJSON) => res.status(200).json(coordinates))
        .catch((err: Error) => res.status(500).json({error: err.message}))
        )

        this.app.delete("/api/documents/delete/all",
            Utilities.prototype.isAdmin,
        (req: any, res: any, next: any) => this.controller.deleteAllDocuments()
        .then(() => res.status(200).send())
        .catch((err: Error) => res.status(500).json({error: err.message}))
        )

        this.app.post("/api/document/georef/update/:id",
            param('id').isInt(),
            body("zoneID").optional({nullable: true}).isInt(),
            body("latitude").optional({nullable:true}).isFloat(),
            body("longitude").optional({nullable:true}).isFloat(),
            Utilities.prototype.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.updateGeoreference(req.params.id, req.body.zoneID, req.body.longitude, req.body.latitude)
        .then(() => res.status(200).send())
        .catch((err: Error) => {
            if(err instanceof WrongGeoreferenceError) res.status(err.code).json({error: err.message});
            else if(err instanceof InvalidDocumentZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof ZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof MissingKirunaZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof CoordinatesOutOfBoundsError) res.status(err.code).json({error: err.message});
            else if (err instanceof WrongGeoreferenceUpdateError) res.status(err.code).json({error: err.message});
            else res.status(500).json({error: err.message});
        })
        )


        this.app.put("/api/documents/georef/shuffle/:id",
            param('id').isInt(),
            Utilities.prototype.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.shuffleCoordinates(parseInt(req.params.id, 10))
        .then((success: boolean) => res.status(200).json(success))
        .catch((err: Error) => {
            if(err instanceof InvalidDocumentZoneError) res.status(err.code).json({error: err.message});
            else if (err instanceof ZoneError) res.status(err.code).json({error: err.message});
            else res.status(500).json({error: err.message});
        })
        )

 /**
 * route for inserting a resource related to the a specific document
 */

        this.app.post("/api/resource/:documentID", 
            param('documentID').isInt(),
            Utilities.prototype.isUrbanPlanner,
            this.errorHandler.validateRequest,
            this.documentExist,
            upload.array('files', 10),
            async (req: any, res: any) => {
                try{
                    if (!req.files || req.files.length===0)
                        return res.status(422).json({error: 'Missing files'});
                    let files: any[] = req.files;
                    const document: Document = await this.controller.getDocumentByID(+req.params.documentID);
                    let validName: boolean = true;
                    files.forEach((f: any) => {
                        const name: string = 'resources/'+document.id+'-'+f.originalname;
                        if (f.originalname.length===0 || document.resource.includes(name))
                           validName = false;
                    });
                    if (!validName)
                        return res.status(400).json({error: 'Invalid file name'});
                    const filesName = files.map((f: any) => f.originalname);
                    await this.controller.addResource(document.id, filesName);
                    return res.status(200).json('Files saved successfully')
                }
                catch (err: any) {
                    if (err instanceof DocumentNotFoundError) {
                        res.status(err.code).json({error: err.message});
                    } else {
                        res.status(500).json({error: err.message});
                    }
                }
            }
        )

    }

}

export {DocumentRoutes};