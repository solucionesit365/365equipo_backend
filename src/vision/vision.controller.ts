import { Controller, Post, Body } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";

@Controller("vision")
export class VisionController {
  private visionClient = new ImageAnnotatorClient();

  @Post("scan")
  async scanTicket(@Body() body: { image: string }) {
    try {
      const buffer = Buffer.from(
        body.image.replace(/^data:image\/\w+;base64,/, ""),
        "base64",
      );

      const [result] = await this.visionClient.textDetection(buffer);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        return { error: "No se detectó texto en la imagen" };
      }

      const fullText = detections[0].description;
      const ticketData = this.parseTicketText(fullText);

      return ticketData;
    } catch (error) {
      console.error("Error scanning ticket:", error);
      throw error;
    }
  }

  private parseTicketText(text: string) {
    const lines = text.split("\n");
    const ticket = {
      ticketId: null,
      nif: null,
      total: null,
    };

    // Regex patterns
    const nifRegex =
      /[A-Z]\d{8}|[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]|\d{8}[A-Z]/i;
    const totalRegex = /total\s*[\$]?\s*(\d+[.,]\d{2})/i;
    const ticketIdRegex = /[Nn]º?\s*(ticket|factura|documento)?\s*:?\s*(\d+)/i;

    lines.forEach((line) => {
      // Buscar NIF/CIF
      const nifMatch = line.match(nifRegex);
      if (nifMatch && !ticket.nif) {
        ticket.nif = nifMatch[0];
      }

      // Buscar total
      const totalMatch = line.match(totalRegex);
      if (totalMatch) {
        ticket.total = totalMatch[1];
      }

      // Buscar identificador del ticket
      const ticketIdMatch = line.match(ticketIdRegex);
      if (ticketIdMatch && !ticket.ticketId) {
        ticket.ticketId = ticketIdMatch[2];
      }
    });

    return ticket;
  }
}
