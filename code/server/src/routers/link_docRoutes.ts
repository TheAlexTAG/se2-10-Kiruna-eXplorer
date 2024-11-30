import express from 'express';
import { Utilities } from '../utilities';
import { LinkDocumentController } from '../controllers/link_docController';

import {body, validationResult} from 'express-validator'; // validation middleware
/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class LinkDocumentRoutes {
    private app: express.Application;
    private controller: LinkDocumentController;
    private utility: Utilities;

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
                    res.status(200).json(result);
                } catch (err: any) {
                    return res.status(err.code).json({error: err.message});
                }
            }
        );

    }
}

export{LinkDocumentRoutes};