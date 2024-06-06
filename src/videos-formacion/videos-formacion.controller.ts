import {
  Controller,
  Post,
  UseGuards,
  Headers,
  Body,
  Get,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { videosFormacion365Class } from "./videos-formacion.class";
import {
  videosFormacion365Interface,
  videosVistosFormacion365Interface,
} from "./videos-formacion.interface";

@Controller("videos-formacion")
export class VideosFormacionController {
  constructor(private readonly formacionInstance: videosFormacion365Class) {}

  @UseGuards(AuthGuard)
  @Post("nuevoVideoFormacion")
  async nuevoVideoFormacion(@Body() video: videosFormacion365Interface) {
    try {
      video.creacion = new Date();
      return {
        ok: true,
        data: await this.formacionInstance.nuevoVideo(video),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, messag: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("nuevoVistoVideoFormacion")
  async nuevoVistoVideoFormacion(
    @Body() video: videosVistosFormacion365Interface,
  ) {
    try {
      // Verificar si el video ya ha sido registrado
      const videoExistente = await this.formacionInstance.findVideoByIdVideo(
        video.nombre,
        video.idVideo,
      );
      if (videoExistente) {
        return {
          ok: false,
        };
      }
      video.visto = new Date();
      return {
        ok: true,
        data: await this.formacionInstance.nuevoVistoVideo(video),
      };
    } catch (error) {
      return { ok: false, messag: error.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getVideosFormacion")
  async getVideosFormacion() {
    try {
      const response = await this.formacionInstance.getVideos();

      if (response) {
        return {
          ok: true,
          data: response,
        };
      } else throw Error("No se ha encontrado ningun video de formacion");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getVideosFormacionVistos")
  async getVideosFormacionVistos() {
    try {
      const response = await this.formacionInstance.getVideosVistos();

      if (response) {
        return {
          ok: true,
          data: response,
        };
      } else
        throw Error("No se ha encontrado ningun video de formacion ja visto");
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post("updateVideoFormacion")
  async updateVideoFormacion(
    @Body() videoModificado: videosFormacion365Interface,
  ) {
    try {
      if (await this.formacionInstance.updateVideo(videoModificado))
        return {
          ok: true,
        };
      throw Error("No se ha podido modificar el video de formacion");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("deleteVideoFormacion")
  async deleteVideoFormacion(@Body() { _id }: { _id: string }) {
    try {
      if (await this.formacionInstance.deleteVideo(_id))
        return {
          ok: true,
        };
      throw Error("No se ha podido borrar el video de formacion");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("contadorViews")
  async incrementarContadorViews(@Query("videoId") videoId: string) {
    try {
      const respvideo = await this.formacionInstance.incrementarContadorViews(
        videoId,
      );

      return { mensaje: "Contador incrementado con éxito", respvideo };
    } catch (error) {
      return { mensaje: "Error al incrementar el contador de vistas", error };
    }
  }

  @UseGuards(AuthGuard)
  @Get("views")
  async views() {
    try {
      const respvideo = await this.formacionInstance.views();

      return { mensaje: "se muestran los views", respvideo };
    } catch (error) {
      return { mensaje: "Error al mostrar los views", error };
    }
  }

  @UseGuards(AuthGuard)
  @Get("verificarVideoVisto")
  async verificarVideoVisto(
    @Query("nombre") nombre: string,
    @Query("idVideo") idVideo: string,
  ) {
    try {
      const videoExistente = await this.formacionInstance.findVideoByIdVideo(
        nombre,
        idVideo,
      );
      return { existe: !!videoExistente };
    } catch (error) {
      console.log(error);
      return { existe: false, message: error.message };
    }
  }
}
