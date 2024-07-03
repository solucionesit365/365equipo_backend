import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { ParFichajeService } from "./par-fichaje.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { SalidaRequestDto } from "./par-fichaje.dto";

@Controller("par-fichaje")
export class ParFichajeController {
  constructor(
    private readonly trabajadorService: TrabajadorService,
    private readonly parFichajeService: ParFichajeService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("entrada")
  async entrada(
    @User() user: UserRecord,
    @Body() body: { latitud?: number; longitud?: number },
  ) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    await this.parFichajeService.entrada(
      usuarioCompleto,
      body.latitud,
      body.longitud,
    );

    return true;
  }

  @UseGuards(AuthGuard)
  @Post("salida")
  async salida(@User() user: UserRecord, @Body() body: SalidaRequestDto) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    await this.parFichajeService.salida(usuarioCompleto, body.idPar);

    return true;
  }

  @UseGuards(AuthGuard)
  @Get("ultimoPar")
  async getUltimoPar(@User() user: UserRecord) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    return await this.parFichajeService.getUltimoPar(usuarioCompleto);
  }
}
