import { Controller, Post, UseGuards, Body, Get, Query } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { DiaPersonalClass } from "./dia-personal.class";
import { diaPersonal } from "./dia-personal.interface";
import { EmailService } from "src/email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { constructEmailContent } from "./emailDiaPersonal";

@Controller("dia-personal")
export class DiaPersonalController {
  constructor(
    private readonly diaPersonalInstance: DiaPersonalClass,
    private readonly trabajadorInstance: TrabajadorService,
    private readonly email: EmailService,
  ) {}

  //Nueva solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("nuevaSolicitudDiaPersonal")
  async nuevaSolicitudDiaPersonal(@Body() diaPersonal: diaPersonal) {
    try {
      diaPersonal.fechaInicio = new Date(diaPersonal.fechaInicio);
      diaPersonal.fechaFinal = new Date(diaPersonal.fechaFinal);
      diaPersonal.fechaIncorporacion = new Date(diaPersonal.fechaIncorporacion);
      diaPersonal.fechaCreacion = new Date(diaPersonal.fechaCreacion);

      const solicitudTrabajador =
        await this.trabajadorInstance.getTrabajadorBySqlId(
          Number(diaPersonal.idBeneficiario),
        );

      const emailContent = constructEmailContent(diaPersonal);

      this.email.enviarEmail(
        solicitudTrabajador.emails,
        emailContent,
        "Confirmación de Solicitud de Dia Personal",
      );

      return {
        ok: true,
        data: await this.diaPersonalInstance.nuevaSolicitudDiaPersonal(
          diaPersonal,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar todas las solicitudes de los dias personales de los trabajadores
  @UseGuards(AuthGuard)
  @Get("getSolicitudes")
  async getSolicitudes(@Query() { year }) {
    try {
      return {
        ok: true,
        data: await this.diaPersonalInstance.getSolicitudes(Number(year)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  //Mostrar Solicitudes de los dias personales de el trabajador por idSql
  @UseGuards(AuthGuard)
  @Get("solicitudesTrabajador")
  async getSolicitudesTrabajadorSqlId(@Query() { idBeneficiario, year }) {
    try {
      if (idBeneficiario) {
        return {
          ok: true,
          data: await this.diaPersonalInstance.getSolicitudesTrabajadorSqlId(
            Number(idBeneficiario),
            Number(year),
          ),
        };
      } else throw Error("Faltan datos. id");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("solicitudesSubordinadosDiaPersonal")
  async solicitudesSubordinadosDiaPersonal(
    @Query() { idAppResponsable, year },
  ) {
    try {
      if (!idAppResponsable) throw Error("Faltan datos");

      const solicitudesEmpleadosDirectos =
        await this.diaPersonalInstance.solicitudesSubordinadosDiaPersonal(
          idAppResponsable,
          Number(year),
        );
      const empleadosTipoCoordi =
        await this.trabajadorInstance.getSubordinadosConTienda(
          idAppResponsable,
        );
      const soyCoordinadora: boolean =
        await this.trabajadorInstance.esCoordinadora(idAppResponsable);
      const addArray = [];

      if (empleadosTipoCoordi.length > 0) {
        for (let i = 0; i < empleadosTipoCoordi.length; i++) {
          if (empleadosTipoCoordi[i].llevaEquipo) {
            // Caso coordinadora
            const solicitudesSubordinadosCoordinadora =
              await this.diaPersonalInstance.solicitudesSubordinadosDiaPersonal(
                empleadosTipoCoordi[i].idApp,
                Number(year),
              );

            if (solicitudesSubordinadosCoordinadora.length > 0) {
              addArray.push(...solicitudesSubordinadosCoordinadora);
            }
          }
        }
      }

      if (soyCoordinadora) {
        addArray.forEach((solicitud) => {
          solicitud["validador"] = idAppResponsable;
        });
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

  //Borrar solicitud de vacaciones
  @UseGuards(AuthGuard)
  @Post("borrarSolicitud")
  async borrarSolicitud(@Body() { _id }: { _id: string }) {
    try {
      await this.diaPersonalInstance.borrarSolicitud(_id);

      return {
        ok: true,
        data: "Solicitud borrada con exito",
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("setEstadoSolicitud")
  async updateSolicitudDiaPersonalEstado(@Body() diaPersonal: diaPersonal) {
    try {
      if (!diaPersonal.estado || !diaPersonal._id) throw Error("Faltan datos");

      if (
        !(
          diaPersonal.estado === "APROBADA" ||
          diaPersonal.estado === "RECHAZADA"
        )
      )
        throw Error("Estado de solicitud incorrecto");
      const resEstado =
        await this.diaPersonalInstance.updateSolicitudDiaPersonalEstado(
          diaPersonal,
        );
      if (resEstado) {
        const solicitud = await this.diaPersonalInstance.getSolicitudesById(
          diaPersonal._id.toString(),
        );

        const solicitudTrabajador =
          await this.trabajadorInstance.getTrabajadorBySqlId(
            Number(solicitud.idBeneficiario),
          );

        this.email.enviarEmail(
          solicitudTrabajador.emails,
          `
              <div style="font-family: 'Arial', sans-serif; color: #333;">
                <p>Tu Dia Personal ha sido: <strong>${
                  solicitud.estado
                }</strong></p>
                ${
                  solicitud.respuestaSolicitud
                    ? `<p><strong>Motivo:</strong> ${solicitud.respuestaSolicitud}</p>`
                    : "Controlate no gastes mucho"
                }
                <p>Esperamos que disfrutes de tu tiempo libre.</p>
                <p>Saludos cordiales,<br/>El equipo de 365</p>
              </div>
            `,
          "Estado de Dia Personal",
        );
        return {
          ok: true,
        };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("enviarAlEmail")
  async enviarAlEmail(@Body() data) {
    try {
      return await this.diaPersonalInstance.enviarAlEmail(data);
    } catch (error) {
      return error;
    }
  }
}
