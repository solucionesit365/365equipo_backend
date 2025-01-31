// src/common/middlewares/raw-body.middleware.ts

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as rawBody from "raw-body";

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Solo aplica a la ruta específica que necesita el raw body
    if (req.originalUrl === "/test/email") {
      // Guarda el raw body en la propiedad `rawBody` del request
      req["rawBody"] = await rawBody(req);
    }
    next();
  }
}
