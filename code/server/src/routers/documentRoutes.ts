import express from "express"
import { DocumentController } from "../controllers/documentController"
import { ErrorHandler } from "../helper"
import { body, param, query } from "express-validator"
import { Utilities } from "../utilities"
import { Document } from "../components/document"

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
    }

    initRoutes = () => {
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
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))

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
            
        this.app.get("/api/document/:id",
            param("id").isInt(),
        (req: any, res: any, next: any) => this.controller.getDocument(req.params.id)
        .then(doc => res.status(200).json(doc))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.get("/api/documents",
            query("zoneID").optional().isInt(),
            query("stakeholders").optional().isString(),
            query("scale").optional().isString(),
            query("issuanceDate").optional().isString().matches(/^(?:(?:31\/(0[13578]|1[02])\/\d{4})|(?:30\/(0[1-9]|1[0-2])\/\d{4})|(?:29\/02\/(?:(?:\d{2}(?:0[48]|[2468][048]|[13579][26]))|(?:[048]00)))|(?:0[1-9]|1\d|2[0-8])\/(0[1-9]|1[0-2])\/\d{4}|(?:0[1-9]|1[0-2])\/\d{4}|\d{4})$/),
            query("type").optional().isString(),
            query("language").optional().isString(),
            this.utilities.paginationCheck,
            this.errorHandler.validateRequest, 
        (req: any, res: any, next: any) => this.controller.getDocuments(req.query)
        .then(docs => res.status(200).json(docs))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.delete("/api/documents",
            this.utilities.isAdmin,
        (req: any, res: any, next: any) => this.controller.deleteAllDocuments()
        .then((result) => res.status(200).json(result))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.post("/api/resource/:documentID", 
            param('documentID').isInt(),
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
            this.utilities.documentExists,
            upload.array('files', 10),
            async (req: any, res: any) => {
                try{
                    if (!req.files || req.files.length===0)
                        return res.status(422).json({error: 'Missing files'});
                    let files: any[] = req.files;
                    const document: Document = await this.controller.getDocument(+req.params.documentID);
                    let validName: boolean = true;
                    files.forEach((f: any) => {
                        const name: string = 'resources/'+document.id+'-'+f.originalname;
                        if (f.originalname.length===0 || document.resource.some((item: any) => item.name === name))
                           validName = false;
                    });
                    if (!validName)
                        return res.status(400).json({error: 'Invalid file name'});
                    const filesName = files.map((f: any) => f.originalname);
                    await this.controller.addResource(document.id, filesName);
                    return res.status(200).json('Files saved successfully')
                }
                catch (err: any) {
                    res.status(err.code? err.code : 500).json({error: err.message});
                }
            }
        )
    }
}

export {DocumentRoutes};