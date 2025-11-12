import { Injectable } from "@nestjs/common";
import {
  IUpdateTrabajadorOrganizacionUseCase,
  IUpdateTrabajadorOrganizacionDto,
} from "./interfaces/IUpdateTrabajadorOrganizacion.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TrabajadorService } from "../trabajadores.class";
import { SolicitudesVacacionesService } from "../../solicitud-vacaciones/solicitud-vacaciones.class";
import { DiaPersonalClass } from "../../dia-personal/dia-personal.class";

@Injectable()
export class UpdateTrabajadorOrganizacionUseCase
  implements IUpdateTrabajadorOrganizacionUseCase
{
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly prisma: PrismaService,
    private readonly trabajadorService: TrabajadorService, // 👈 lo inyectas
    private readonly solicitudesVacaciones: SolicitudesVacacionesService, // 👈 lo inyectas
    private readonly solicitudesDiaPersonal: DiaPersonalClass, // 👈 lo inyectas
  ) {}

  async execute(
    trabajadorOrganizacion: IUpdateTrabajadorOrganizacionDto,
  ): Promise<Trabajador> {
    console.log(
      "UpdateTrabajadorOrganizacion - Datos recibidos:",
      trabajadorOrganizacion,
    );
    const {
      id,
      arrayRoles,
      arrayPermisos,
      coordinatorId,
      supervisorId,
      idTienda,
      coordinacionesExtra,
      ...datosActualizar
    } = trabajadorOrganizacion;

    // 👉 Obtenemos snapshot del trabajador original ANTES de actualizar
    const original = await this.prisma.trabajador.findUnique({
      where: { id },
    });
    console.log(
      "UpdateTrabajadorOrganizacion - Datos para actualizar:",
      datosActualizar,
    );

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
      console.log(
        "UpdateTrabajadorOrganizacion - Gestionando coordinatorId:",
        coordinatorId,
      );

      // Primero, quitar al trabajador como coordinador de cualquier tienda que pudiera tener
      const tiendaActualmenteCoordinada = await this.prisma.tienda.findFirst({
        where: { coordinatorId: id },
      });

      if (tiendaActualmenteCoordinada) {
        await this.prisma.tienda.update({
          where: { id: tiendaActualmenteCoordinada.id },
          data: { coordinatorId: null },
        });
        console.log(
          `UpdateTrabajadorOrganizacion - Trabajador ${id} removido como coordinador de tienda ${tiendaActualmenteCoordinada.id}`,
        );
      }

      // Si se está asignando como coordinador de una nueva tienda
      if (coordinatorId !== null) {
        // Quitar el coordinador actual de la tienda de destino (si lo tiene)
        const tiendaDestino = await this.prisma.tienda.findUnique({
          where: { id: coordinatorId },
        });

        if (tiendaDestino && tiendaDestino.coordinatorId) {
          console.log(
            `UpdateTrabajadorOrganizacion - Removiendo coordinador anterior ${tiendaDestino.coordinatorId} de tienda ${coordinatorId}`,
          );
        }

        // Asignar este trabajador como coordinador de la tienda
        await this.prisma.tienda.update({
          where: { id: coordinatorId },
          data: { coordinatorId: id },
        });
        console.log(
          `UpdateTrabajadorOrganizacion - Trabajador ${id} asignado como coordinador de tienda ${coordinatorId}`,
        );
      }
    }

    if (supervisorId !== undefined) {
      console.log(
        "UpdateTrabajadorOrganizacion - Gestionando supervisorId (tiendas supervisadas):",
        supervisorId,
      );

      // El frontend envía supervisorId como array de IDs de tiendas
      if (Array.isArray(supervisorId)) {
        // 1️⃣ Eliminar al trabajador como supervisor de tiendas que ya no están en el array
        await this.prisma.tienda.updateMany({
          where: {
            supervisorId: id,
            id: { notIn: supervisorId },
          },
          data: { supervisorId: null },
        });

        // 2️⃣ Asignar el trabajador como supervisor en las nuevas tiendas seleccionadas
        for (const idTienda of supervisorId) {
          await this.prisma.tienda.update({
            where: { id: idTienda },
            data: { supervisorId: id },
          });
          console.log(
            `UpdateTrabajadorOrganizacion - Trabajador ${id} asignado como supervisor de tienda ${idTienda}`,
          );
        }

        // 3️⃣ También actualizar el campo relacional supervisa[] en el trabajador
        updateData.supervisa = {
          set: supervisorId.map((idTienda) => ({ id: idTienda })),
        };
      } else if (supervisorId === null) {
        // Si se pasa null, eliminar cualquier supervisión existente
        await this.prisma.tienda.updateMany({
          where: { supervisorId: id },
          data: { supervisorId: null },
        });

        updateData.supervisa = { set: [] };
        console.log(
          `UpdateTrabajadorOrganizacion - Trabajador ${id} removido como supervisor de todas las tiendas`,
        );
    // **Lógica para la Coordinadora B**
    if (coordinacionesExtra && coordinacionesExtra.length > 0) {
      for (const tiendaId of coordinacionesExtra) {
        // Validar existencia de tienda
        const tiendaExtra = await this.prisma.tienda.findUnique({
          where: { id: tiendaId },
        });
        if (!tiendaExtra) {
          console.log(`Tienda adicional con id ${tiendaId} no encontrada`);
          continue; // Si no existe la tienda, la omitimos y seguimos con la siguiente
        }

        // Crear la relación TiendaCoordinadora para Coordinadora B
        try {
          await this.prisma.tiendaCoordinadora.create({
            data: {
              tiendaId,
              trabajadorId: id,
            },
          });
          console.log(
            `Relación TiendaCoordinadora B creada para trabajador ${id} y tienda ${tiendaId}`,
          );
        } catch (err) {
          console.error("Error al crear relación TiendaCoordinadora B:", err);
        }
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
        supervisa: true,
        coordinacionesExtra: true,
      },
    });
    // LÓGICA anterior en guardarCambiosForms lo necesita recursos humanos---
    // Asignar automáticamente responsable si cambia la tienda
    await this.trabajadorService.asignarResponsablePorTiendaSiCorresponde(
      original as any,
      trabajadorOrganizacion as any,
    );

    // Si cambió el responsable, actualizar solicitudes
    if (
      trabajadorOrganizacion.idResponsable &&
      original?.idResponsable !== trabajadorOrganizacion.idResponsable
    ) {
      await this.prisma.trabajador.update({
        where: { id },
        data: { idResponsable: trabajadorOrganizacion.idResponsable },
      });

      // Recargamos trabajadorActualizado desde BD
      const refreshed = await this.prisma.trabajador.findUnique({
        where: { id },
        include: {
          roles: true,
          permisos: true,
          tienda: true,
          empresa: true,
          responsable: true,
          coordinadoraDeLaTienda: true,
          supervisa: true,
          coordinacionesExtra: true,
        },
      });

      trabajadorActualizado.idResponsable = refreshed.idResponsable;
      trabajadorActualizado.responsable = refreshed.responsable;

      const nuevoResponsable =
        await this.trabajadorService.getTrabajadorBySqlId(
          trabajadorOrganizacion.idResponsable,
        );

      const nuevoIdAppResponsable = nuevoResponsable.idApp;

      const solicitudesExisten =
        await this.solicitudesVacaciones.haySolicitudesParaBeneficiario(
          original.id,
        );

      const solicitudesExistenDiaPersonal =
        await this.solicitudesDiaPersonal.haySolicitudesParaBeneficiarioDiaPersonal(
          original.id,
        );

      if (solicitudesExisten) {
        await this.solicitudesVacaciones.actualizarIdAppResponsable(
          original.id,
          nuevoIdAppResponsable,
        );
      }
      if (solicitudesExistenDiaPersonal) {
        await this.solicitudesDiaPersonal.actualizarIdAppResponsableDiaPersonal(
          original.id,
          nuevoIdAppResponsable,
        );
      }
    }

    console.log(
      "UpdateTrabajadorOrganizacion - Trabajador actualizado:",
      trabajadorActualizado,
    );

    return trabajadorActualizado;
  }
}
