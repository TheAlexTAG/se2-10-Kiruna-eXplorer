import express from 'express';
import { ZoneController } from '../controllers/zoneController';
import { Utilities } from '../utilities';
import { Zone } from '../components/zone';
import { Geometry } from 'geojson';
import { geometry } from "@turf/helpers";

import {param, body, validationResult} from 'express-validator'; // validation middleware

/* Sanitize input */
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
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
    }

    initRoutes= () => {
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
                const zone: Zone = await this.controller.getZone(+DOMPurify.sanitize(req.params.id));
                return res.json(zone);

            } catch (err: any) {
                return res.status(err.code).json({error: err.message});
            }
        });

        // PUT api/zone
        this.app.put('/api/zone/:id', this.utility.isUrbanPlanner, [
            param('id').isInt({min: 1}),
            param('id').custom(async (value) => {
                if(await this.controller.getZone(value)){
                    return true;
                }
            }),
            body('coordinates').isArray(),
            body("coordinates.*").isArray({ min: 2, max: 2}),
            body("coordinates.*.0").isFloat({ min: -180, max: 180 }), //longitudine
            body("coordinates.*.1").isFloat({ min: -90, max: 90 }), //latitudine
        ], async (req: any, res: any) => {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ error: "Invalid input" });
            }

            try {
                const geo: Geometry= geometry("Polygon", [req.body.coordinates]);
                const zoneID: number= +DOMPurify.sanitize(req.params.id);

                const spy: boolean= await this.controller.modifyZone(zoneID,geo);
                return res.json(spy);

            } catch (err: any) {
                return res.status(err.code ? err.code : 422).json({ error: err.message ? err.message : "Error with coordinates!" });
            }
        });

    }

}


export{ZoneRoutes};