import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { DateTime } from "luxon";

@Injectable()
export class CryptoService {
  hashFile512(file: Buffer): string {
    return createHash("sha512").update(file).digest("hex");
  }

  hashFile256(file: Buffer): string {
    return createHash("sha256").update(file).digest("hex");
  }

  // Generar código serguro de verificación.
  createCsv(): string {
    return createHash("sha256").update(DateTime.now().toISO()).digest("hex");
  }
}
