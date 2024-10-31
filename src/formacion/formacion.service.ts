import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateFormacionDto,
  GetFormacionesDto,
  UpdateFormacionDto,
} from "./formacion.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FormacionService {
  constructor(private readonly prisma: PrismaService) {}

  async getFormaciones(req: GetFormacionesDto) {
    try {
      return await this.prisma.formacion.findMany({
        where: {
          department: req.status,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Error al obtener las formaciones",
      );
    }
  }

  async getFormacionById(req: { id: string }) {
    try {
      return await this.prisma.formacion.findUnique({
        where: {
          id: req.id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException("Error al obtener la formación");
    }
  }

  async createFormacion(req: CreateFormacionDto) {
    try {
      const { name, department, description, pasos, nPasos } = req;

      return await this.prisma.formacion.create({
        data: {
          name,
          department,
          description,
          nPasos,
          pasos: {
            create: pasos.map((paso) => ({
              resourceId: paso.resourceId,
              name: paso.name,
              description: paso.description,
              type: paso.type,
            })),
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException("Error al crear la formación");
    }
  }

  async deleteFormacion(id: string) {
    try {
      const formacion = await this.prisma.formacion.findUnique({
        where: { id },
      });

      if (!formacion) {
        throw new NotFoundException(`Formación con id ${id} no encontrada`);
      }

      await this.prisma.formacion.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException("Error al eliminar la formación");
    }
  }

  async updateFormacion(updateDto: UpdateFormacionDto) {
    try {
      const existingFormacion = await this.prisma.formacion.findUnique({
        where: { id: updateDto.id },
      });

      if (!existingFormacion) {
        throw new NotFoundException(
          `Formación con id ${updateDto.id} no encontrada`,
        );
      }

      const { pasos, ...formacionData } = updateDto;

      return await this.prisma.formacion.update({
        where: { id: updateDto.id },
        data: {
          department: formacionData.department,
          description: formacionData.description,
          name: formacionData.name,
          nPasos: formacionData.nPasos,
          pasos: pasos
            ? {
                create: pasos.map((paso) => ({
                  resourceId: paso.resourceId,
                  name: paso.name,
                  description: paso.description,
                  type: paso.type,
                })),
              }
            : undefined,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Error al actualizar la formación",
      );
    }
  }
}
