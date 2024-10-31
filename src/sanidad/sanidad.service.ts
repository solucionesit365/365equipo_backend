import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GetFormacionesTrabajadorDto, NuevaFormacionDto } from "./sanidad.dto";

@Injectable()
export class SanidadService {
  constructor(private readonly prisma: PrismaService) {}

  async nuevaFormacion(data: NuevaFormacionDto) {
    try {
      const resFormacion = await this.prisma.formacionSanidad.create({
        data: {
          nombre: data.nombre,
          fecha: data.fecha,
          duracion: data.duracion,
          lugar: data.lugar,
          trabajador: {
            connect: {
              id: data.idTrabajador,
            },
          },
        },
      });

      return resFormacion;
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getFormacionesTrabajador(data: GetFormacionesTrabajadorDto) {
    try {
      return await this.prisma.formacionSanidad.findMany({
        where: {
          idTrabajador: data.idTrabajador,
        },
      });
    } catch (err: any) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
