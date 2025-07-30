export abstract class ISincroTrabajadoresUseCase {
  abstract execute(): Promise<{
    created: number;
    updated: number;
    deleted: number;
  }>;
}
