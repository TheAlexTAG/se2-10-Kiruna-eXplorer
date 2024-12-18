import { DocumentDAO } from "../dao/documentDAO";
import { CoordinatesOutOfBoundsError, WrongGeoreferenceError, InvalidPageNumberError} from "../errors/documentErrors";
import * as turf from "@turf/turf"
import kiruna from "../kiruna.json"
import { ZoneDAO } from "../dao/zoneDAO";
import { Geometry } from "geojson";
import { InsertZoneError } from "../errors/zoneError";
import wellknown from "wellknown"
import { Document, DocumentData, DocumentEditData, DocumentGeoData } from "../components/document";
import { Kiruna } from "../utilities";
import { InternalServerError } from "../errors/link_docError";

enum Modality {
    CREATE = "Create",
    UPDATE = "Update"
}

interface PaginatedDocs {
    documents: Document[],
    totalItems: number,
    itemsPerPage: number,
    currentPage: number,
    totalPages: number
}

class DocumentControllerHelper {

    isDocumentData(data: DocumentData | DocumentEditData): data is DocumentData {
        return data.title !== null; // Verifica se `title` non è `null`
    }

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

    async nodeAssignedToKiruna(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.CREATE): Promise<number>
    async nodeAssignedToKiruna(documentData: DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.UPDATE): Promise<boolean>
    async nodeAssignedToKiruna(documentData: DocumentData | DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality): Promise<number | boolean> {
        documentGeoData.zoneID = null;
        if(modality == Modality.CREATE && this.isDocumentData(documentData)) {
            let lastID = await dao.createDocumentNode(documentData, documentGeoData);
            return lastID;
        }
        if(modality == Modality.UPDATE && !this.isDocumentData(documentData)) {
            let response = await dao.updateDocument(documentData, documentGeoData, true);
            return response;
        }
        throw new InternalServerError("Wrong Modality");
    }

    isAssignedToCustomZone(documentGeoData: DocumentGeoData): boolean {
        return (
            Array.isArray(documentGeoData.coordinates) &&
            documentGeoData.coordinates.every(
                (coord) => Array.isArray(coord) && coord.length === 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number'
            ) &&
            documentGeoData.zoneID == null &&
            documentGeoData.latitude == null &&
            documentGeoData.longitude == null
        );
    }

    async nodeAssignedToCustomZone(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.CREATE): Promise<number>
    async nodeAssignedToCustomZone(documentData: DocumentEditData , documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.UPDATE): Promise<boolean>
    async nodeAssignedToCustomZone(documentData: DocumentData | DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality): Promise<number | boolean> {
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

        if(modality == Modality.CREATE && this.isDocumentData(documentData)) {
            let lastID = await dao.createDocumentNode(documentData, documentGeoData);
            return lastID;
        }
        if(modality == Modality.UPDATE && !this.isDocumentData(documentData)) {
            let response = await dao.updateDocument(documentData, documentGeoData, true);
            return response;
        }
        throw new InternalServerError("Wrong modality");
    }


