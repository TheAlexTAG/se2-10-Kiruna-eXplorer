import express from "express"
import { DocumentController } from "../controllers/documentController"
import { ErrorHandler } from "../helper"
import { body, param, query } from "express-validator"
import { Utilities } from "../utilities"
import { Document, DocumentData, DocumentEditData, DocumentGeoData } from "../components/document"

const path = require('path');
const multer = require('multer');
const fs = require('fs');


const resourceDir = path.join(__dirname,'..','..','resources');

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, resourceDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const documentID: number = req.params.documentID;
    const fullname: string = documentID+'-'+file.originalname;
    cb(null, fullname);
  }
});

const upload = multer({
    storage: storage,
    limits: {
        files: 5, 
        fileSize: 10 * 1024 * 1024
    }
});

class DocumentRoutesHelper {
    parseDate (dateStr: string): Date {
        const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const mmyyyyPattern = /^(\d{2})\/(\d{4})$/;
        const yyyyPattern = /^(\d{4})$/;
      
        const matchDDMMYYYY = RegExp(ddmmyyyyPattern).exec(dateStr);
        if (matchDDMMYYYY) {
          const [, day, month, year] = matchDDMMYYYY;
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (parsedDate.toString() === "Invalid Date") {
            throw new Error(`Invalid date: ${dateStr}`);
          }
          return parsedDate;
        }
      
        const matchMMYYYY = RegExp(mmyyyyPattern).exec(dateStr);
        if (matchMMYYYY) {
          const [, month, year] = matchMMYYYY;
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          if (parsedDate.toString() === "Invalid Date") {
            throw new Error(`Invalid date: ${dateStr}`);
          }
          return parsedDate;
        }
      
        const matchYYYY = RegExp(yyyyPattern).exec(dateStr);
        if (matchYYYY) {
          const [, year] = matchYYYY;
          const parsedDate = new Date(parseInt(year), 0, 1);
          if (parsedDate.toString() === "Invalid Date") {
            throw new Error(`Invalid date: ${dateStr}`);
          }
          return parsedDate;
        }
      
        throw new Error(`Invalid date format: ${dateStr}`);
      }
}

class DocumentRoutes {
    private readonly app: express.Application
    private readonly controller: DocumentController
    private readonly errorHandler: ErrorHandler
    private readonly utilities: Utilities
    private readonly helper: DocumentRoutesHelper

    constructor(app: express.Application) {
        this.app = app;
        this.controller = new DocumentController();
        this.errorHandler = new ErrorHandler();
        this.utilities = new Utilities();
        this.helper = new DocumentRoutesHelper();
    }

