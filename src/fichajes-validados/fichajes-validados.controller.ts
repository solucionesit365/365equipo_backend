import { Controller, Post, Get, Body, Headers, Query } from "@nestjs/common";
import { TokenService } from "../get-token/get-token.service";
import { FichajesValidados } from "./fichajes-validados.class";
import { FichajeValidadoDto } from "./fichajes-validados.interface";
import { AuthService } from "../firebase/auth";

@Controller("fichajes-validados")
export class FichajesValidadosController {
  constructor(
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
    private readonly fichajesValidadosInstance: FichajesValidados,
  ) { }

  @Post("addFichajeValidado")
  async addFichajeValidado(
    @Body() fichajeValidado: FichajeValidadoDto,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      if (!fichajeValidado.idTrabajador) throw Error("Faltan parametros");
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      if (
        await this.fichajesValidadosInstance.addFichajesValidados(
          fichajeValidado,
        )
      )
        return {
          ok: true,
        };
      throw Error("No se ha podido insertar el anuncio");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getFichajesValidados")
  async getFichajesValidados(
    @Headers("authorization") authHeader: string,
    @Query() { idTrabajador }: { idTrabajador: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const respValidados = await this.fichajesValidadosInstance.getFichajesValidados(Number(idTrabajador));
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados
        }
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("actualizarValidados")
  async updateFichajesValidados(
    @Headers("authorization") authHeader: string,
    @Body() FichajesValidados: FichajeValidadoDto,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      if (await this.fichajesValidadosInstance.updateFichajesValidados(FichajesValidados))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar fichaje validado");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getFichajesPagar")
  async getFichajesPagar(
    @Headers("authorization") authHeader: string,
    @Query() { idResponsable, aPagar }: { idResponsable: number, aPagar: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const aPagarBoolean = aPagar == 'true' ? true : false;

      const respValidados = await this.fichajesValidadosInstance.getFichajesPagar(Number(idResponsable), aPagarBoolean);
      if (respValidados.length > 0) {
        return {
          ok: true,
          data: respValidados
        }
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
