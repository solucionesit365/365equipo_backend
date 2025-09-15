import { Controller, Get, UseGuards } from "@nestjs/common";
import { IGetDevicesUseCase } from "./IGetDevices.use-case";
import { AuthGuard } from "src/guards/auth.guard";
import { Notificaciones } from "src/notificaciones/notificaciones.class";
import { disconnectedDevicesStore } from "../disconnected-devices.store";
import { computeEffectiveStatus } from "../device-status.utils";
import { CompleteUser } from "src/decorators/getCompleteUser.decorator";
import { TrabajadorService } from "src/trabajadores/trabajadores.class";
import { SchedulerGuard } from "src/guards/scheduler.guard";

@Controller("get-all-devices")
export class GetDevicesController {
  constructor(
    private readonly getDevicesUseCase: IGetDevicesUseCase,
    private readonly notificaciones: Notificaciones,
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

    console.log("user", user);

    // Validamos permisos del usuario
    const hasPermiso = user?.roles?.some((r) => r.name === "Super_Admin");

    if (hasPermiso) {
      const userToken = await this.notificaciones.getFCMToken(user.idApp);
      if (userToken) {
        await this.processNotificationsForUser(user, userToken.token);
      }
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
        ) ||
        user?.roles?.some(
          (rol: { name: string }) => rol.name === "Super_Admin",
        );

      if (!hasPermiso) continue;

      const userToken = await this.notificaciones.getFCMToken(user.idApp);
      if (userToken) {
        // aquí llamamos a la lógica que ya tienes para notificar
        await this.processNotificationsForUser(user, userToken.token);
      }
    }

    return { ok: true };
  }

  //  lógica de notificación de datafonos
  private async processNotificationsForUser(user: any, token: string) {
    const res = await this.getDevicesUseCase.execute();

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

        if (effectiveStatus === "Desconectado") {
          if (!prev || prev.status !== "Desconectado") {
            await this.notificaciones.sendNotificationToDevice(
              token,
              "Datafono desconectado",
              `${branch.name} - ${device.serialNumber} desconectado`,
              "/monitorizacion",
            );
            disconnectedDevicesStore.set(deviceId, {
              status: "Desconectado",
              lastNotified: now,
            });
          } else if (
            prev.lastNotified &&
            (now.getTime() - prev.lastNotified.getTime()) / 3600000 >= 1
          ) {
            await this.notificaciones.sendNotificationToDevice(
              token,
              "El Datafono sigue desconectado",
              `${branch.name} - ${device.serialNumber} continúa desconectado`,
              "/monitorizacion",
            );
            disconnectedDevicesStore.set(deviceId, {
              status: "Desconectado",
              lastNotified: now,
            });
          }
        }

        if (
          effectiveStatus === "Conectado" &&
          prev?.status === "Desconectado"
        ) {
          await this.notificaciones.sendNotificationToDevice(
            token,
            "Datafono reconectado",
            `${branch.name} - ${device.serialNumber} se ha reconectado`,
            "/monitorizacion",
          );
          disconnectedDevicesStore.set(deviceId, { status: "Conectado" });
        }

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
