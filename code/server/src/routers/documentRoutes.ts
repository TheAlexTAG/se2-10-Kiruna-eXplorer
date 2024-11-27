import express from "express"
import { DocumentController } from "../controllers/documentController"
import { ErrorHandler } from "../helper"
import { body, param } from "express-validator"
import { Utilities } from "../utilities"

class DocumentRoutes {
    private app: express.Application
    private controller: DocumentController
    private errorHandler: ErrorHandler
    private utilities: Utilities

    constructor(app: express.Application) {
        this.app = app;
        this.controller = new DocumentController();
        this.errorHandler = new ErrorHandler();
        this.utilities = new Utilities();
        this.initRoutes();
    }

    initRoutes(): void {
        this.app.post("/api/document",
            body("title").isString().notEmpty(),
            body("description").isString().notEmpty(),
            body("zoneID").optional({nullable: true}).isInt(), // send only if the zone already exists, otherwise null, if kiruna set null
            body("latitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body("longitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body("stakeholders").isString().notEmpty(),
            body("scale").isString().notEmpty(),
            body("issuanceDate").matches(/^(?:(?:31\/(0[13578]|1[02])\/\d{4})|(?:30\/(0[1-9]|1[0-2])\/\d{4})|(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048]00)))|(?:0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}|(?:0[1-9]|1[0-2])\/\d{4}|\d{4})$/),
            body("type").isString().notEmpty(),
            body("language").optional({nullable:true}).isString(),
            body("pages").optional({nullable:true}).isString(),
            body('coordinates').optional({nullable:true}).isArray(), //set only if the zone is new, otherwise null
            body("coordinates.*").optional({nullable:true}).isArray({ min: 2, max: 2}),
            body("coordinates.*.0").optional({nullable:true}).isFloat({ min: -180, max: 180 }),
            body("coordinates.*.1").optional({nullable:true}).isFloat({ min: -90, max: 90 }),
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.createNode(req.body.title, req.body.description, req.body.zoneID, req.body.coordinates, req.body.latitude, req.body.longitude, req.body.stakeholders, req.body.scale, req.body.issuanceDate, req.body.type, req.body.language, req.body.pages)
        .then((lastID: number) => res.status(200).json(lastID))
        .catch((err: any) => {console.error(err.stack);res.status(err.code? err.code : 500).json({error: err.message})}))

        this.app.put("/api/document/:id",
            param("id").isInt(),
            this.utilities.documentExists,
            body("zoneID").optional({nullable: true}).isInt(), // send only if the zone already exists, otherwise null, if kiruna set null
            body("latitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body("longitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body('coordinates').optional({nullable:true}).isArray(), //set only if the zone is new, otherwise null
            body("coordinates.*").optional({nullable:true}).isArray({ min: 2, max: 2}),
            body("coordinates.*.0").optional({nullable:true}).isFloat({ min: -180, max: 180 }),
            body("coordinates.*.1").optional({nullable:true}).isFloat({ min: -90, max: 90 }),
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.updateDocumentGeoref(req.params.id, req.body.zoneID, req.body.coordinates, req.body.latitude, req.body.longitude)
        .then((val: boolean) => res.status(200).json(val))
        .catch((err) => res.status(err.code? err.code : 500).json({error: err.message})))
    }
}

export {DocumentRoutes};