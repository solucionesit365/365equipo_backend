export abstract class IUpdateSupervisoraTiendaUseCase {
  abstract execute(tiendasIds: number[], idSupervisora: number): Promise<void>;
}
