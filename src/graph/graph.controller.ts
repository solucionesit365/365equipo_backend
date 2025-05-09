import { Controller, Post, Get } from "@nestjs/common";
import { GraphService } from "./graph.service";
import { DateTime } from "luxon";

@Controller("graph")
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Post()
  async getGraph() {
    return this.graphService.getUsers();
  }

  @Get("rooms")
  async getRooms() {
    return this.graphService.getRooms();
  }

  @Get("checkDisponibilidadRoom")
  async checkDisponibilidadRoom() {
    const roomEmail = "box1@grupohorreols.com";
    const startDate = DateTime.fromFormat(
      "2025-05-09 07:00",
      "yyyy-MM-dd HH:mm",
    );

    const endDate = DateTime.fromFormat("2025-05-10 23:00", "yyyy-MM-dd HH:mm");
    return this.graphService.getRoomAvailability(roomEmail, startDate, endDate);
  }
}
