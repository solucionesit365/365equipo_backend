import { Body, Controller, Post } from "@nestjs/common";
import { SaveTurnosTrabajadorSemanalDto } from "../dto/turno.dto";
import {
  IReqSaveTurnosTrabajadorSemanal,
  ISaveTurnosTrabajadorSemanalUseCase,
} from "../interface/ISaveTurnosTrabajadorSemanalUseCase";
import { DateTime } from "luxon";

@Controller("save-turnos-trabajador-semanal")
export class SaveTurnosTrabajadorSemanalController {
  constructor(
    private readonly saveTurnosTrabajadorSemanalUseCase: ISaveTurnosTrabajadorSemanalUseCase,
  ) {}

  @Post()
  saveTurnosTrabajadorSemanal(@Body() reqSave: SaveTurnosTrabajadorSemanalDto) {
    // Conversión al tipo que nos interesa
    const saveObjectTransformed: IReqSaveTurnosTrabajadorSemanal = {
      inicioSemana: DateTime.fromISO(reqSave.inicioSemanaISO),
      idTrabajador: reqSave.idTrabajador,
      arrayTurnos: reqSave.arrayTurnos.map((turno) => {
        return {
          id: turno.id,
          inicio: DateTime.fromISO(turno.inicioISO),
          final: DateTime.fromISO(turno.finalISO),
          tiendaId: turno.tiendaId,
          borrable: turno.borrable,
        };
      }),
    };

    return this.saveTurnosTrabajadorSemanalUseCase.execute(
      saveObjectTransformed.idTrabajador,
      saveObjectTransformed.inicioSemana,
      saveObjectTransformed.arrayTurnos,
    );
  }
}
