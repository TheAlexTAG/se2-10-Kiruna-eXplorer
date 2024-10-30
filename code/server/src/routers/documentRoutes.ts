import express from "express";
import { DocumentController } from "../controllers/documentController";
import { body, param } from "express-validator";
import ErrorHandler from "../helper";
import { Document } from "../components/document";
import { DocumentNotFoundError } from "../errors/documentErrors";
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
            body("issuanceDate").isString().notEmpty(),
            body("type").isString().notEmpty(),
            body("language").optional({nullable:true}).isString(),
            body("pages").optional({nullable:true}).isString(),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.createNode(req.body.title, req.body.icon, req.body.description, req.body.zoneID, req.body.latitude, req.body.longitude, req.body.stakeholders, req.body.scale, req.body.issuanceDate, req.body.type, req.body.language, req.body.pages)
        .then((lastID:number) => res.status(200).json(lastID))
        .catch((err: Error) => res.status(500).json(err)))
/**
 * route for getting a document given its id
 */
        this.app.get("/api/document/:id",
            param("id").isInt(),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.getDocumentByID(req.params.id)
        .then((document: Document) => res.status(200).json(document))
        .catch((err: Error) => {
            if(err instanceof DocumentNotFoundError) res.status(err.customCode).json(err);
            else res.status(500).json(err);
        }))
/**
 * route for retrieving all the documents titles and their ids
 */
        this.app.get("/api/document/titles/get",
        (req: any, res: any, next: any) => this.controller.getDocumentsTitles()
        .then((titles: {documentID: number, title: string}[]) => res.status(200).json(titles))
        .catch((err: Error) => res.status(500).json(err)))
/**
 * route for retrieving all the documents in the database
 */
        this.app.get("/api/documents",
        (req: any, res: any, next: any) => this.controller.getAllDocuments()
        .then((documents: Document[]) => res.status(200).json(documents))
        .catch((err: Error) => res.status(500).json(err)))
    }

}

export {DocumentRoutes};