import { Controller, Body, UseGuards, Post, Get, Query } from "@nestjs/common";
import { EncargosInterface } from "./encargos.interface";
import { EncargosService } from "./encargos.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("encargos")
export class EncargosController {
  constructor(private readonly EncargoService: EncargosService) {}

  @UseGuards(AuthGuard)
  @Post("newEncargo")
  async addAnuncio(@Body() encargo: EncargosInterface) {
    try {
      return await this.EncargoService.newEncargo(encargo);
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getEncargos")
  async getEncargos(@Query("idTienda") idTienda: number) {
    try {
      return await this.EncargoService.getEncargos(idTienda);
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateEncargo")
  async updateEncargo(@Body() encargo: EncargosInterface) {
    try {
      return await this.EncargoService.updateEncargo(encargo);
    } catch (error) {
      console.log(error);
    }
  }
}
