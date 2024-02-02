import { Body, Controller, Post, UseGuards, Get, Query } from "@nestjs/common";
import { ArchivoDigital } from "./archivo-digital.class";
import { ArchivoDigitalInterface } from "./archivo-digital.interface";
import { AuthGuard } from "../guards/auth.guard";

@Controller("archivo-digital")
export class ArchivoDigitalController {
  constructor(private readonly archivoDigitalInstance: ArchivoDigital) {}

  @UseGuards(AuthGuard)
  @Post("nuevoArchivo")
  async nuevoArchivo(@Body() archivo: ArchivoDigitalInterface) {
    try {
      return {
        ok: true,
        data: await this.archivoDigitalInstance.nuevoArchivo(archivo),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getArchivos")
  async getArchivos() {
    try {
      const respArchivos = await this.archivoDigitalInstance.getarchivos();
      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo ");
    } catch (error) {
      console.log(error);
    }
  }

  //Eliminar

  @UseGuards(AuthGuard)
  @Post("deleteArchivo")
  async deleteArchivo(@Body() { _id }) {
    try {
      const respArchivos = await this.archivoDigitalInstance.deleteArchivo(_id);
      if (respArchivos)
        return {
          ok: true,
          data: respArchivos,
        };

      throw Error("No se ha podido borrar el archivo");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Filtros
  @UseGuards(AuthGuard)
  @Get("getArchivosByPropietario")
  async getArchivosByPropietario(
    @Query() { propietario }: { propietario: number },
  ) {
    try {
      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByPropietario(
          Number(propietario),
        );

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getArchivosByTipo")
  async getArchivosByTipo(@Query() { tipo }: { tipo: string }) {
    try {
      const respArchivos = await this.archivoDigitalInstance.getArchivosByTipo(
        tipo,
      );

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getArchivosByCreacion")
  async getArchivosByCreacion(@Query() { creacion }: { creacion: Date }) {
    try {
      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByCreación(creacion);

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getArchivosByPropietarioAndTipo")
  async getArchivosByPropietarioAndTipo(
    @Query() { propietario, tipo }: { propietario: number; tipo: string },
  ) {
    try {
      const respArchivos =
        await this.archivoDigitalInstance.getArchivosByPropietarioAndTipo(
          Number(propietario),
          tipo,
        );

      if (respArchivos) return { ok: true, data: respArchivos };
      else throw Error("No se ha encontrado ningun archivo por propietario");
    } catch (error) {
      console.log(error);
    }
  }
}
