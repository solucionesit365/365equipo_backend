import { Controller, UseGuards, Body, Post, Get, Query } from "@nestjs/common";
import { KpiTiendasClass } from "./kpi-tiendas.class";
import { AuthGuard } from "../guards/auth.guard";
import { KpiTiendasInterface } from "./kpi-tiendas.interface";
import { Notificaciones } from "../notificaciones/notificaciones.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("kpi-tiendas")
export class KpiTiendasController {
  constructor(
    private readonly kpiTiendasClass: KpiTiendasClass,
    private readonly notificaciones: Notificaciones,
    private readonly trabajadores: TrabajadorService,
  ) {}

  @UseGuards(AuthGuard)
  @Post("nuevoKpiTienda")
  async nuevoKPI(@Body() kpiTienda: KpiTiendasInterface) {
    try {
      const nuevoKPI = await this.kpiTiendasClass.nuevoKPI(kpiTienda);
      if (nuevoKPI) {
        const usuariosCompletos = await this.trabajadores.getTrabajadores();

        // Filtrar solo los trabajadores que tienen los roles adecuados
        const trabajadoresConRolAdecuado = usuariosCompletos.filter(
          (trabajador) =>
            trabajador.roles.some((rol) =>
              ["Tienda", "Coordinadora_A"].includes(rol.name),
            ) && trabajador.idTienda === kpiTienda.tienda,
        );

        for (const trabajador of trabajadoresConRolAdecuado) {
          // Verificar que el idApp existe antes de llamar a getFCMToken
          if (trabajador.idApp) {
            const userToken = await this.notificaciones.getFCMToken(
              trabajador.idApp,
            );

            if (userToken && userToken.token) {
              try {
                await this.notificaciones.sendNotificationToDevice(
                  userToken.token,
                  "Nuevo KPI Disponible",
                  `${kpiTienda.comentario}`,
                  "/kpiTiendaIndex",
                );
              } catch (error) {
                console.error(error);
              }
            }
          }
        }

        return {
          ok: true,
          data: nuevoKPI,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getKPIS")
  async getKPIS(
    @Query()
    { semana, año, tienda }: { semana: number; año: number; tienda: number },
  ) {
    try {
      const respKPIS = await this.kpiTiendasClass.getKPIS(
        Number(semana),
        Number(año),
        Number(tienda),
      );

      if (respKPIS) {
        return { ok: true, data: respKPIS };
      } else {
        throw Error("No se ha encontrado ningun kpis");
      }
    } catch (error) {
      console.log(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllKPIs")
  async getAllKPI(
    @Query()
    { semana, año }: { semana: number; año: number },
  ) {
    try {
      const respKPIS = await this.kpiTiendasClass.getAllKPIs(
        Number(semana),
        Number(año),
      );

      if (respKPIS.length > 0) {
        return { ok: true, data: respKPIS };
      } else {
        return { ok: false, data: [] };
      }
    } catch (error) {}
  }

  @UseGuards(AuthGuard)
  @Post("borrarKpiTienda")
  async borrarKpiTienda(@Body() kpiTienda: KpiTiendasInterface) {
    try {
      const respKPIS = await this.kpiTiendasClass.borrarKPITienda(kpiTienda);

      if (respKPIS)
        return {
          ok: true,
          data: respKPIS,
        };
    } catch (error) {
      return {
        ok: false,
        data: error,
      };
    }
  }
}
