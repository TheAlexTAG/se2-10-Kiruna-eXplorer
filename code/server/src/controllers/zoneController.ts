import { Zone } from "../components/zone";
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry } from 'geojson';
import { DatabaseConnectionError } from "../errors/zoneError";
import { WrongGeoreferenceError } from "../errors/documentErrors";
import db from "../db/db";
import { booleanContains } from "@turf/boolean-contains";
const wellknown= require('wellknown');

class ZoneController{
    private dao: ZoneDAO;

    constructor(){
        this.dao= new ZoneDAO();
    }

    async getZone(id: number): Promise<Zone>{
        return await this.dao.getZone(id);
    }

    async getAllZone(): Promise<Zone[]>{
        return await this.dao.getAllZone();
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to insert a record with retry
    private async insertWithRetry(maxRetries: number,delayMs: number): Promise<void> {
        let attempts: number= 0;
        while (attempts < maxRetries) {
            try {
                await this.dao.insertKirunaPolygon();
                return;
            } catch (err: any) {
                attempts++;

                if (attempts >= maxRetries) {
                    throw new DatabaseConnectionError(err.message);
                }
                await ZoneController.delay(delayMs);
            }
        }
    }

    async checkKiruna(): Promise<void>{
        try{
            if(await this.dao.getKirunaPolygon()){
                return;
            }
            await this.insertWithRetry(5,1000);
        }catch(err) {
            const error = err as { code?: number; message?: string };
            console.error(`Error code:${(error).code}\nMessage:${error.message}`);
            db.close();
        }
    }

    // Function to verify if a zone is completely contained by Kiruna
    async verifyContainedInKiruna(other: Geometry){
        const kiruna: Geometry= (await this.dao.getZone(0)).coordinates;
        return booleanContains(kiruna,other);
    }

    async insertZone(coordinates: Geometry): Promise<number>{
        if(!await this.verifyContainedInKiruna(coordinates)){
            throw new WrongGeoreferenceError();
        }  

        return await this.dao.insertZone(wellknown.stringify(coordinates));
    }

    /**
     * Returns the total number of documents linked to a zone
     * @param zoneID 
     * @returns 
    */
    async countDocumentsInZone(zoneID: number): Promise<number> {
        return await this.dao.countDocumentsInZone(zoneID);
    }

    async modifyZone(zoneID: number, coordinates: Geometry): Promise<boolean>{
        if(!await this.verifyContainedInKiruna(coordinates)){
            throw new WrongGeoreferenceError();
        }
        
        return await this.dao.modifyZone(zoneID, wellknown.stringify(coordinates));
    }
}

export {ZoneController};