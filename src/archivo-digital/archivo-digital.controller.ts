import {
  Body,
  Controller,
  Post,
  UseGuards,
  Headers,
  Get,
  Query,
} from "@nestjs/common";
import { ArchivoDigital } from "./archivo-digital.class";
import { ArchivoDigitalInterface } from "./archivo-digital.interface";
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import moment from "moment";

@Controller("archivo-digital")
export class ArchivoDigitalController {
  constructor(
    private readonly archivoDigitalInstance: ArchivoDigital,
    private readonly authInstance: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post("nuevoArchivo")
  @UseGuards(AuthGuard)
  async nuevoArchivo(
    @Headers("authorization") authHeader: string,
    @Body() archivo: ArchivoDigitalInterface,
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      return {
        ok: true,
        data: await this.archivoDigitalInstance.nuevoArchivo(archivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getArchivos")
  @UseGuards(AuthGuard)
  async getArchivos(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);

      const respArchivos = await this.archivoDigitalInstance.getarchivos();
      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo ");
    } catch (error) {
      console.log(error);
    }
  }

  //filtros
  @Get("getArchivosByPropietario")
  @UseGuards(AuthGuard)
  async getArchivosByPropietario(
    @Headers("authorization") authHeader: string,
    @Query() { propietario }: { propietario: number },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(propietario);

      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByPropietario(
          Number(propietario),
        );
      console.log(respArchivos);

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getArchivosByTipo")
  @UseGuards(AuthGuard)
  async getArchivosByTipo(
    @Headers("authorization") authHeader: string,
    @Query() { tipo }: { tipo: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(tipo);

      const respArchivos = await this.archivoDigitalInstance.getArchivosByTipo(
        tipo,
      );
      console.log(respArchivos);

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getArchivosByCreacion")
  @UseGuards(AuthGuard)
  async getArchivosByCreacion(
    @Headers("authorization") authHeader: string,
    @Query() { creacion }: { creacion: Date },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(creacion);

      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByCreación(creacion);
      console.log(respArchivos);

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @Get("getArchivosByPropietarioAndTipo")
  @UseGuards(AuthGuard)
  async getArchivosByPropietarioAndTipo(
    @Headers("authorization") authHeader: string,
    @Query() { propietario, tipo }: { propietario: number; tipo: string },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await this.authInstance.verifyToken(token);
      console.log(propietario);
      console.log(tipo);

      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByPropietarioAndTipo(
          Number(propietario),
          tipo,
        );
      console.log(respArchivos);

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }
}
