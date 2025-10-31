import { Injectable } from "@nestjs/common";
import { IUpdateSupervisoraTiendaUseCase } from "./IUpdateSupervisoraTienda.use-case";
import { ISupervisorTiendaRepository } from "../repository/ISupervisorTienda.repository";

@Injectable()
export class UpdateSupervisoraTiendaUseCase
  implements IUpdateSupervisoraTiendaUseCase
{
  constructor(
    private readonly supervisorTiendaRepository: ISupervisorTiendaRepository,
  ) {}

  execute(tiendasIds: number[], idSupervisora: number): Promise<void> {
    this.supervisorTiendaRepository.updateSupervisoraDeTiendas(
      tiendasIds,
      idSupervisora,
    );
    return;
  }
}
