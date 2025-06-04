import { Injectable } from "@nestjs/common";
import { MongoService } from "../mongo/mongo.service";
import * as QRCode from "qrcode";

@Injectable()
export class PowerAutomateService {
  powerAutomateService: any;
  constructor(private readonly mongoService: MongoService) {}

  getTag(tag: string, body: string) {
    const startTag = `[${tag}]`;
    const endTag = `[/${tag}]`;

    const startIndex = body.indexOf(startTag);
    if (startIndex === -1) return null;

    const endIndex = body.indexOf(endTag, startIndex);
    if (endIndex === -1) return null;

    const content = body.substring(startIndex + startTag.length, endIndex);

    return content;
  }

  async saveInPowerAutomateCollection(data: any) {
    const db = (await this.mongoService.getConexion()).db();
    const powerAutomateCache = db.collection("power-automate-cache");
    await powerAutomateCache.insertOne(data);
  }
  async getInfoForm(idTarea: string): Promise<any> {
    const db = (await this.mongoService.getConexion()).db();
    const powerAutomateCache = db.collection("power-automate-cache");

    // Buscar el documento por idTarea
    const result = await powerAutomateCache.findOne({ idTarea });

    if (!result) {
      throw new Error(
        `No se encontró información para la tarea con ID: ${idTarea}`,
      );
    }

    return result;
  }

  /* Crea un QR con los datos del parámetro parsedData */
  async createGreenPass(parsedData: any): Promise<string> {
    try {
      // Convertir los datos a una cadena JSON para codificarlos en el QR
      const qrData = JSON.stringify(parsedData);

      // Generar el código QR como una imagen base64
      const qrCodeBase64 = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: "H",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#1DA851", // Color verde para mantener la estética de la empresa
          light: "#FFFFFF",
        },
      });

      return qrCodeBase64;
    } catch (error) {
      console.error("Error al generar el código QR:", error);
      throw new Error(`Error al generar código QR: ${error.message}`);
    }
  }
}
