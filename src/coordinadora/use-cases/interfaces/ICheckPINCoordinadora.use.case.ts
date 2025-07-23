export abstract class ICheckPINCoordinadoraUseCase {
  abstract execute(idTienda: number, pin: number): Promise<boolean>;
}
