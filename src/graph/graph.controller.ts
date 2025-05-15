import { Controller, Post, Get, Query } from "@nestjs/common";
import { GraphService } from "./graph.service";
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
}
