import {User, Role} from "./components/user";
import { DocumentDAO } from "./dao/documentDAO";

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
        if (await DocumentDAO.documentExists(req.params.id)) {
            return next();
        }
        return res.status(404).json({ error: "Document not found"});
    }
    
}

export {Utilities};