import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FormacionService } from "./formacion.service";
import { AuthGuard } from "../guards/auth.guard";
import {
  CompartirFormacionDto,
  CompartirFormacionInvitadoDto,
  CompartirFormacionManualDto,
  CompletarFormacionInvitadoDto,
  CreateFormacionDto,
  DeleteFormacionDto,
  GetFormacionByIdDto,
  GetFormacionesDto,
  GetFormacionInvitadoDto,
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

  // @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Post("compartir/grupo")
  async compartirFormacionGrupo(@Body() req: CompartirFormacionDto) {
    return await this.formacionService.compartirFormacionGrupo(req);
  }

  @UseGuards(AuthGuard)
  @Post("compartir/manual")
  async compartirFormacionManual(@Body() req: CompartirFormacionManualDto) {
    return await this.formacionService.compartirFormacionManual(req);
  }

  @UseGuards(AuthGuard)
  @Post("completar")
  async completarFormacion(
    @Body() req: { trabajadorId: number; formacionId: string },
  ) {
    return await this.formacionService.completarFormacion(req);
  }

  @UseGuards(AuthGuard)
  @Get("completadas")
  async getFormacionesCompletadas() {
    return await this.formacionService.getFormacionesCompletadas();
  }

  // Endpoints para invitados (sin autenticación)
  @UseGuards(AuthGuard)
  @Post("compartir/invitado")
  async compartirFormacionInvitado(
    @Body() body: CompartirFormacionInvitadoDto,
    @Req() req: any,
  ) {
    return await this.formacionService.compartirFormacionInvitado(
      body,
      req.sqlUser.id,
    );
  }

  @Get("invitado")
  async getFormacionInvitado(@Query() req: GetFormacionInvitadoDto) {
    return await this.formacionService.getFormacionInvitado(req);
  }

  @Post("completar/invitado")
  async completarFormacionInvitado(@Body() req: CompletarFormacionInvitadoDto) {
    return await this.formacionService.completarFormacionInvitado(req);
  }
}
