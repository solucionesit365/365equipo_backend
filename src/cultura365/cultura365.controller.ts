import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { cultura365Class } from "./cultura365.class";
import { cultura365Interface } from "./cultura365.interface";

@Controller("cultura365")
export class Cultura365Controller {
  constructor(private readonly culturaInstance: cultura365Class) {}

  @UseGuards(AuthGuard)
  @Post("nuevoVideo")
  async nuevoVideo(@Body() video: cultura365Interface) {
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

  @UseGuards(AuthGuard)
  @Get("getVideos")
  async getVideos() {
    try {
      const respvideo = await this.culturaInstance.getVideos();

      if (respvideo) return { ok: true, data: respvideo };
      else throw Error("No se ha encontrado ningun video");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateVideo")
  async updateVideo(@Body() videoModificado: cultura365Interface) {
    try {
      if (await this.culturaInstance.updateVideo(videoModificado))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el video");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteVideo")
  async deleteVideo(@Body() { _id }: { _id: string }) {
    try {
      if (await this.culturaInstance.deleteVideo(_id))
        return {
          ok: true,
        };
      throw Error("No se ha podido borrar el video");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("contadorViews")
  async incrementarContadorViews(@Query("videoId") videoId: string) {
    try {
      const respvideo = await this.culturaInstance.incrementarContadorViews(
        videoId,
      );

      return { mensaje: "Contador incrementado con éxito", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { mensaje: "Error al incrementar el contador de vistas", error };
    }
  }

  @UseGuards(AuthGuard)
  @Get("views")
  async views() {
    try {
      const respvideo = await this.culturaInstance.views();

      return { mensaje: "se muestran los views", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { mensaje: "Error al mostrar los views", error };
    }
  }
}
