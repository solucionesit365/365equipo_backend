import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { cultura365Class } from "./cultura365.class";
import { cultura365Interface } from "./cultura365.interface";

@Controller("cultura365")
export class Cultura365Controller {
  constructor(private readonly culturaInstance: cultura365Class) {}

  @Post("nuevoVideo")
  @UseGuards(AuthGuard)
  async nuevoVideo(
    @Headers("authorization") authHeader: string,
    @Body() video: cultura365Interface,
  ) {
    try {
      video.creacion = new Date();
      return {
        ok: true,
        data: await this.culturaInstance.nuevoVideo(video),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getVideos")
  @UseGuards(AuthGuard)
  async getVideos(@Headers("authorization") authHeader: string) {
    try {
      const respvideo = await this.culturaInstance.getVideos();
      // // Verifica si las notificaciones ya se enviaron
      // if (!this.notificacionesEnviadas) {
      //   const arrayTrabajador = await this.trabajadores.getTrabajadores();
      //   arrayTrabajador.forEach((trabajador) => {
      //     if (trabajador.idApp != null) {
      //       this.notificaciones.newInAppNotification({
      //         uid: trabajador.idApp,
      //         titulo: "Nuevo Apartado",
      //         mensaje: "¡Estrenamos nuevo apartado de Cultura en la APP!",
      //         leido: false,
      //         creador: "SISTEMA",
      //         url: "/videoCultura",
      //       });
      //     }
      //   });
      //   // Marca las notificaciones como enviadas
      //   this.notificacionesEnviadas = true;
      // }

      if (respvideo) return { ok: true, data: respvideo };
      else throw Error("No se ha encontrado ningun video");
    } catch (error) {
      console.log(error);
    }
  }

  @Post("contadorViews")
  @UseGuards(AuthGuard)
  async incrementarContadorViews(
    @Query("videoId") videoId: string,
    @Headers("authorization") authHeader: string,
  ) {
    try {
      console.log(videoId);

      const respvideo = await this.culturaInstance.incrementarContadorViews(
        videoId,
      );

      console.log(respvideo);

      return { mensaje: "Contador incrementado con éxito", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { mensaje: "Error al incrementar el contador de vistas", error };
    }
  }

  @Get("views")
  @UseGuards(AuthGuard)
  async views(@Headers("authorization") authHeader: string) {
    try {
      const respvideo = await this.culturaInstance.views();

      console.log(respvideo);

      return { mensaje: "se muestran los views", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { mensaje: "Error al mostrar los views", error };
    }
  }
}
