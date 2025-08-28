/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { InspeccionFichajesService } from "./inspeccionfichajes.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("inspeccionFichajes")
export class InspeccionFichajesController {
  constructor(
    private readonly inspeccionFichajeService: InspeccionFichajesService,
  ) {}

  @UseGuards(AuthGuard)
  @Get("getInspeccionFichajes")
  async getInspeccionFichajes() {
    try {
      const res = await this.inspeccionFichajeService.getInspeccionFichajes();
      console.log(res);
      return res;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @UseGuards(AuthGuard)
  @Post("createInspeccionFichajes")
  async createInspeccionFichajes(@Body() data) {
    try {
      const res = await this.inspeccionFichajeService.createInspeccionFichajes(
        data,
      );
      return res;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @Get("validarPin")
  async validarPin(@Query() pin: { pin: number }) {
    try {
      const data = await this.inspeccionFichajeService.validarPin(
        Number(pin.pin),
      );
      if (!data) throw new Error("Pin incorrecto");
      return { ok: true, message: "Pin correcto", data };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
  @Post("updateInspeccionFichajes")
  async updateInspeccionFichajes(@Body() { id, data }) {
    try {
      console.log(id);

      console.log(data);

      const res = await this.inspeccionFichajeService.updateInspeccionFichajes(
        id,
        data,
      );
      return res;
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
