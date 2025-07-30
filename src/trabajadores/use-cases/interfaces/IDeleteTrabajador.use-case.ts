export interface IDeleteTrabajadorDto {
  id: number;
}

export abstract class IDeleteTrabajadorUseCase {
  abstract execute(trabajadores: IDeleteTrabajadorDto[]): Promise<{ count: number }>;
}