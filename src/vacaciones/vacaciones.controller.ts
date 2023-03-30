import { Controller, Get, Query, Headers, Post, Body } from "@nestjs/common";
import { verifyToken } from "../firebase/auth";
import { TokenService } from "../get-token/get-token.service";
import { trabajadorInstance } from "../trabajadores/trabajadores.class";
import { vacacionesInstance } from "./vacaciones.class";

@Controller("vacaciones")
export class VacacionesController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async getSolicitudes(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);
      return {
        ok: true,
        data: await vacacionesInstance.getSolicitudes(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("sendToHit")
  async pendientesEnvio(@Headers("authorization") authHeader: string) {
    try {
      const token = this.tokenService.extract(authHeader);

      if (token === process.env.SINCRO_TOKEN) {
        return {
          ok: true,
          data: await vacacionesInstance.sendToHit(),
        };
      }
      throw Error("No tienes permiso para completar esta acción");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajador(
    @Headers("authorization") authHeader: string,
    @Query() { uid, id },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      if (uid) {
        return {
          ok: true,
          data: await vacacionesInstance.getSolicitudesTrabajadorUid(uid),
        };
      } else if (id) {
        return {
          ok: true,
          data: await vacacionesInstance.getSolicitudesTrabajadorSqlId(id),
        };
      } else throw Error("Faltan datos. uid o id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("borrarSolicitud")
  async borrarSolicitud(
    @Headers("authorization") authHeader: string,
    @Body() { idSolicitud },
  ) {
    try {
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      return {
        ok: true,
        data: vacacionesInstance.borrarSolicitud(idSolicitud),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("solicitudesSubordinados")
  async solicitudesSubordinados(
    @Headers("authorization") authHeader: string,
    @Query() { idAppResponsable },
  ) {
    try {
      if (!idAppResponsable) throw Error("Faltan datos");
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      const solicitudesEmpleadosDirectos =
        await vacacionesInstance.getSolicitudesSubordinados(idAppResponsable);
      const empleadosTipoCoordi =
        await trabajadorInstance.getSubordinadosConTienda(idAppResponsable);
      const soyCoordinadora: boolean = await trabajadorInstance.esCoordinadora(
        idAppResponsable,
      );
      const addArray = [];

      if (empleadosTipoCoordi.length > 0) {
        for (let i = 0; i < empleadosTipoCoordi.length; i++) {
          if (empleadosTipoCoordi[i].llevaEquipo > 0) {
            // Caso coordinadora
            const solicitudesSubordinadosCoordinadora =
              await vacacionesInstance.getSolicitudesSubordinados(
                empleadosTipoCoordi[i].idApp,
              );

            if (solicitudesSubordinadosCoordinadora.length > 0) {
              for (
                let j = 0;
                j < solicitudesSubordinadosCoordinadora.length;
                j++
              ) {
                solicitudesSubordinadosCoordinadora[j]["validador"] =
                  idAppResponsable;
              }
              addArray.push(...solicitudesSubordinadosCoordinadora);
            }
          }
        }
      }

      if (soyCoordinadora) {
        for (let i = 0; i < addArray.length; i++) {
          addArray[i]["validador"] = idAppResponsable;
        }

        for (let i = 0; i < solicitudesEmpleadosDirectos.length; i++) {
          solicitudesEmpleadosDirectos[i]["validador"] = idAppResponsable;
        }
      }

      if (solicitudesEmpleadosDirectos.length > 0) {
        solicitudesEmpleadosDirectos.push(...addArray);
        return { ok: true, data: solicitudesEmpleadosDirectos };
      } else if (addArray.length > 0) {
        return { ok: true, data: addArray };
      } else return { ok: true, data: [] };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("setEstadoSolicitud")
  async setEstadoSolicitud(
    @Headers("authorization") authHeader: string,
    @Body() { estado, idSolicitud, respuesta },
  ) {
    try {
      if (!estado || !idSolicitud) throw Error("Faltan datos");
      if (!(estado === "APROBADA" || estado === "RECHAZADA"))
        throw Error("Estado de solicitud incorrecto");
      const token = this.tokenService.extract(authHeader);
      await verifyToken(token);

      return {
        ok: true,
        data: await vacacionesInstance.setEstadoSolicitud(
          estado,
          idSolicitud,
          respuesta,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
