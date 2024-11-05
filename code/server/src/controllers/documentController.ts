import { rejects } from "assert";
import { Document } from "../components/document";
import { DocumentDAO } from "../dao/documentDAO";
import { CoordinatesOutOfBoundsError, InvalidDocumentZoneError, WrongGeoreferenceError } from "../errors/documentErrors";
import * as turf from '@turf/turf';
import { GeoJSONFeature, GeoJSONGeometry, GeoJSONPoint } from "wellknown";
import { ZoneDAO } from "../dao/zoneDAO";

const wellknown = require('wellknown');
/**
 * Controller for handling document operations
 */
class DocumentController {
    private dao: DocumentDAO
    constructor() {
        this.dao = new DocumentDAO
    }

/**
 * Hadles the comunication between the route and the dao of the document node creation
 * @param title the title of the document
 * @param icon url for the icon
 * @param description description of the document
 * @param zoneID the id of the zone georeferenced
 * @param latitude latitude of the node
 * @param longitude longitude of the node
 * @param stakeholders people participating on the document
 * @param scale It is the relationship between the dimensions drawn on a plan or architectural drawing and the actual dimensions of the building
 * @param issuanceDate the date in which the document has been issued
 * @param type document type
 * @param language document language
 * @param pages number of pages. Can also be an interval of pages
 * @returns the documentID of the lastly inserted document
 * @throws generic error if the database query fails
 * @throws DocumentZoneNotFoundError if the zone specified is not in the database
 * @throws WrongGeoreferenceError if the georeference format is not valid
 * @throws InvalidDocumentZoneError if the specified zone is not a polygon
 */
    async createNode (title: string, icon: string, description: string, zoneID: number | null, latitude: number | null, longitude: number | null, stakeholders: string, scale: string, issuanceDate: string, type: string, language: string | null, pages: string | null): Promise<number> {
        try {
            if(!zoneID && latitude && longitude) {
                const checkCoordinates = await this.checkCoordinatesValidity(longitude, latitude);
                if(!checkCoordinates) throw new CoordinatesOutOfBoundsError();
                else {
                    let lastID = await this.dao.createDocumentNode(title, icon, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, type, language, pages);
                    return lastID;
                }
            }
            else if(zoneID && !latitude && !longitude) {
                let zone = await ZoneDAO.prototype.getZone(zoneID);
                let randCoordinates = await this.getRandCoordinates(zone.coordinates);
                let lastID = await this.dao.createDocumentNode(title, icon, description, zoneID, randCoordinates.latitude, randCoordinates.longitude, stakeholders, scale, issuanceDate, type, language, pages);
                return lastID;
            }
            else throw new WrongGeoreferenceError();
        }
        catch(err) {
            throw err;
        }
    }
/**
 * Returns a full document given its id
 * @param documentID the id of the document to return
 * @returns the full document with links number and resources and attachments
 * @throws generic error if the database query fails
 * @throws DocumentNotFoundError if the documentID is not presend into the database
 */
    async getDocumentByID(documentID: number): Promise<Document> {
        try {
            let document = await this.dao.getDocumentByID(documentID);
            return document;
        }
        catch(err) {
            throw err;
        }
    }
/**
 * Returns all the documents titles and the id for retrieving the full document
 * @returns a list of couples id-title for all the documents
 * @throws generic error if the database query fails
 */
    async getDocumentsTitles(): Promise<{documentID: number, title: string}[]> {
        try {
            let titles = await this.dao.getDocumentsTitles();
            return titles;
        }
        catch(err) {
            throw err;
        }
    }
/**
 * Returns all the documents in the database
 * @returns a list of documents
 * @throws generic error if the database query fails
 */
    async getAllDocuments(): Promise<Document[]> {
        try {
            let documents = await this.dao.getDocumentsFull();
            return documents;
        }
        catch(err) {
            throw err;
        }
    }

    async getAllDocumentsCoordinates(): Promise<{documentID: number, title: string, icon: string, geoJson: turf.AllGeoJSON}[]> {
        try {
            let data = await this.dao.getAllDocumentsCoordinates();
            let coordinates = data.map(coord => {return {
                documentID: coord.documentID,
                title: coord.title,
                icon: coord.icon,
                geoJson: turf.point([coord.lon, coord.lat])
            }})
                return coordinates;
        }
        catch(err) {
            throw err;
        }
    }
/**
 * Deletes all document entries
 * @returns a void promise
 * @throws generic error if the database query fails
 */
    async deleteAllDocuments(): Promise<void> {
        try {
            await this.dao.deleteAllDocuments();
            return;
        }
        catch(err) {
            throw err;
        }
    }

/**
 * 
 * @param polygon a geojson polygon 
 * @returns random coordinates in the poygon in {lat, lon} format
 * @throws InvalidDocumentZoneError if the specified zone is not a polygon
 * 
 */
    private async getRandCoordinates(polygon: any): Promise<{latitude: number, longitude: number}> {
        return new Promise((resolve, reject) => {
            const bbox = turf.bbox(polygon);
            const gridPoints = turf.pointGrid(bbox, 0.001, {
                units: 'degrees',
                mask: polygon
            });
            if (gridPoints.features.length === 0) {
                reject(new InvalidDocumentZoneError())
            }
            else {
                const randomIndex = Math.floor(Math.random() * gridPoints.features.length);
                const randomPoint = gridPoints.features[randomIndex].geometry.coordinates;
                resolve({
                    latitude: randomPoint[1],
                    longitude: randomPoint[0]
                })
            }
        })
    }
/**
 * Checks the validity of the coordinates by looking if they are in the Kiruna square
 * @param lon longitude of the point
 * @param lat latitude of the point
 * @returns true if the coordinates are in the Kiruna area, false otherwise
 * @throws generic error if the database query fails
 */
    private async checkCoordinatesValidity(lon: number, lat: number): Promise<boolean> {
        try {
            let kirunaPolygon = await this.dao.getKirunaPolygon();
            const kirunaPolygonGeoJSON = wellknown.parse(kirunaPolygon);
            const point = turf.point([lon, lat]);
            const checkInside = turf.booleanPointInPolygon(point, kirunaPolygonGeoJSON);
            return checkInside;
        }
        catch(err) {
            throw err;
        }
    }
}

export {DocumentController};