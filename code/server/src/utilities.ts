import {User, Role} from "./components/user";
import { DocumentDAO } from "./dao/documentDAO";

import kiruna from "./kiruna.json"
import { booleanContains } from "@turf/boolean-contains";
import { Geometry } from "geojson";

class Utilities{    
    static checkUrbanDeveloper(user: User): boolean{
        return user.role=== Role.DEVELOPER;
    }

    static checkUrbanPlanner(user: User): boolean{
        return user.role=== Role.PLANNER;
    }

    static checkAdmin(user: User): boolean{
        return user.role=== Role.ADMIN;
    }

    /**
     * Middleware function to check if the user is a urban developer.
     * 
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * If the user is authenticated and is a urban developer, it calls the next middleware function. Otherwise, it returns a 401 error response.
    */
    isUrbanDeveloper(req: any, res: any, next: any) {
        if (req.isAuthenticated() && Utilities.checkUrbanDeveloper(req.user)){
            return next();
        } 
        return res.status(401).json({ error: "User is not authorized"});
    }

    /**
     * Middleware function to check if the user is a urban planner.
     * 
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * If the user is authenticated and is a urban planner, it calls the next middleware function. Otherwise, it returns a 401 error response.
    */
    isUrbanPlanner(req: any, res: any, next: any) {
        if (req.isAuthenticated() && Utilities.checkUrbanPlanner(req.user)){
            return next();
        } 
        return res.status(401).json({ error: "User is not authorized"});
    }

    /**
     * Middleware function to check if the user is a admin.
     * 
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * If the user is authenticated and is a admin, it calls the next middleware function. Otherwise, it returns a 401 error response.
    */
    isAdmin(req: any, res: any, next: any) {
        if (req.isAuthenticated() && Utilities.checkAdmin(req.user)){
            return next();
        } 
        return res.status(401).json({ error: "User is not authorized"});
    }

    async documentExists(req: any, res: any, next: any) {
        try {
            let exists = await DocumentDAO.documentExists(req.params.id); 
            if(!exists) {  
                return res.status(404).json({ error: 'Document not found' });
            }
            return next();
        } catch(err: any) {
            res.status(err.code? err.code : 500).json({error: err.message});
        }
    }

    async paginationCheck(req: any, res: any, next: any) {
        if((req.query.pageSize && req.query.pageNumber) || (!req.query.pageSize && !req.query.pageNumber)) 
            return next();
        else res.status(422).json({error: "Pagination error: page size or page number missing"});
    }

    isValidDate(dateStr: string): boolean {
        const parts = dateStr.split('/').map(Number);
    
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const date = new Date(year, month - 1, day);
            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1 &&
                date.getDate() === day
            );
        } 
        else if (parts.length === 2) {
            const [month, year] = parts;
            const date = new Date(year, month - 1, 1);
            return (
                date.getFullYear() === year &&
                date.getMonth() === month - 1
            );
        } 
        else if (parts.length === 1) {
            const [year] = parts;
            return year >= 1000 && year <= 9999;
        }
    
        return false;
    }
    
    isValidScale(value: string): boolean {
        const scalePattern = /^1:\d{1,3}(?:,\d{3})*$/;
        const validStrings = ["Blueprints/effects", "Concept", "Text"];
    
        return scalePattern.test(value) || validStrings.includes(value);
    }
}

class Kiruna {
    static async getKirunaGeometry(): Promise<Geometry>{
        return kiruna.features[0].geometry as Geometry;
    }
    
    static async verifyContainedInKiruna(other: Geometry): Promise<boolean>{
        return booleanContains(await Kiruna.getKirunaGeometry(),other);
    }
}

export {Utilities, Kiruna};