import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
import { UserRecord } from "firebase-admin/auth";
import { Trabajador, Tienda, Contrato } from "@prisma/client";
import { FichajeValidadoDto } from "../fichajes-validados/fichajes-validados.dto";

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

  private ordenarFichajesValidados(
    arrayValidadosMezclados: FichajeValidadoDto[],
  ): FichajeValidadoDto[][] {
    // Crear un array de 7 elementos, uno para cada día de la semana, inicializando cada elemento como un array vacío.
    const arrayValidadosOrdenados: FichajeValidadoDto[][] = [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ];

    // Recorrer cada elemento en el array de fichajes mezclados.
    arrayValidadosMezclados.forEach((fichaje) => {
      // Obtener el día de la semana de fichajeEntrada (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
      const diaDeLaSemana = fichaje.fichajeEntrada.getDay();

      // Ajustar el índice basado en tu requisito (0 = Lunes, ..., 6 = Domingo)
      const indiceAjustado = diaDeLaSemana === 0 ? 6 : diaDeLaSemana - 1;

      // Añadir el fichaje al subarray correspondiente al día de la semana.
      arrayValidadosOrdenados[indiceAjustado].push(fichaje);
    });

    return arrayValidadosOrdenados;
  }

  private horasAPagarTrabajador(arrayValidados: FichajeValidadoDto[][]) {
    let suma = 0;

    for (let i = 0; i < 7; i += 1) {
      for (let j = 0; j < arrayValidados[i].length; j += 1) {
        if (arrayValidados[i][j].horasPagar.estadoValidado === "APROBADAS") {
          suma += arrayValidados[i][j].horasPagar.total;
        }
      }
    }

    return suma;
  }

  async informePactadoVsReal(inicioSemana: DateTime) {
    const trabajadores = await this.trabajadoresInstance.getTrabajadores();

    const promesasTrabajadores = trabajadores.map(async (trabajador) => {
      // const arrayValidadosPromesas = [];

      // for (let j = 0; j < 7; j += 1) {
      //   const fecha = inicioSemana.plus({ days: j });
      //   const promesaFichaje =
      //     this.fichajesValidadosService.getFichajesValidadosInforme(
      //       fecha.startOf("day"),
      //       fecha.endOf("day"),
      //       trabajador.id, // Asegúrate de pasar el ID del trabajador aquí
      //     );

      //   arrayValidadosPromesas.push(promesaFichaje);
      // }

      const arrayValidadosMezclados =
        await this.fichajesValidadosService.getFichajesValidadosInforme(
          inicioSemana.startOf("day"),
          inicioSemana.endOf("week"),
          trabajador.id,
        );

      const arrayValidados = this.ordenarFichajesValidados(
        arrayValidadosMezclados,
      );

      return {
        nombre: trabajador.nombreApellidos,
        idTrabajador: trabajador.id,
        dni: trabajador.dni,
        tienda: trabajador.tienda?.nombre,
        contrato: (trabajador.contratos[0].horasContrato * 40) / 100,
        fechaAntiguedad: trabajador.contratos[0].fechaAntiguedad,
        arrayValidados,
        horasAPagar: this.horasAPagarTrabajador(arrayValidados),
      };
    });

    const pactadoReal = await Promise.all(promesasTrabajadores);
    return pactadoReal;
  }
}
