import { DocumentDAO } from "../dao/documentDAO";
import { CoordinatesOutOfBoundsError, WrongGeoreferenceError, WrongGeoreferenceUpdateError } from "../errors/documentErrors";
import * as turf from "@turf/turf"
import kiruna from "../kiruna.json"
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry } from "geojson";
import { InsertZoneError } from "../errors/zoneError";
import wellknown from "wellknown"
import { Document } from "../components/document";
import { Kiruna } from "../utilities";

class DocumentController {
    private dao: DocumentDAO
    private zoneDAO: ZoneDAO
    constructor() {
        this.dao = new DocumentDAO();
        this.zoneDAO = new ZoneDAO();
    }

    private async checkCoordinatesValidity(lon: number, lat: number): Promise<boolean> {
        const point = turf.point([lon, lat]);
        const checkInside = turf.booleanPointInPolygon(point, kiruna.features[0].geometry as GeoJSON.MultiPolygon)
        return Promise.resolve(checkInside);
    }

    async createNode(title: string, description: string, zoneID: number | null, coordinates: any | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        try {
            if(coordinates == null && zoneID == 0 && latitude == null && longitude == null) {
                zoneID = null;
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, coordinates, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
            }
            else if(coordinates && zoneID == null && latitude == null && longitude == null) {
                const geo: Geometry= turf.geometry("Polygon", [coordinates])
                const zoneExists = await ZoneDAO.zoneExistsCoord(wellknown.stringify(geo as wellknown.GeoJSONGeometry));
                if(zoneExists) throw new InsertZoneError();
                const checkCoordinates = await Kiruna.verifyContainedInKiruna(geo);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                let centroid = turf.centroid(geo);
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, wellknown.stringify(geo as wellknown.GeoJSONGeometry), centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
            }
            else if(coordinates ==  null && zoneID == null && latitude != null && longitude != null) {
                const checkCoordinates = await this.checkCoordinatesValidity(longitude, latitude);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, coordinates? wellknown.stringify(coordinates) : null, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
                return lastID;
            }
            else if(coordinates ==  null && zoneID != null && zoneID != 0 && latitude == null && longitude == null) {
                let zone = await this.zoneDAO.getZone(zoneID);
                console.log(zone)
                let centroid = turf.centroid(zone.coordinates);
                console.log(centroid)
                let lastID = await this.dao.createDocumentNode(title, description, zoneID, coordinates, centroid.geometry.coordinates[1], centroid.geometry.coordinates[0], stakeholders, scale, issuanceDate, type, language, pages);
                return lastID;
              } 
            else throw new WrongGeoreferenceError();
        } catch (err) {
            throw err;
        }
    }

    async updateDocumentGeoref(documentID: number, zoneID: number | null, coordinates: any | null, latitude: number | null, longitude: number | null): Promise<boolean> {
        try {
            if(coordinates == null && zoneID == 0 && latitude == null && longitude == null) {
                zoneID = null;
                let response = await this.dao.updateDocumentGeoref(documentID, zoneID, coordinates, latitude, longitude);
                return response;
            }
            else if(coordinates && zoneID == null && latitude == null && longitude == null) {
                const geo: Geometry= turf.geometry("Polygon", [coordinates]);
                const zoneExists = await ZoneDAO.zoneExistsCoord(wellknown.stringify(geo as wellknown.GeoJSONGeometry));
                if(zoneExists) throw new InsertZoneError();
                const checkCoordinates = await Kiruna.verifyContainedInKiruna(geo);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                let centroid = turf.centroid(geo);
                let response = await this.dao.updateDocumentGeoref(documentID, zoneID, wellknown.stringify(geo as wellknown.GeoJSONGeometry), centroid.geometry.coordinates[0], centroid.geometry.coordinates[1]);
                return response;
            }
            else if(coordinates ==  null && zoneID == null && latitude != null && longitude != null) {
                const checkCoordinates = await this.checkCoordinatesValidity(longitude, latitude);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                let response = await this.dao.updateDocumentGeoref(documentID, zoneID, coordinates, latitude, longitude);
                return response;
            }
            else if(coordinates ==  null && zoneID != null && zoneID != 0 && latitude == null && longitude == null) {
                let zone = await this.zoneDAO.getZone(zoneID);
                let centroid = turf.centroid(zone.coordinates);
                let response = await this.dao.updateDocumentGeoref(documentID, zoneID, coordinates, centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]);
                return response;
            }
            else throw new WrongGeoreferenceError();
        } catch(err) {
            throw err;
        }
    }

    async getDocument(documentID: number): Promise<Document> {
        try {
            const document = await this.dao.getDocumentByID(documentID);
            return document;
        } catch (err) {
            throw err;
        }
    }

    async getDocuments(filters: any): Promise<Document[]> {
        try {
            const documents = await this.dao.getDocsWithFilters(filters);
            return documents;
        } catch(err) {
            throw err;
        }
    }

    async deleteAllDocuments(): Promise<boolean> {
        try {
            const response = await this.dao.deleteAllDocuments();
            return response;
        } catch(err) {
            throw err;
        }
    }

    async addResource(documentID: number, names: string[], paths: string[]): Promise<boolean>{
        return await this.dao.addResource(documentID, names, paths);
      }
}

export {DocumentController}