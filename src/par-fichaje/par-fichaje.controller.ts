import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { ParFichajeService } from "./par-fichaje.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import {
  FinalDescansoRequestDto,
  GetResumenDto,
  InicioDescansoRequestDto,
  SalidaRequestDto,
} from "./par-fichaje.dto";
import { DateTime } from "luxon";

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

    const ultimoParFichaje = await this.parFichajeService.getUltimoPar(
      usuarioCompleto,
    );

    if (ultimoParFichaje?.id && ultimoParFichaje.estado !== "LIBRE")
      throw new ForbiddenException("Antes de fichar entrada, ficha salida");

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
  @Post("inicioDescanso")
  async inicioDescanso(
    @User() user: UserRecord,
    @Body() body: InicioDescansoRequestDto,
  ) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    await this.parFichajeService.inicioDescanso(usuarioCompleto, body.idPar);

    return true;
  }

  @UseGuards(AuthGuard)
  @Post("finalDescanso")
  async finalDescanso(
    @User() user: UserRecord,
    @Body() body: FinalDescansoRequestDto,
  ) {
    const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
      user.uid,
    );

    await this.parFichajeService.finalDescanso(
      usuarioCompleto,
      body.idDescanso,
    );

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

  @UseGuards(AuthGuard)
  @Get("getSinValidarTienda")
  async getSinValidarTienda(@Query() params: GetResumenDto) {
    // const usuarioCompleto = await this.trabajadorService.getTrabajadorByAppId(
    //   user.uid,
    // );

    // Se usa fecha de ayer porque son mínimo del día anterior los "sinValidar"
    const yesterday = DateTime.now().minus({ days: 1 });
    const threeWeeksAgo = yesterday.minus({ weeks: 3 });

    return await this.parFichajeService.getSinValidarTienda(
      params.idTienda,
      threeWeeksAgo,
      yesterday,
    );
  }
}
