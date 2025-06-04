import { Response } from "express";
import { Controller, Post, Get, Query, UseGuards, Res } from "@nestjs/common";
import { GraphService } from "./graph.service";
import { SchedulerGuard } from "src/guards/scheduler.guard";

@Controller("graph")
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @UseGuards(SchedulerGuard)
  @Post()
  async getGraph() {
    return this.graphService.getUsers();
  }

  @Get("rooms")
  async getRooms() {
    return this.graphService.getRooms();
  }

  @Get("checkDisponibilidadRoom")
  async checkDisponibilidadRoom(@Query() { roomEmail, startDate, endDate }) {
    console.log(startDate);
    console.log(endDate);

    // const roomEmail = "box1@grupohorreols.com";
    // const startDate = DateTime.fromFormat(
    //   "2025-05-12 07:00",
    //   "yyyy-MM-dd HH:mm",
    // );

    // const endDate = DateTime.fromFormat("2025-05-12 23:00", "yyyy-MM-dd HH:mm");
    return this.graphService.getRoomAvailability(roomEmail, startDate, endDate);
  }

  @UseGuards(SchedulerGuard)
  @Get("toCsv")
  async usersToCsv(@Res() res: Response) {
    const users = (await this.graphService.getUsers()).value;

    // Crear el contenido CSV
    let csvContent = "displayName,mail\n"; // Headers

    users.forEach((user) => {
      // Escapar valores que contengan comas o comillas
      const displayName = this.escapeCsvValue(user.displayName || "");
      const mail = this.escapeCsvValue(user.mail || "");

      csvContent += `${displayName},${mail}\n`;
    });

    // Configurar headers para descarga
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="users.csv"');

    // Enviar el CSV
    res.send(csvContent);
  }

  // Método auxiliar para escapar valores CSV
  private escapeCsvValue(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