    initRoutes = () => {
        this.app.post("/api/document",
            body("title").isString().notEmpty(),
            body("description").isString().notEmpty(),
            body("zoneID").optional({nullable: true}).isInt(), // send only if the zone already exists, otherwise null, if kiruna set null
            body("latitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body("longitude").optional({nullable:true}).isFloat(), //send only if the georeference is a point, otherwise null
            body("stakeholders").isString().notEmpty(),
            body("scale")
            .custom((value: string) => {
                if(!this.utilities.isValidScale(value))
                    throw new Error("Scale must be in the format '1:{number with thousand separator ,}' (e.g., '1:1,000') or one of 'Blueprints/effects', 'Concept', 'Text'");
                return true;
            }),
            body("issuanceDate").isString()
            .custom((value: string) => {
                if(!this.utilities.isValidDate(value)) 
                    throw new Error("Invalid date format");
                return true;
            }),
            body("type").isString().notEmpty(),
            body("language").optional({nullable:true}).isString(),
            body("pages").optional({nullable:true}).isString(),
            body('coordinates').optional({nullable:true}).isArray(), //set only if the zone is new, otherwise null
            body("coordinates.*").optional({nullable:true}).isArray({ min: 2, max: 2}),
            body("coordinates.*.0").optional({nullable:true}).isFloat({ min: -180, max: 180 }),
            body("coordinates.*.1").optional({nullable:true}).isFloat({ min: -90, max: 90 }),
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => {
            const documentData: DocumentData = {
                documentID: 0,
                title: req.body.title,
                description: req.body.description,
                stakeholders: req.body.stakeholders,
                scale: req.body.scale,
                issuanceDate: req.body.issuanceDate,
                parsedDate: this.helper.parseDate(req.body.issuanceDate),
                type: req.body.type,
                language: req.body.language ?? null,
                pages: req.body.pages ?? null
            }
            let documentGeoData: DocumentGeoData = {
                zoneID: req.body.zoneID ?? null,
                coordinates: req.body.coordinates ?? null,
                latitude: req.body.latitude ?? null,
                longitude: req.body.longitude ?? null
            }
            this.controller.createNode(documentData, documentGeoData)
            .then((lastID: number) => res.status(200).json(lastID))
            .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message}))
        })

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
        (req: any, res: any, next: any) => {
            const documentData: DocumentEditData = {
                documentID: req.params.id,
                title: req.body.title ?? null,
                description: req.body.description ?? null,
                stakeholders: req.body.stakeholders ?? null,
                scale: req.body.scale ?? null,
                issuanceDate: req.body.issuanceDate ?? null,
                parsedDate: req.body.issuanceDate ? this.helper.parseDate(req.body.issuanceDate): null,
                type: req.body.type ?? null,
                language: req.body.language ?? null,
                pages: req.body.pages ?? null
            }
            let documentGeoData: DocumentGeoData = {
                zoneID: req.body.zoneID ?? null,
                coordinates: req.body.coordinates ?? null,
                latitude: req.body.latitude ?? null,
                longitude: req.body.longitude ?? null
            }
            this.controller.updateDocument(documentData, documentGeoData)
            .then((val: boolean) => res.status(200).json(val))
            .catch((err) => res.status(err.code? err.code : 500).json({error: err.message}))
    })
            
        this.app.get("/api/document/:id",
            param("id").isInt(),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.getDocument(req.params.id)
        .then(doc => res.status(200).json(doc))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.get("/api/documents",
            query("zoneID").optional().isInt(),
            query("stakeholders").optional().isString(),
            query("scale").optional()
            .custom((value: string) => {
                if(!this.utilities.isValidScale(value))
                    throw new Error("Scale must be in the format '1:{number with thousand separator ,}' (e.g., '1:1,000') or one of 'Blueprints/effects', 'Concept', 'Text'");
                return true;
            }),
            query("issuanceDate").optional().isString()
            .custom((value: string) => {
                if(!this.utilities.isValidDate(value)) 
                    throw new Error("Invalid date format");
                return true;
            }),
            query("type").optional().isString(),
            query("language").optional().isString(),
            this.errorHandler.validateRequest, 
        (req: any, res: any, next: any) => this.controller.getDocuments(req.query)
        .then(docs => res.status(200).json(docs))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.get("/api/pagination/documents",
            query("zoneID").optional().isInt(),
            query("stakeholders").optional().isString(),
            query("scale").optional()
            .custom((value: string) => {
                if(!this.utilities.isValidScale(value))
                    throw new Error("Scale must be in the format '1:{number with thousand separator ,}' (e.g., '1:1,000') or one of 'Blueprints/effects', 'Concept', 'Text'");
                return true;
            }),
            query("issuanceDate").optional().isString()
            .custom((value: string) => {
                if(!this.utilities.isValidDate(value)) 
                    throw new Error("Invalid date format");
                return true;
            }),
            query("type").optional().isString(),
            query("language").optional().isString(),
            this.utilities.paginationCheck,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => {
            const { pageSize, pageNumber, ...filters} = req.query;
            this.controller.getDocumentsWithPagination(filters, parseInt(pageNumber, 10), pageSize? parseInt(pageSize, 10): undefined)
            .then((paginatedDocs) => res.status(200).json(paginatedDocs))
            .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message}))
        })

        this.app.get("/api/stakeholders",
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.getStakeholders()
        .then((stakeholders) => res.status(200).json(stakeholders))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))

        this.app.put("/api/diagram/:id",
            this.utilities.isUrbanPlanner,
            param("id").isInt(),
            this.utilities.documentExists,
            body("parsedDate").custom((value) => {
                if (isNaN(Date.parse(value)))
                    throw new Error("Invalid date format");
                return true;
              }),
            this.errorHandler.validateRequest,
        (req: any, res: any, next: any) => this.controller.updateDiagramDate(req.params.id, req.body.parsedDate.split("T")[0])
        .then((response: boolean) => res.status(200).json(response))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
        

        this.app.delete("/api/documents",
            this.utilities.isAdmin,
        (req: Request, res: any, next: any) => this.controller.deleteAllDocuments()
        .then((result) => res.status(200).json(result))
        .catch((err: any) => res.status(err.code? err.code : 500).json({error: err.message})))
    
        this.app.post("/api/resource/:documentID", 
            param('documentID').isInt(),
            this.utilities.isUrbanPlanner,
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => {
                req.params.id = req.params.documentID;
                next();
            },
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
                        if (f.originalname.length===0 || document.resource.some((item: any) => item.name === f.originalname))
                           validName = false;
                    });
                    if (!validName)
                        return res.status(400).json({error: 'Invalid file name'});
                    const names: string[] = files.map((f: any) => f.originalname);
                    const paths: string[] = files.map((f: any) => 'resources/'+document.id+'-'+f.originalname);
                    await this.controller.addResource(document.id, names, paths);
                    return res.status(200).json('Files saved successfully')
                }
                catch (err: any) {
                    res.status(err.code? err.code : 500).json({error: err.message});
                }
            }
        )

        this.app.get("/api/resource/download/:documentID/:fileName",
            param("documentID").isInt(),
            param('fileName').isString().notEmpty(),
            this.errorHandler.validateRequest,
            async (req: any, res: any) => {
                try{
                    const document: Document = await this.controller.getDocument(+req.params.documentID);
                    let relativeFilePath: string = '';
                    document.resource.forEach((r: any) => {
                        if (r.name===req.params.fileName)
                           relativeFilePath = r.path;
                    });
                    const filePath: string = path.join(__dirname, '..', '..', relativeFilePath);
                    if (relativeFilePath.length!==0 && fs.existsSync(filePath)) {
                        res.download(filePath, req.params.fileName, (err: any) => {
                            if (err) {
                                return res.status(500).json({error: 'Error in downloading the file'});
                            }
                        });
                    } else {
                        return res.status(404).json({error: 'File not found'});
                    }
                }
                catch (err: any) {
                    res.status(err.code? err.code : 500).json({error: err.message})
                }
            }
        )
    }
}

export {DocumentRoutes, DocumentRoutesHelper};