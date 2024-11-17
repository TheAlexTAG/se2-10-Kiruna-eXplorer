import express from 'express';
import { ZoneController } from '../controllers/zoneController';
import { Utilities } from '../utilities';
import { Zone } from '../components/zone';
import db from '../db/db';
import { Geometry } from 'geojson';

import { geometry } from "@turf/helpers";

const {param, body, validationResult} = require('express-validator'); // validation middleware
/* Sanitize input */
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

class ZoneRoutes {    
    private app: express.Application;
    private controller: ZoneController;
    private utility: Utilities;

    constructor(app: express.Application) {
        this.app = app;
        this.controller= new ZoneController();
        this.utility= new Utilities();
        this.initRoutes();
    }

    initRoutes(): void{
        // GET api/zones
        this.app.get('/api/zones', async (req: any, res: any) => {
            try {
                const zones: Zone[] = await this.controller.getAllZone();
                return res.json(zones);

            } catch (err: any) {
                return res.status(err.code).json({error: err.message});
            }
        });

        // GET api/document/zone/:id
        this.app.get('/api/document/zone/:id',[
            param('id').isInt({min: 0})
        ], async (req: any, res: any) => {
            const errors= validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({error: "Invalid input"});
            }

            try {
                const zone: Zone = await this.controller.getZone(+req.params.id);
                return res.json(zone);

            } catch (err: any) {
                return res.status(err.code).json({error: err.message});
            }
        });

        // POST api/zone
        this.app.post('/api/zone', this.utility.isUrbanPlanner, [
            body('coordinates').isArray(),
            body("coordinates.*").isArray({ min: 2, max: 2}),
            body("coordinates.*.0").isFloat({ min: -180, max: 180 }), //longitudine
            body("coordinates.*.1").isFloat({ min: -90, max: 90 }) //latitudine
        ], async (req: any, res: any) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ error: "Invalid zone input" });
            }

            try {
                const geo: Geometry= geometry("Polygon", [req.body.coordinates])
                const zoneID: number = await this.controller.insertZone(geo);
                return res.json(zoneID);

            } catch (err: any) {
                return res.status(err.code ? err.code : 422).json({ error: err.message });
            }
        });

    }

    checkKiruna(): void{
        this.controller.checkKiruna()
        .catch((err: any)=>{
            console.error(`Error code:${err.code}\nMessage:${err.message}`);
            db.close();
        });
    }

}


export{ZoneRoutes};