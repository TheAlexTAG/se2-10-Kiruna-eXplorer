import { Zone } from "../components/zone";
import { ZoneDAO } from "../dao/zoneDAO";

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
}

export {ZoneController};