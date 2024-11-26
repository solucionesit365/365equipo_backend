import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { AuthGuard } from "../guards/auth.guard";

@Controller("vision")
export class VisionController {
  private visionClient = new ImageAnnotatorClient();

  @UseGuards(AuthGuard)
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
      // console.log("Texto detectado:", fullText); // Para debugging
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
      total: null,
      fecha: null,
    };

    // Patrones específicos para este formato de ticket
    const ticketIdRegex = /N:\s*(\d+)/i; // Busca "N:" seguido de números
    const totalRegex = /TOTAL:?\s*(\d+[.,]\d{2})/i; // Busca "TOTAL" seguido de números con decimales
    const fechaRegex = /(\d{2}-\d{2}-\d{4})/; // Formato DD-MM-YYYY

    lines.forEach((line) => {
      // Para debugging
      // console.log("Procesando línea:", line);

      // Buscar número de ticket usando regex
      const ticketIdMatch = line.match(ticketIdRegex);
      if (ticketIdMatch) {
        ticket.ticketId = ticketIdMatch[1]; // Esto capturará el número después de "N:"
      }

      // Buscar total usando regex
      const totalMatch = line.match(totalRegex);
      if (totalMatch) {
        ticket.total = totalMatch[1];
      }

      // Buscar fecha
      const fechaMatch = line.match(fechaRegex);
      if (fechaMatch) {
        ticket.fecha = fechaMatch[1];
      }
    });

    // Si no se encontró el total con el regex específico, buscar en formato más simple
    if (!ticket.total) {
      lines.forEach((line) => {
        if (line.toLowerCase().includes("total")) {
          const simpleTotal = line.match(/(\d+[.,]\d{2})/);
          if (simpleTotal) {
            ticket.total = simpleTotal[1];
          }
        }
      });
    }

    return ticket;
  }
}
