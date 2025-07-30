import { Injectable } from "@nestjs/common";
import {
  IUpdateTrabajadorOrganizacionUseCase,
  IUpdateTrabajadorOrganizacionDto,
} from "./interfaces/IUpdateTrabajadorOrganizacion.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UpdateTrabajadorOrganizacionUseCase implements IUpdateTrabajadorOrganizacionUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(trabajadorOrganizacion: IUpdateTrabajadorOrganizacionDto): Promise<Trabajador> {
    console.log("UpdateTrabajadorOrganizacion - Datos recibidos:", trabajadorOrganizacion);
    const { id, arrayRoles, arrayPermisos, ...datosActualizar } = trabajadorOrganizacion;
    console.log("UpdateTrabajadorOrganizacion - Datos para actualizar:", datosActualizar);

    // Preparar las conexiones de roles y permisos
    let rolesConnect: { id: string }[] | undefined;
    let permisosConnect: { id: string }[] | undefined;

    if (arrayRoles !== undefined) {
      rolesConnect = arrayRoles.map((roleId) => ({ id: roleId }));
    }

    if (arrayPermisos !== undefined) {
      permisosConnect = arrayPermisos.map((permisoId) => ({ id: permisoId }));
    }

    // Construir el objeto de actualización
    const updateData: any = {
      ...datosActualizar,
    };

    // Agregar conexiones de roles si se proporcionan
    if (rolesConnect !== undefined) {
      updateData.roles = {
        set: rolesConnect,
      };
    }

    // Agregar conexiones de permisos si se proporcionan
    if (permisosConnect !== undefined) {
      updateData.permisos = {
        set: permisosConnect,
      };
    }

    // Actualizar el trabajador con sus relaciones
    console.log("UpdateTrabajadorOrganizacion - updateData final:", updateData);
    const trabajadorActualizado = await this.prisma.trabajador.update({
      where: { id },
      data: updateData,
      include: {
        roles: true,
        permisos: true,
        tienda: true,
        empresa: true,
        responsable: true,
      },
    });
    console.log("UpdateTrabajadorOrganizacion - Trabajador actualizado:", trabajadorActualizado);

    return trabajadorActualizado;
  }
}