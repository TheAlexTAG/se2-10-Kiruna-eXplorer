import express from 'express';
import { ZoneController } from '../controllers/zoneController';
import { Utilities } from '../utilities';
import { Zone } from '../components/zone';

const {param, validationResult} = require('express-validator'); // validation middleware

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
        this.app.get('/api/zones', this.utility.isUrbanPlanner, async (req: any, res: any) => {
            try {
                const zones: Zone[] = await this.controller.getAllZone();
                return res.json(zones);

            } catch (err: any) {
                return res.status(err.code).json({error: err.message});
            }
        });

        // GET api/document/zone/:id
        this.app.get('/api/document/zone/:id',[
            param('id').isInt({min: 1})
        ], async (req: any, res: any) => {
            const errors= validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({error: "Invalid input"});
            }

            try {
                const zone: Zone = await this.controller.getZone(req.params.id);
                return res.json(zone);

            } catch (err: any) {
                return res.status(err.code).json({error: err.message});
            }
        });
    }

}


export{ZoneRoutes};