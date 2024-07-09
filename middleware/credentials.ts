import { NextFunction, Request, Response } from "express";
import allowedOrigins from "../config/allowedOrigins";
const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin as string)) {
        res.header("Access-Control-Allow-Credentials"); //REMOVED TRUE
    }
    next();
}

module.exports = credentials