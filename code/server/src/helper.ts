import express from "express"
import { ZoneDAO } from "./dao/zoneDAO";
import { DatabaseConnectionError } from "./errors/zoneError";

const { validationResult } = require("express-validator");

/**
 * The ErrorHandler class is used to handle errors in the application.
 */
class ErrorHandler {

    /**
     * Validates the request object and returns an error if the request object is not formatted properly, according to the middlewares used when defining the request.
     * @param req - The request object
     * @param res - The response object
     * @param next - The next function
     * @returns Returns the next function if there are no errors or a response with a status code of 422 if there are errors.
     */
    validateRequest(req: any, res: any, next: any) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            console.log(errors);
            let error = "The parameters are not formatted properly\n\n"
            errors.array().forEach((e: any) => {
                error += "- Parameter: **" + e.path + "** - Reason: *" + e.msg + "* - Location: *" + e.location + "*\n\n"
            })
            return res.status(422).json({ error: error })
        }
        return next()
    }

    /**
     * Registers the error handler.
     * @param router - The router object
     */
    static registerErrorHandler(router: express.Application) {
        router.use((err: any, req: any, res: any, next: any) => {
            return res.status(err.customCode || 503).json({
                error: err.customMessage || "Internal Server Error",
                status: err.customCode || 503
            });
        })
    }
}

class Kiruna{
    private dao: ZoneDAO;

    constructor(){
        this.dao= new ZoneDAO();
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Function to insert a record with retry
    private async insertWithRetry(maxRetries: number,delayMs: number): Promise<void> {
        let attempts: number= 0;
        while (attempts < maxRetries) {
            try {
                await this.dao.insertKirunaPolygon();
                return;
            } catch (err: any) {
                attempts++;

                if (attempts >= maxRetries) {
                    throw new DatabaseConnectionError(err.message);
                }
                await Kiruna.delay(delayMs);
            }
        }
    }

    async checkKiruna(): Promise<void>{
        if(await this.dao.getKirunaPolygon()){
            return;
        }
        await this.insertWithRetry(5,1000);
    }
}

export {ErrorHandler};
export {Kiruna};
