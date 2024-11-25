import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { videosFormacion365Class } from "./videos-formacion.class";
import {
  videosFormacion365Interface,
  videosVistosFormacion365Interface,
} from "./videos-formacion.interface";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";
import { Notificaciones } from "src/notificaciones/notificaciones.class";

@Controller("videos-formacion")
export class VideosFormacionController {
  constructor(
    private readonly formacionInstance: videosFormacion365Class,
    private readonly trabajadores: TrabajadorService,
    private readonly notificaciones: Notificaciones,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevoVideoFormacion")
  async nuevoVideoFormacion(@Body() video: videosFormacion365Interface) {
    try {
      video.creacion = new Date();

      const nuevoVideo = await this.formacionInstance.nuevoVideo(video);

      if (nuevoVideo) {
        // Enviar respuesta inmediatamente al frontend para no bloquear
        const response = { ok: true, data: nuevoVideo };

        setImmediate(async () => {
          try {
            const usuariosCompletos = await this.trabajadores.getTrabajadores();

            // Filtrar solo los trabajadores que tienen los roles adecuados
            const trabajadoresConRolAdecuado = usuariosCompletos.filter(
              (trabajador) =>
                trabajador.roles.some((rol) =>
                  ["Tienda", "Dependienta"].includes(rol.name),
                ),
            );

            // Obtener los tokens FCM para todos los trabajadores con los roles adecuados
            const tokens = await Promise.all(
              trabajadoresConRolAdecuado.map(async (trabajador) => {
                if (trabajador.idApp) {
                  const userToken = await this.notificaciones.getFCMToken(
                    trabajador.idApp,
                  );
                  if (userToken && userToken.token) {
                    return userToken.token;
                  }
                }
                return null;
              }),
            );

            // Filtrar los tokens válidos y enviar notificaciones
            const validTokens = tokens.filter((token) => token !== null);
            if (validTokens.length > 0) {
              await Promise.all(
                validTokens.map((token) =>
                  this.notificaciones.sendNotificationToDevice(
                    token,
                    "Nuevo video De Formación",
                    `${video.titulo}`,
                    "/videoFormacion",
                  ),
                ),
              );
            }
          } catch (error) {
            console.error(
              "Error al enviar notificaciones en segundo plano:",
              error,
            );
          }
        });

        return response;
      } else {
        throw new Error("No se pudo crear el video de formación");
      }
    } catch (error) {
      console.error("Error en nuevoVideoFormacion:", error);
      return { ok: false, message: error.message };
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

  @UseGuards(AuthGuard)
  @Get("videosPorCategoria")
  async videosPorCategoria(@Query("categoria") categoria: string) {
    try {
      const videos = await this.formacionInstance.getVideosByCategoria(
        categoria,
      );
      return {
        ok: true,
        data: videos,
      };
    } catch (error) {
      console.log(error);
      return { message: error.message };
    }
  }
}
