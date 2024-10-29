import express from "express";
import { DocumentController } from "../controllers/documentController";
import { body } from "express-validator";
import ErrorHandler from "../helper";

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

    initRoutes(): void {
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


    }
}

export {DocumentRoutes};