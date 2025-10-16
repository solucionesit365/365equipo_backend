import { Controller, Get, UseGuards } from "@nestjs/common";
import { IGetDevicesUseCase } from "./IGetDevices.use-case";
import { AuthGuard } from "src/guards/auth.guard";
import { disconnectedDevicesStore } from "../disconnected-devices.store";
import { computeEffectiveStatus } from "../device-status.utils";
import { CompleteUser } from "src/decorators/getCompleteUser.decorator";
import { SchedulerGuard } from "src/guards/scheduler.guard";
import { Trabajador } from "@prisma/client";
import { IPushNotificationToUserUseCase } from "src/push-notification/PushNotificationToUser/IPushNotificationToUser.use-case";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";

@Controller("get-all-devices")
export class GetDevicesController {
  constructor(
    private readonly getDevicesUseCase: IGetDevicesUseCase,
    private readonly notificaciones: IPushNotificationToUserUseCase,
    private readonly trabajadores: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  getAllDevices() {
    return this.getDevicesUseCase.execute();
  }

  @UseGuards(AuthGuard)
  @Get("getStatus")
  async getStatus(@CompleteUser() user: any) {
    const res = await this.getDevicesUseCase.execute();

    // Validamos permisos del usuario
    const hasPermiso =
      user?.permisos?.some((p: any) => p.name === "notificacionMonitoreo") &&
      user?.roles?.some((r: any) => r.name === "Super_Admin");

    if (hasPermiso) {
      await this.processNotificationsForUser(user);
    }

    return res.branches;
  }
  @UseGuards(SchedulerGuard)
  @Get("checkAndNotify")
  async checkAndNotify() {
    const arrayTrabajador = await this.trabajadores.getTrabajadores();

    // Filtramos solo los trabajadores con idApp
    const trabajadoresConIdApp = arrayTrabajador.filter(
      (trabajador) => trabajador.idApp != null,
    );

    for (const user of trabajadoresConIdApp) {
      const hasPermiso =
        user?.permisos?.some(
          (permiso: { name: string }) =>
            permiso.name === "notificacionMonitoreo",
        ) &&
        user?.roles?.some(
          (rol: { name: string }) => rol.name === "Super_Admin",
        );

      if (!hasPermiso) continue;

      await this.processNotificationsForUser(user);
    }

    return { ok: true };
  }

  //  lógica de notificación de datafonos
  private async processNotificationsForUser(user: Trabajador) {
    const res = await this.getDevicesUseCase.execute();
    const MONITOR_LINK = "https://monitorizar.365equipo.com/monitorizacion";

    for (const branch of res.branches) {
      for (const device of branch.devices) {
        const { effectiveStatus, isPrimary } = computeEffectiveStatus(
          device,
          branch.terminals,
        );

        if (!isPrimary) continue;

        const deviceId = String(
          device.serialNumber || `${branch.name}-${device.softwareVersion}`,
        );
        const prev = disconnectedDevicesStore.get(deviceId);
        const now = new Date();

        //Detectar Desconexión
        if (effectiveStatus === "Desconectado") {
          if (!prev || prev.status !== "Desconectado") {
            await this.notificaciones.execute(user.idApp, {
              body: `${branch.name} - ${device.serialNumber} está desconectado`,
              title: "Datafono desconectado",
              link: MONITOR_LINK,
            });
            disconnectedDevicesStore.set(deviceId, {
              status: "Desconectado",
              lastNotified: now,
            });
          } else if (
            prev.lastNotified &&
            (now.getTime() - prev.lastNotified.getTime()) / 3600000 >= 1
          ) {
            await this.notificaciones.execute(user.idApp, {
              body: `${branch.name} - ${device.serialNumber} sigue desconectado`,
              title: "El Datafono sigue desconectado",
              link: MONITOR_LINK,
            });
            disconnectedDevicesStore.set(deviceId, {
              status: "Desconectado",
              lastNotified: now,
            });
          }
        }

        //Detectar Reconexión
        if (
          effectiveStatus === "Conectado" &&
          prev?.status === "Desconectado"
        ) {
          await this.notificaciones.execute(user.idApp, {
            body: `${branch.name} - ${device.serialNumber} se ha reconectado`,
            title: "Datafono reconectado",
            link: MONITOR_LINK,
          });
          disconnectedDevicesStore.set(deviceId, { status: "Conectado" });
        }

        // Actualiza cualquier otro estado
        if (
          effectiveStatus !== "Desconectado" &&
          effectiveStatus !== "Conectado"
        ) {
          disconnectedDevicesStore.set(deviceId, { status: effectiveStatus });
        }
      }
    }
  }
}
