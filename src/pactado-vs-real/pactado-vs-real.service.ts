import { Injectable } from "@nestjs/common";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
import { Trabajador } from "@prisma/client";
import { DecodedIdToken } from "firebase-admin/auth";

@Injectable()
export class PactadoVsRealService {
  constructor(
    private readonly trabajadoresInstance: TrabajadorService,
    private readonly fichajesValidadosService: FichajesValidadosService,
  ) {}
  async pactadoVsReal(
    trabajadorRequest: DecodedIdToken,
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

    const trabajadoresTienda: any[] = [];

    for (let i = 0; i < idsSubordinados.length; i += 1) {
      const trabajador = await this.trabajadoresInstance.getTrabajadorBySqlId(
        idsSubordinados[i],
      );
      trabajadoresTienda.push(trabajador);
    }

    const pactadoReal = [];

    for (let i = 0; i < trabajadoresTienda.length; i += 1) {
      pactadoReal.push({
        nombre: trabajadoresTienda[i].nombreApellidos,
        idTrabajador: trabajadoresTienda[i].id,
        contrato: trabajadoresTienda[i].horasContrato,
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
    console.log(pactadoReal);
    return pactadoReal;
  }
}
