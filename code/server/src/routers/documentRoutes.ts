import express from "express";
import { DocumentController } from "../controllers/documentController";
import { body, param } from "express-validator";
import ErrorHandler from "../helper";
import { Document } from "../components/document";
import { CoordinatesOutOfBoundsError, DocumentNotFoundError, DocumentZoneNotFoundError, InvalidDocumentZoneError, MissingKirunaZoneError, WrongGeoreferenceError } from "../errors/documentErrors";
import * as turf from '@turf/turf';
import {Utilities} from '../utilities'
import { ZoneError } from "../errors/zoneError";
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
/**
 * function for initializing all the routes
 */
    initRoutes(): void {
        /**
         * route for inserting a document node into the database. It returns the id of the last document node created
         */
        this.app.post("/api/document", 
            body("title").isString().notEmpty(),
            body("icon").isString().notEmpty(),
            body("description").isString().notEmpty(),
            body("zoneID").optional({nullable: true}).isInt(),
            body("latitude").optional({nullable:true}).isFloat(),
            body("longitude").optional({nullable:true}).isFloat(),
            body("stakeholders").isString().notEmpty(),
            body("scale").isString().notEmpty(),
            body("issuanceDate").matches(/^(?:(?:\d{2}\/\d{2}\/\d{4})|(?:\d{2}\/\d{4})|(?:\d{4}))$/),
            body("type").isString().notEmpty(),
            body("language").optional({nullable:true}).isString(),
            body("pages").optional({nullable:true}).isString(),
            Utilities.prototype.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.createNode(req.body.title, req.body.icon, req.body.description, req.body.zoneID, req.body.latitude, req.body.longitude, req.body.stakeholders, req.body.scale, req.body.issuanceDate, req.body.type, req.body.language, req.body.pages)
        .then((lastID:number) => res.status(200).json(lastID))
        .catch((err: Error) => {
            if(err instanceof WrongGeoreferenceError) res.status(err.code).json(err.message);
            else if (err instanceof DocumentZoneNotFoundError) res.status(err.code).json(err.message);
            else if (err instanceof ZoneError) res.status(err.code).json(err.message);
            else if (err instanceof MissingKirunaZoneError) res.status(err.code).json(err.message);
            else if (err instanceof CoordinatesOutOfBoundsError) res.status(err.code).json(err.message);
            else res.status(500).json(err.message);
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
            if(err instanceof DocumentNotFoundError) res.status(err.code).json(err.message);
            else res.status(500).json(err.message);
        }))
/**
 * route for retrieving all the documents titles and their ids
 */
        this.app.get("/api/document/titles/get",
            Utilities.prototype.isUrbanPlanner,
        (req: any, res: any, next: any) => this.controller.getDocumentsTitles()
        .then((titles: {documentID: number, title: string}[]) => res.status(200).json(titles))
        .catch((err: Error) => res.status(500).json(err.message)))
/**
 * route for retrieving all the documents in the database
 */
        this.app.get("/api/documents",
            Utilities.prototype.isAdmin,
        (req: any, res: any, next: any) => this.controller.getAllDocuments()
        .then((documents: Document[]) => res.status(200).json(documents))
        .catch((err: Error) => res.status(500).json(err.message)))
/**
 * route for retrieving all the documents and their coordinates
 */
        this.app.get("/api/documents/coordinates",
        (req: any, res: any, next: any) => this.controller.getAllDocumentsCoordinates()
        .then((coordinates: {documentID: number, title: string, icon: string, geoJson: turf.AllGeoJSON}[]) => res.status(200).json(coordinates))
        .catch((err: Error) => res.status(500).json(err.message))
        )

        this.app.delete("/api/documents/delete/all",
            Utilities.prototype.isAdmin,
        (req: any, res: any, next: any) => this.controller.deleteAllDocuments()
        .then(() => res.status(200).json())
        .catch((err: Error) => res.status(500).json(err.message))
        )
    }

}

export {DocumentRoutes};