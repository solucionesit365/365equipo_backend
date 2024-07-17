import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { EmpresaService } from "./empresa.service";
import {
  CreateEmpresaDto,
  DeleteEmpresaDto,
  UpdateEmpresaDto,
} from "./empresa.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("empresa")
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @UseGuards(AuthGuard)
  @Post("create")
  async createEmpresa(@Body() reqCreateEmpresa: CreateEmpresaDto) {
    return await this.empresaService.createEmpresa(reqCreateEmpresa);
  }

  @UseGuards(AuthGuard)
  @Post("update")
  async updateEmpresa(@Body() reqUpdateEmpresa: UpdateEmpresaDto) {
    return await this.empresaService.updateEmpresa(reqUpdateEmpresa);
  }

  @UseGuards(AuthGuard)
  @Get("get")
  async getEmpresas() {
    return await this.empresaService.getEmpresas();
  }

  @UseGuards(AuthGuard)
  @Post("delete")
  async deleteEmpresa(@Body() reqDeleteEmpresa: DeleteEmpresaDto) {
    return await this.empresaService.deleteEmpresa(reqDeleteEmpresa);
  }
}
