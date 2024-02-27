import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { EvaluacionesService } from "./evaluaciones.class";
import {
  CreateEvaluacionesInterfaceDto,
  CrearIluoInterfaceDto,
  MostrarEvaluacionDto,
} from "./evaluaciones.dto";

@Controller("evaluaciones")
export class EvaluacionesController {
  constructor(private readonly evaluacionesclass: EvaluacionesService) {}

  @UseGuards(AuthGuard)
  @Post("addPlantilla")
  async addPlantilla(@Body() evaluacion: CreateEvaluacionesInterfaceDto) {
    try {
      const response = await this.evaluacionesclass.addPlantilla(evaluacion);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      } else return { ok: false };
    } catch (error) {
      console.log(error);
    }
  }

  //Todas las plantillas segun el tipo
  @UseGuards(AuthGuard)
  @Get("getPlantillas")
  async getPlantillas(@Query("tipo") tipo: string) {
    try {
      const response = await this.evaluacionesclass.getPlantillas(tipo);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  //Todas las Plantillas admin
  @UseGuards(AuthGuard)
  @Get("getPlantillasAdmin")
  async getPlantillasAdmin() {
    try {
      const response = await this.evaluacionesclass.getPlantillasAdmin();
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  @UseGuards(AuthGuard)
  @Get("getEvaluacionAdminRespondidas")
  async getEvaluacionAdminRespondidas(@Query() request) {
    try {
      const response =
        await this.evaluacionesclass.getEvaluacionAdminRespondidas(
          Number(request.idSql),
          Number(request.año),
        );
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  @UseGuards(AuthGuard)
  @Get("getEvaluaciones")
  async getEvaluaciones() {
    try {
      const response = await this.evaluacionesclass.getEvaluaciones();

      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  //Eliminar plantillas
  @UseGuards(AuthGuard)
  @Post("deletePlantillaAdmin")
  async deletePlantillaAdmin(@Body() { _id }: { _id: string }) {
    try {
      const response = await this.evaluacionesclass.deletePlantillaAdmin(_id);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
      throw Error("No se ha podido borrar la evaluacion");
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("addEvaluacion")
  async addEvaluacion(@Body() evaluacion: CreateEvaluacionesInterfaceDto) {
    const response = await this.evaluacionesclass.addEvaluacion(evaluacion);
    if (response) {
      return {
        ok: true,
        data: response,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getEvaluados")
  async getEvaluados(@Query() request) {
    try {
      const response = await this.evaluacionesclass.getEvaluados(
        Number(request.idSql),
        Number(request.año),
      );
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  // @UseGuards(AuthGuard)
  @Post("addILUO")
  async addILUO(@Body() evaluacion: CrearIluoInterfaceDto) {
    try {
      const response = await this.evaluacionesclass.addILUO(evaluacion);
      if (response) {
        return {
          ok: true,
          data: response,
        };
      } else return { ok: false };
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getPlantillasILUO")
  async getPlantillasILUO(
    @Query("plantillaAsociada") plantillaAsociada: string,
  ) {
    try {
      const response = await this.evaluacionesclass.getPlantillasILUO(
        plantillaAsociada,
      );
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }

  @UseGuards(AuthGuard)
  @Post("addILUORespuestas")
  async addILUORespuestas(@Body() iluo: CrearIluoInterfaceDto) {
    const response = await this.evaluacionesclass.addILUORespuestas(iluo);

    if (response) {
      return {
        ok: true,
        data: response,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getILUORespuestas")
  async getILUORespuestas(@Query() request) {
    try {
      const response = await this.evaluacionesclass.getILUORespuestas(
        Number(request.idSql),
        Number(request.año),
      );
      if (response) {
        return {
          ok: true,
          data: response,
        };
      }
    } catch (error) {}
  }
}
