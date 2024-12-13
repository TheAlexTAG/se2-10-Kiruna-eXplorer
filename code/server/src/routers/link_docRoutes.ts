import express from 'express';
import { Utilities } from '../utilities';
import { LinkDocumentController } from '../controllers/link_docController';

import {body, validationResult, param} from 'express-validator'; // validation middleware
/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { LinkDocument } from '../components/link_doc';
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentRoutes {
    private readonly app: express.Application;
    private readonly controller: LinkDocumentController;
    private readonly utility: Utilities;

    constructor(app: express.Application) {
        this.app = app;
        this.controller= new LinkDocumentController();
        this.utility= new Utilities();
    }

    initRoutes= () => {
        
        // POST api/link
        this.app.post('/api/link',this.utility.isUrbanPlanner,[
            body("firstDoc").isInt({ gt: 0 }),
            body("secondDoc").isArray({ min: 1 }),
            body("secondDoc.*").isObject(),
            body("secondDoc.*.id").isInt({ gt: 0 }),
            body("secondDoc.*.relationship").isArray({min: 1}),
            body("secondDoc.*.relationship").custom((value) => {
                if (new Set(value).size!== value.length){
                    throw new Error(); 
                };
                return true;
            }),
            body("secondDoc.*.relationship.*").isIn(['Direct consequence', 'Collateral consequence', 'Projection', 'Update'])
            ], async(req: any, res: any) => {
                const errors= validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({error: "Invalid input"});
                }

                try {
                    const result: boolean= await this.controller.createLink(+DOMPurify.sanitize(req.body.firstDoc), req.body.secondDoc);
                    return res.status(200).json(result);
                } catch (err: any) {
                    return res.status(err.code).json({error: err.message});
                }
            }
        );

        // PUT api/link
        this.app.put('/api/link/:id',this.utility.isUrbanPlanner,[
            param('id').isInt({min: 1}),
            body("firstDoc").isInt({ gt: 0 }),
            body("secondDoc").isInt({ gt: 0 }),
            body("relationship").isString().isIn(['Direct consequence', 'Collateral consequence', 'Projection', 'Update'])
            ], async(req: any, res: any) => {
                const errors= validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(422).json({error: "Invalid input"});
                }

                try {
                    const result: LinkDocument= await this.controller.modifyLink(+req.params.id, +req.body.firstDoc, +req.body.secondDoc, DOMPurify.sanitize(req.body.relationship));
                    return res.status(200).json(result);
                } catch (err: any) {
                    return res.status(err.code).json({error: err.message});
                }
            }
        );

    }
}

export{LinkDocumentRoutes};