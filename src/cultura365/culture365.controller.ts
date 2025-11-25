import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { culture365Class } from "./culture365.class";
import { culture365Interface } from "./culture365.interface";

@Controller("culture365")
export class culture365Controller {
  constructor(private readonly cultureInstance: culture365Class) {}

  @UseGuards(AuthGuard)
  @Post("newVideo")
  async newVideo(@Body() video: culture365Interface) {
    try {
      video.creation = new Date();
      return {
        ok: true,
        data: await this.cultureInstance.newVideo(video),
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
      const respvideo = await this.cultureInstance.getVideos();

      if (respvideo) return { ok: true, data: respvideo };
      else throw Error("No se ha encontrado ningun video");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateVideo")
  async updateVideo(@Body() videoModificado: culture365Interface) {
    try {
      if (await this.cultureInstance.updateVideo(videoModificado))
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
      if (await this.cultureInstance.deleteVideo(_id))
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
  @Post("countViews")
  async increaseViewCounter(@Query("videoId") videoId: string) {
    try {
      const respvideo = await this.cultureInstance.increaseViewCounter(videoId);

      return { message: "Contador incrementado con éxito", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { message: "Error al incrementar el contador de vistas", error };
    }
  }

  @UseGuards(AuthGuard)
  @Get("views")
  async views() {
    try {
      const respvideo = await this.cultureInstance.views();

      return { message: "se muestran los views", respvideo };
    } catch (error) {
      // Manejar el error adecuadamente, tal vez retornar un código de estado HTTP específico
      return { message: "Error al mostrar los views", error };
    }
  }
}
