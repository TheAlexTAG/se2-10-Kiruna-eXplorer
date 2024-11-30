import { Zone } from "../components/zone";
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry, Position } from 'geojson';
import { centroid } from "@turf/centroid";
import { InvalidDocumentZoneError } from "../errors/documentErrors";
import { Kiruna } from "../utilities";
import wellknown from 'wellknown';

class ZoneController{
    private dao: ZoneDAO;

    constructor(){
        this.dao= new ZoneDAO();
    }

    async getZone(id: number): Promise<Zone>{
        return await this.dao.getZone(id);
    }

    async getAllZone(): Promise<Zone[]>{
        const res: Zone[]= await this.dao.getAllZone();
        res.push(new Zone(0,Kiruna.getKirunaGeometry()));
        return res;
    }

    async modifyZone(zoneID: number, coordinates: Geometry): Promise<boolean>{
        const strCoord: string=  wellknown.stringify(coordinates as wellknown.GeoJSONGeometry); 
        if(! Kiruna.verifyContainedInKiruna(coordinates) || await ZoneDAO.zoneExistsCoord(strCoord)){
            throw new InvalidDocumentZoneError();
        }

        const center: Position= centroid(coordinates).geometry.coordinates;

        return await this.dao.modifyZone(zoneID, strCoord, center[1], center[0]);
    }

}

export {ZoneController};