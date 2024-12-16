import { Zone } from "../components/zone";
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry, Position } from 'geojson';
import { centroid } from "@turf/centroid";
import { InvalidDocumentZoneError } from "../errors/documentErrors";
import { Kiruna } from "../utilities";
import wellknown from 'wellknown';

class ZoneController{
    private readonly dao: ZoneDAO;

    constructor(){
        this.dao= new ZoneDAO();
    }

    async getZone(id: number): Promise<Zone>{
        if(id=== 0){
            return new Zone(id,await Kiruna.getKirunaGeometry());
        }
        return await this.dao.getZone(id);
    }

    async getAllZone(): Promise<Zone[]>{
        const res: Zone[]= await this.dao.getAllZone();
        res.push(new Zone(0,await Kiruna.getKirunaGeometry()));
        return res;
    }

    async modifyZone(zoneID: number, coordinates: Geometry): Promise<boolean>{
        const strCoord: string=  wellknown.stringify(coordinates as wellknown.GeoJSONGeometry); 
        if(!await Kiruna.verifyContainedInKiruna(coordinates) || await ZoneDAO.zoneExistsCoord(strCoord)){
            throw new InvalidDocumentZoneError();
        }

        const center: Position= centroid(coordinates).geometry.coordinates;

        return await this.dao.modifyZone(zoneID, strCoord, center[1], center[0]);
    }

}

export {ZoneController};