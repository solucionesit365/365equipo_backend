import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { FormacionService } from "./formacion.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CreateFormacionDto,
  DeleteFormacionDto,
  GetFormacionByIdDto,
  GetFormacionesDto,
  UpdateFormacionDto,
} from "./formacion.dto";

@Controller("formacion")
export class FormacionController {
  constructor(private readonly formacionService: FormacionService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getFormaciones(@Query() req: GetFormacionesDto) {
    return await this.formacionService.getFormaciones(req);
  }

  @UseGuards(AuthGuard)
  @Get("id")
  async getFormacionById(@Query() req: GetFormacionByIdDto) {
    return await this.formacionService.getFormacionById(req);
  }

  @UseGuards(AuthGuard)
  @Post("create")
  async createFormacion(@Body() req: CreateFormacionDto) {
    return await this.formacionService.createFormacion(req);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateFormacion(@Body() req: UpdateFormacionDto) {
    return await this.formacionService.updateFormacion(req);
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteFormacion(@Body() req: DeleteFormacionDto) {
    await this.formacionService.deleteFormacion(req.id);
    return true;
  }
}