    isAssignedToPoint(documentGeoData: DocumentGeoData): boolean {
        return (
            documentGeoData.coordinates ==  null 
            && documentGeoData.zoneID == null 
            && documentGeoData.latitude != null 
            && documentGeoData.longitude != null
        )
    }
    async nodeAssignedToPoint(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.CREATE): Promise<number>
    async nodeAssignedToPoint(documentData: DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality.UPDATE): Promise<boolean>
    async nodeAssignedToPoint(documentData: DocumentData | DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, modality: Modality): Promise<number | boolean> {
        const checkCoordinates = await this.checkCoordinatesValidity(documentGeoData.longitude as number, documentGeoData.latitude as number);
        if(!checkCoordinates) 
            throw new CoordinatesOutOfBoundsError();
        
        if(modality == Modality.CREATE && this.isDocumentData(documentData)) {
            let lastID = await dao.createDocumentNode(documentData, documentGeoData);
            return lastID;
        }
        if(modality == Modality.UPDATE && !this.isDocumentData(documentData)) {
            let response = await dao.updateDocument(documentData, documentGeoData, true);
            return response;
        }
        throw new InternalServerError("Wrong modality");
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

    async nodeAssignedToExistingZone(documentData: DocumentData, documentGeoData: DocumentGeoData, dao: DocumentDAO, zoneDAO: ZoneDAO, modality: Modality.CREATE): Promise<number>
    async nodeAssignedToExistingZone(documentData: DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, zoneDAO: ZoneDAO, modality: Modality.UPDATE): Promise<boolean>
    async nodeAssignedToExistingZone(documentData: DocumentData | DocumentEditData, documentGeoData: DocumentGeoData, dao: DocumentDAO, zoneDAO: ZoneDAO, modality: Modality): Promise<number | boolean> {
        let zone = await zoneDAO.getZone(documentGeoData.zoneID as number);

        let centroid = turf.centroid(zone.coordinates);
        documentGeoData.latitude = centroid.geometry.coordinates[1];
        documentGeoData.longitude = centroid.geometry.coordinates[0];

        if(modality == Modality.CREATE && this.isDocumentData(documentData)) {
            let lastID = await dao.createDocumentNode(documentData, documentGeoData);
            return lastID;
        }
        if(modality == Modality.UPDATE && !this.isDocumentData(documentData)) {
            let response = await dao.updateDocument(documentData, documentGeoData, true);
            return response;
        }
        throw new InternalServerError("Wrong modality");
    }

    hasWrongGeoref(documentGeoData: DocumentGeoData): boolean {
        const isValidCoordinates = (
            documentGeoData.coordinates != null
            && documentGeoData.zoneID == null
            && documentGeoData.latitude == null
            && documentGeoData.longitude == null
        );

        const isValidZone = (
            documentGeoData.coordinates == null
            && documentGeoData.zoneID != null
            && documentGeoData.latitude == null
            && documentGeoData.longitude == null
        );

        const isValidLatLon = (
            documentGeoData.coordinates == null
            && documentGeoData.zoneID == null
            && documentGeoData.latitude != null
            && documentGeoData.longitude != null
        );

        const hasNoGeoref = (
            documentGeoData.coordinates == null
            && documentGeoData.zoneID == null
            && documentGeoData.latitude == null
            && documentGeoData.longitude == null
        )

        return !(isValidCoordinates || isValidZone || isValidLatLon || hasNoGeoref)
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
            return await this.helper.nodeAssignedToKiruna(documentData, documentGeoData, this.dao, Modality.CREATE);

        if(this.helper.isAssignedToCustomZone(documentGeoData)) 
            return await this.helper.nodeAssignedToCustomZone(documentData, documentGeoData, this.dao, Modality.CREATE);

        if(this.helper.isAssignedToPoint(documentGeoData)) 
            return await this.helper.nodeAssignedToPoint(documentData, documentGeoData, this.dao, Modality.CREATE);

        if(this.helper.isAssignedToExistingZone(documentGeoData)) 
            return await this.helper.nodeAssignedToExistingZone(documentData, documentGeoData, this.dao, this.zoneDAO, Modality.CREATE);

        throw new WrongGeoreferenceError();
    }

    async updateDocument(documentData: DocumentEditData, documentGeoData: DocumentGeoData): Promise<boolean> {

        if(this.helper.isAssignedToKiruna(documentGeoData)) 
            return await this.helper.nodeAssignedToKiruna(documentData, documentGeoData, this.dao, Modality.UPDATE);

        if(this.helper.isAssignedToCustomZone(documentGeoData)) 
            return await this.helper.nodeAssignedToCustomZone(documentData, documentGeoData, this.dao, Modality.UPDATE);

        if(this.helper.isAssignedToPoint(documentGeoData)) 
            return await this.helper.nodeAssignedToPoint(documentData, documentGeoData, this.dao, Modality.UPDATE);

        if(this.helper.isAssignedToExistingZone(documentGeoData)) 
            return await this.helper.nodeAssignedToExistingZone(documentData, documentGeoData, this.dao, this.zoneDAO, Modality.UPDATE);

        if(this.helper.hasWrongGeoref(documentGeoData)) throw new WrongGeoreferenceError();

        return await this.dao.updateDocument(documentData, documentGeoData);
    }

    async getDocument(documentID: number): Promise<Document> {
        const document = await this.dao.getDocumentByID(documentID);
        return document;
    }

    async getDocuments(filters: any): Promise<Document[]> {
        const documents = await this.dao.getDocsWithFilters(filters);
        return documents;
    }

    async getDocumentsWithPagination(filters: any, pageNumber: number, pageSize: number = 10): Promise<PaginatedDocs> {
        const documents = await this.dao.getDocsWithFilters(filters);

        if(documents.length === 0) return {
            documents: documents,
            totalItems: 0,
            itemsPerPage: pageSize,
            currentPage: pageNumber,
            totalPages: 0
        }

        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const totalPages = Math.ceil(documents.length / pageSize);

        if(pageNumber > totalPages)
            throw new InvalidPageNumberError();

        const paginatedDocs: PaginatedDocs = {
            documents: documents.slice(startIndex, endIndex),
            totalItems: documents.length,
            itemsPerPage: pageSize,
            currentPage: pageNumber,
            totalPages: totalPages
        }
        return paginatedDocs;
    }

    async getStakeholders(): Promise<string[]> {
        const response = await this.dao.getStakeholders();
        return response;
    }

    async updateDiagramDate(documentIDs: number[], nodeXs: number [], nodeYs: number[]): Promise<boolean> {
        console.log(documentIDs, nodeXs, nodeYs);
        const response = await this.dao.updateDiagram(documentIDs, nodeXs, nodeYs);
        return response;
    }

    async deleteAllDocuments(): Promise<boolean> {
        const response = await this.dao.deleteAllDocuments();
        return response;
    }

    async addResource(documentID: number, names: string[], paths: string[]): Promise<boolean>{
        return await this.dao.addResource(documentID, names, paths);
      }
}



export {DocumentController, DocumentControllerHelper}