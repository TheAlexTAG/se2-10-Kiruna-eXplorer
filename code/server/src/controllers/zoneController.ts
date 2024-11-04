import { ZoneDAO } from "../dao/zoneDAO";

class ZoneController{
    private dao: ZoneDAO;

    constructor(){
        this.dao= new ZoneDAO();
    }

    async getAllZone(){
        return await this.dao.getAllZone();
    }
}

export {ZoneController};