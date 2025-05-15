import { Controller, Post, Get, Query, UseGuards } from "@nestjs/common";
import { GraphService } from "./graph.service";
// import { DateTime } from "luxon";
import { AuthGuard } from "src/guards/auth.guard";
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

  @UseGuards(AuthGuard)
  @Get("checkDisponibilidadRoom")
  async checkDisponibilidadRoom(@Query() { roomEmail, startDate, endDate }) {
    console.log(startDate);
    console.log(endDate);

    return this.graphService.getRoomAvailability(roomEmail, startDate, endDate);
  }
}
