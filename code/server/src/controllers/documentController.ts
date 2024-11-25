import { DocumentDAO } from "../dao/documentDAO";
import { CoordinatesOutOfBoundsError, WrongGeoreferenceError } from "../errors/documentErrors";
import * as turf from "@turf/turf"
import kiruna from "../kiruna.json"
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry } from "geojson";

const wellknown = require("wellknown");

class DocumentController {
    private dao: DocumentDAO;
    constructor() {
        this.dao = new DocumentDAO();
    }

    async createNode(title: string, description: string, zoneID: number | null, coordinates: any | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null, isKiruna: boolean | null): Promise<number> {
        try {
            if(isKiruna && coordinates == null && zoneID == null && latitude == null && longitude == null) {
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, coordinates, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
            }
            if(coordinates && zoneID == null && latitude == null && longitude == null) {
                const geo: Geometry= turf.geometry("Polygon", [coordinates])
                const checkCoordinates = await this.checkPolygonValidity(geo);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                let centroid = turf.centroid(geo);
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, wellknown.stringify(geo), centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
            }
            else if (coordinates ==  null && zoneID == null && latitude != null && longitude != null) {
                const checkCoordinates = await this.checkCoordinatesValidity(longitude, latitude);
                console.log(latitude, longitude)
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                else {
                    let lastID = await this.dao.createDocumentNode(title, description, zoneID, coordinates? wellknown.stringify(coordinates) : null, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
                }
            }
            else if (zoneID != null && latitude == null && longitude == null) {
                let zone = await ZoneDAO.prototype.getZone(zoneID);
                let centroid = turf.centroid(zone.coordinates);
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, wellknown.stringify(coordinates), centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
              } else throw new WrongGeoreferenceError();
        } catch (err) {
            throw err;
        }
    }


    private async checkCoordinatesValidity(lon: number, lat: number): Promise<boolean> {
        const point = turf.point([lon, lat]);
        const checkInside = turf.booleanPointInPolygon(point, kiruna.features[0].geometry as GeoJSON.MultiPolygon)
        console.log(checkInside);
        return Promise.resolve(checkInside);
    }

    private async checkPolygonValidity(polygon: Geometry): Promise<boolean> {
        const checkInside = turf.booleanContains(kiruna.features[0].geometry as GeoJSON.MultiPolygon, polygon)
        return Promise.resolve(checkInside);
    }

}

export {DocumentController}