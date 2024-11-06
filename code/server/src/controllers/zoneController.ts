import { Zone } from "../components/zone";
import { ZoneDAO } from "../dao/zoneDAO";
import { DatabaseConnectionError } from "../errors/zoneError";

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
                    throw new DatabaseConnectionError();
                }
                await ZoneController.delay(delayMs);
            }
        }
    }

    async checkKiruna(): Promise<void>{
        if(await this.dao.getKirunaPolygon()){
            return;
        }
        await this.insertWithRetry(5,1000);
    }
}

export {ZoneController};