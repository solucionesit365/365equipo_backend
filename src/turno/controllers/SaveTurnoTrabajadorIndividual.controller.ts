import { Body, Controller, Post } from "@nestjs/common";
import { SaveTurnoTrabajadorIndividualDto } from "../dto/turno.dto";
import {
  IReqSaveTurnoTrabajadorIndividual,
  ISaveTurnoTrabajadorIndividualUseCase,
} from "../use-cases/interfaces/ISaveTurnoTrabajadorIndividualUseCase";
import { DateTime } from "luxon";

@Controller("save-turno-trabajador-individual")
export class SaveTurnoTrabajadorIndividualController {
  constructor(
    private readonly saveTurnoTrabajadorIndividualUseCase: ISaveTurnoTrabajadorIndividualUseCase,
  ) {}

  @Post()
  saveTurnoTrabajadorIndividual(
    @Body() reqSave: SaveTurnoTrabajadorIndividualDto,
  ) {
    // Conversión al tipo que nos interesa
    const saveObjectTransformed: IReqSaveTurnoTrabajadorIndividual = {
      dia: DateTime.fromISO(reqSave.dia),
      idTrabajador: reqSave.idTrabajador,
      turnos: reqSave.turnos.map((turno) => {
        return {
          id: turno.id,
          inicio: DateTime.fromISO(turno.inicioISO),
          final: DateTime.fromISO(turno.finalISO),
          tiendaId: turno.tiendaId,
          borrable: turno.borrable,
        };
      }),
    };

    return this.saveTurnoTrabajadorIndividualUseCase.execute(
      saveObjectTransformed.idTrabajador,
      saveObjectTransformed.dia,
      saveObjectTransformed.turnos,
    );
  }
}
