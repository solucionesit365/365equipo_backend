import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
import { UserRecord } from "firebase-admin/auth";
import { Trabajador, Tienda, Contrato } from "@prisma/client";

type TrabajadorExtendido = Trabajador & {
  tienda?: Tienda | null; // Relación con Tienda
  contratos?: Contrato[] | null; // Relación con Contratos
  responsable?: Trabajador | null; // Relación con Responsable
  subordinados?: Trabajador[] | null; // Relación con Subordinados
};

@Injectable()
export class PactadoVsRealService {
  constructor(
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly fichajesValidadosService: FichajesValidadosService,
  ) {}
  async pactadoVsReal(
    trabajadorRequest: UserRecord,
    fechaInicio: DateTime,
    idTienda: number,
  ) {
    const subordinados = await this.trabajadoresInstance.getSubordinados(
      trabajadorRequest.uid,
    );

    const idsSubordinados = subordinados.map((s) => s.id);

    // Buscar gente que tiene fichajes validados en esta tienda (pueden venir de otras tiendas)
    // Hay que añadirlos a la lista de idsSubordinados.
    const fichajesValidadosTienda =
      await this.fichajesValidadosService.getFichajesValidadosTiendaRango(
        idTienda,
        fechaInicio,
        fechaInicio.endOf("week"),
      );

    // Añadir los subordinados que no estén en la lista de subordinados.
    for (let i = 0; i < fichajesValidadosTienda.length; i += 1) {
      const posibleExterno = fichajesValidadosTienda[i];
      if (!idsSubordinados.find((s) => s === posibleExterno.idTrabajador)) {
        idsSubordinados.push(posibleExterno.idTrabajador);
      }
    }

    const trabajadoresTienda: TrabajadorExtendido[] = [];

    for (let i = 0; i < idsSubordinados.length; i += 1) {
      const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
        idsSubordinados[i],
      );
      trabajadoresTienda.push(trabajador);
    }

    const pactadoReal = [];
    console.log(trabajadoresTienda);

    for (let i = 0; i < trabajadoresTienda.length; i += 1) {
      pactadoReal.push({
        nombre: trabajadoresTienda[i].nombreApellidos,
        idTrabajador: trabajadoresTienda[i].id,
        contrato: (trabajadoresTienda[i].contratos[0].horasContrato * 40) / 100,
        arrayValidados: [],
      });

      for (let j = 0; j < 7; j += 1) {
        const fecha = fechaInicio.plus({ days: j });
        const fichajesValidadosDia =
          await this.fichajesValidadosService.getFichajesValidadosTrabajadorTiendaRango(
            trabajadoresTienda[i].id,
            idTienda,
            fecha.startOf("day"),
            fecha.endOf("day"),
          );
        pactadoReal[i].arrayValidados.push(fichajesValidadosDia);
      }
    }
    return pactadoReal;
  }

  async informePactadoVsReal(fechaInicio: DateTime) {
    const trabajadores = await this.trabajadoresInstance.getTrabajadores();

    const promesasTrabajadores = trabajadores.map(async (trabajador) => {
      const arrayValidadosPromesas = [];

      for (let j = 0; j < 7; j += 1) {
        const fecha = fechaInicio.plus({ days: j });
        const promesaFichaje =
          this.fichajesValidadosService.getFichajesValidadosInforme(
            fecha.startOf("day"),
            fecha.endOf("day"),
            trabajador.id, // Asegúrate de pasar el ID del trabajador aquí
          );

        arrayValidadosPromesas.push(promesaFichaje);
      }

      const arrayValidados = await Promise.all(arrayValidadosPromesas);

      return {
        nombre: trabajador.nombreApellidos,
        idTrabajador: trabajador.id,
        dni: trabajador.dni,
        tienda: trabajador.tienda?.nombre,
        contrato: (trabajador.contratos[0].horasContrato * 40) / 100,
        fechaAntiguedad: trabajador.contratos[0].fechaAntiguedad,
        arrayValidados,
      };
    });

    const pactadoReal = await Promise.all(promesasTrabajadores);
    return pactadoReal;
  }
}
