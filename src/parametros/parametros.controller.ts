/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from "@nestjs/common";
import { ParametrosService } from "./parametros.service";

@Controller("parametros")
export class ParametrosController {
  constructor(public readonly parametrosService: ParametrosService) {}

  @Get("getParametros")
  async getParametros(name: string): Promise<any> {
    return this.parametrosService.getParametros(name);
  }

  @Get("campaniaMedica")
  async getCampaniaMedica() {
    const [campania] = await this.parametrosService.getParametros(
      "configurar_campaña_medica",
    );
    return campania || {};
  }

  @Get("correosFurgos")
  async getCorreosFurgos() {
    return await this.parametrosService.getParametrosCorreosFurgos();
  }

  @Post("campaniaMedica")
  async updateCampaniaMedica(
    @Body()
    data: {
      fechaFinalRevision: string | null;
      correoCentroMedico: string | null;
      OtroCorreo: string | null;
    },
  ) {
    return this.parametrosService.updateParametros2(
      "configurar_campaña_medica",
      {
        campañaMedica: {
          fechaFinalRevision: data.fechaFinalRevision
            ? new Date(data.fechaFinalRevision)
            : null,
          correoCentroMedico: data.correoCentroMedico,
          OtroCorreo: data.OtroCorreo,
        },
      },
    );
  }

  @Post("correosFurgos")
  async updateCorreosFurgos(
    @Body()
    data: {
      mails: string[];
    },
  ) {
    return this.parametrosService.updateCorreosFurgos("correos_furgos", {
      mails: data.mails,
    });
  }
}
