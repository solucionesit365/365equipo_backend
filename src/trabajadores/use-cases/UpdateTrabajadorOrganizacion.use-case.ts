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
    const { id, arrayRoles, arrayPermisos, coordinatorId, ...datosActualizar } = trabajadorOrganizacion;
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

    // Manejar la relación de coordinadora de tienda
    if (coordinatorId !== undefined) {
      console.log("UpdateTrabajadorOrganizacion - Gestionando coordinatorId:", coordinatorId);
      
      // Primero, quitar al trabajador como coordinador de cualquier tienda que pudiera tener
      const tiendaActualmenteCoordinada = await this.prisma.tienda.findFirst({
        where: { coordinatorId: id },
      });
      
      if (tiendaActualmenteCoordinada) {
        await this.prisma.tienda.update({
          where: { id: tiendaActualmenteCoordinada.id },
          data: { coordinatorId: null },
        });
        console.log(`UpdateTrabajadorOrganizacion - Trabajador ${id} removido como coordinador de tienda ${tiendaActualmenteCoordinada.id}`);
      }
      
      // Si se está asignando como coordinador de una nueva tienda
      if (coordinatorId !== null) {
        // Quitar el coordinador actual de la tienda de destino (si lo tiene)
        const tiendaDestino = await this.prisma.tienda.findUnique({
          where: { id: coordinatorId },
        });
        
        if (tiendaDestino && tiendaDestino.coordinatorId) {
          console.log(`UpdateTrabajadorOrganizacion - Removiendo coordinador anterior ${tiendaDestino.coordinatorId} de tienda ${coordinatorId}`);
        }
        
        // Asignar este trabajador como coordinador de la tienda
        await this.prisma.tienda.update({
          where: { id: coordinatorId },
          data: { coordinatorId: id },
        });
        console.log(`UpdateTrabajadorOrganizacion - Trabajador ${id} asignado como coordinador de tienda ${coordinatorId}`);
      }
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
        coordinadoraDeLaTienda: true,
      },
    });
    console.log("UpdateTrabajadorOrganizacion - Trabajador actualizado:", trabajadorActualizado);

    return trabajadorActualizado;
  }
}