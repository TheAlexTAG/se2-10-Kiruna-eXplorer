import { DocumentDAO } from "../dao/documentDAO";
import { CoordinatesOutOfBoundsError, WrongGeoreferenceError} from "../errors/documentErrors";
import * as turf from "@turf/turf"
import kiruna from "../kiruna.json"
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry } from "geojson";
import { InsertZoneError } from "../errors/zoneError";
import wellknown from "wellknown"
import { Document, DocumentData, DocumentGeoData } from "../components/document";
import { Kiruna } from "../utilities";

class DocumentControllerHelper {
    async checkCoordinatesValidity(lon: number, lat: number): Promise<boolean> {
        const point = turf.point([lon, lat]);
        const checkInside = turf.booleanPointInPolygon(point, kiruna.features[0].geometry as GeoJSON.MultiPolygon)
        return checkInside;
    }

    isAssignedToKiruna(documentGeoData: DocumentGeoData): boolean {
        return (
            documentGeoData.coordinates == null 
            && documentGeoData.zoneID == 0 
            && documentGeoData.latitude == null 
            && documentGeoData.longitude == null
        )
    }

    async createNodeAssignedToKiruna(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO): Promise<number> {
        documentGeoData.zoneID = null;
        let lastID = await dao.createDocumentNode(documentData, documentGeoData);
        return lastID;
    }

    isAssignedToCustomZone(documentGeoData: DocumentGeoData): boolean {
        return (
            documentGeoData.coordinates 
            && documentGeoData.zoneID == null 
            && documentGeoData.latitude == null 
            && documentGeoData.longitude == null
        )
    }

    async createNodeAssignedToCustomZone(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO): Promise<number> {
        const geo: Geometry= turf.geometry("Polygon", [documentGeoData.coordinates])
        const zoneExists = await ZoneDAO.zoneExistsCoord(wellknown.stringify(geo as wellknown.GeoJSONGeometry));
        if(zoneExists) 
            throw new InsertZoneError();

        const checkCoordinates = await Kiruna.verifyContainedInKiruna(geo);
        if(!checkCoordinates) 
            throw new CoordinatesOutOfBoundsError();

        let centroid = turf.centroid(geo);
        documentGeoData.coordinates = wellknown.stringify(geo as wellknown.GeoJSONGeometry);
        documentGeoData.latitude = centroid.geometry.coordinates[1];
        documentGeoData.longitude = centroid.geometry.coordinates[0];

        let lastID = await dao.createDocumentNode(documentData, documentGeoData);
        return lastID;
    }

    isAssignedToPoint(documentGeoData: DocumentGeoData): boolean {
        return (
            documentGeoData.coordinates ==  null 
            && documentGeoData.zoneID == null 
            && documentGeoData.latitude != null 
            && documentGeoData.longitude != null
        )
    }

    async createNodeAssignedToPoint(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO): Promise<number> {
        const checkCoordinates = await this.checkCoordinatesValidity(documentGeoData.longitude as number, documentGeoData.latitude as number);
        if(!checkCoordinates) 
            throw new CoordinatesOutOfBoundsError();
        
        let lastID = await dao.createDocumentNode(documentData, documentGeoData);
        return lastID;
    }

    isAssignedToExistingZone(documentGeoData: DocumentGeoData) {
        return (
            documentGeoData.coordinates ==  null 
            && documentGeoData.zoneID != null 
            && documentGeoData.zoneID != 0 
            && documentGeoData.latitude == null 
            && documentGeoData.longitude == null
        )
    }

    async createNodeAssignedToExistingZone(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO, zoneDAO: ZoneDAO): Promise<number> {
        let zone = await zoneDAO.getZone(documentGeoData.zoneID as number);

        let centroid = turf.centroid(zone.coordinates);
        documentGeoData.latitude = centroid.geometry.coordinates[1];
        documentGeoData.longitude = centroid.geometry.coordinates[0];

        let lastID = await dao.createDocumentNode(documentData, documentGeoData);
        return lastID;
    }
}


class DocumentController {
    private readonly dao: DocumentDAO
    private readonly zoneDAO: ZoneDAO
    private readonly helper: DocumentControllerHelper

    constructor() {
        this.dao = new DocumentDAO();
        this.zoneDAO = new ZoneDAO();
        this.helper = new DocumentControllerHelper();
    }

    async createNode(documentData: DocumentData, documentGeoData: DocumentGeoData): Promise<number> {
        if(this.helper.isAssignedToKiruna(documentGeoData)) 
            return await this.helper.createNodeAssignedToKiruna(documentData, documentGeoData, this.dao);

        if(this.helper.isAssignedToCustomZone(documentGeoData)) 
            return await this.helper.createNodeAssignedToCustomZone(documentData, documentGeoData, this.dao);

        if(this.helper.isAssignedToPoint(documentGeoData)) 
            return await this.helper.createNodeAssignedToPoint(documentData, documentGeoData, this.dao);

        if(this.helper.isAssignedToExistingZone(documentGeoData)) 
            return await this.helper.createNodeAssignedToExistingZone(documentData, documentGeoData, this.dao, this.zoneDAO);

        throw new WrongGeoreferenceError();
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
                const checkCoordinates = await this.helper.checkCoordinatesValidity(longitude, latitude);
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