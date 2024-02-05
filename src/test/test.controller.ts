import { Controller, Get, Post } from "@nestjs/common";
import axios from "axios";
import { EmailService } from "../email/email.class";
import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
import { FichajeValidadoDto } from "../fichajes-validados/fichajes-validados.dto";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Controller("test")
export class TestController {
  constructor(
    private readonly emailInstance: EmailService,
    private readonly fichajesValidadosInstance: FichajesValidadosService,
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}
  @Get()
  test() {
    this.emailInstance.enviarEmail(
      "ezequiel@solucionesit365.com",
      "Mensaje aquí",
      "Asunto super importante",
    );
    return true;
  }

  @Get("ip")
  async getIp(): Promise<string> {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      throw new Error("Failed to fetch IP address");
    }
  }

  @Get("rectificarFichajesValidados")
  async rectificarFichajesValidados() {
    try {
      const fichajesValidados = await this.fichajesValidadosInstance.getTodos();
      const fichajesValidadosRectificados: FichajeValidadoDto[] = [];

      for (let i = 0; i < fichajesValidados.length; i += 1) {
        try {
          const trabajadorAux =
            await this.trabajadoresInstance.getTrabajadorBySqlId(
              fichajesValidados[i].idTrabajador,
            );

          const fechaFichajeValidado = DateTime.fromFormat(
            fichajesValidados[i].fecha,
            "yyyy-MM-dd",
          );

          // Para establecer la hora de entrada
          const [horaEntrada, minutoEntrada] = fichajesValidados[
            i
          ].fichajes.entrada
            .split(":")
            .map(Number);
          const fichajeEntrada = fechaFichajeValidado.set({
            hour: horaEntrada,
            minute: minutoEntrada,
          });

          // Para establecer la hora de salida
          const [horaSalida, minutoSalida] = fichajesValidados[
            i
          ].fichajes.salida
            .split(":")
            .map(Number);
          const fichajeSalida = fechaFichajeValidado.set({
            hour: horaSalida,
            minute: minutoSalida,
          });

          // Para establecer la hra del cuadrante de entrada
          const [horaEntradaCuadranteAux, minutoEntradaCuadranteAux] =
            fichajesValidados[i].cuadrante.entrada.split(":").map(Number);
          const horaEntradaCuadrante = fechaFichajeValidado.set({
            hour: horaEntradaCuadranteAux,
            minute: minutoEntradaCuadranteAux,
          });

          // Para establecer la hra del cuadrante de salida
          const [horaSalidaCuadranteAux, minutoSalidaCuadranteAux] =
            fichajesValidados[i].cuadrante.salida.split(":").map(Number);
          const horaSalidaCuadrante = fechaFichajeValidado.set({
            hour: horaSalidaCuadranteAux,
            minute: minutoSalidaCuadranteAux,
          });

          const fichajeValidado: FichajeValidadoDto = {
            enviado: false,
            aPagar: fichajesValidados[i].aPagar,
            comentario: {
              entrada: fichajesValidados[i].comentarios.entrada,
              salida: fichajesValidados[i].comentarios.entrada,
            },
            cuadrante: {
              final: horaSalidaCuadrante.toJSDate(),
              inicio: horaEntradaCuadrante.toJSDate(),
              idTrabajador: fichajesValidados[i].cuadrante.idTrabajador,
              nombre: fichajesValidados[i].cuadrante.nombre,
              totalHoras: fichajesValidados[i].cuadrante.totalHoras,
              idTienda: fichajesValidados[i].cuadrante.idTienda,
            },
            dni: trabajadorAux.dni,
            idTienda: trabajadorAux.idTienda,
            fichajeEntrada: fichajeEntrada.toJSDate(),
            fichajeSalida: fichajeSalida.toJSDate(),
            horasAprendiz: fichajesValidados[i].horasAprendiz,
            horasCoordinacion: fichajesValidados[i].horasCoordinacion,
            horasCuadrante: fichajesValidados[i].horasCuadrante,
            horasExtra: fichajesValidados[i].horasExtra,
            horasFichaje: fichajesValidados[i].horasFichaje,
            horasPagar: {
              comentario: fichajesValidados[i].horasPagar.comentario,
              estadoValidado: fichajesValidados[i].horasPagar.estadoValidado,
              respSuper: fichajesValidados[i].horasPagar.respSuper,
              total: fichajesValidados[i].horasPagar.total,
            },
            idFichajes: {
              entrada: fichajesValidados[i].idFichajes.entrada,
              salida: fichajesValidados[i].idFichajes.salida,
            },
            idResponsable: fichajesValidados[i].idResponsable,
            idTrabajador: fichajesValidados[i].idTrabajador,
            nombre: fichajesValidados[i].nombre,
            pagado: fichajesValidados[i].pagado,
          };

          fichajesValidadosRectificados.push(fichajeValidado);
        } catch (err) {
          continue;
        }
      }
      return (
        await this.fichajesValidadosInstance.insertFichajesValidadosRectificados(
          fichajesValidadosRectificados,
        )
      ).acknowledged;
    } catch (err) {
      console.log(err);
      return err.message;
    }
  }

  // @Post("rectificarFichajes")
  // async reactificarFichajes() {
  //   const fichajes = await this.fichajesInstance.getAllFichajes();

  //   // Recorrer y añadir dos campos nuevos a la interfaz de fichajes, desde getTrabajadorBySqlId (this.trabajadoresInstance.getTrabajadorByAppId(fichajes.uid))

  //   const cache = [];

  //   for (let i = 0; i < fichajes.length; i += 1) {
  //     const index = cache.findIndex(
  //       (cachedItem) => cachedItem.idExterno === fichajes[i].idExterno,
  //     );
  //     try {
  //       if (index === -1) {
  //         const trabajadorAux =
  //           await this.trabajadoresInstance.getTrabajadorBySqlId(
  //             fichajes[i].idExterno,
  //           );
  //         fichajes[i].nombre = trabajadorAux.nombreApellidos;
  //         fichajes[i].dni = trabajadorAux.dni;
  //         cache.push(fichajes[i]);
  //       } else {
  //         fichajes[i].nombre = cache[index].nombre;
  //         fichajes[i].dni = cache[index].dni;
  //       }
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   }
  //   await this.fichajesInstance.setAllFichajes(fichajes);
  //   return "OK";
  // }
}
