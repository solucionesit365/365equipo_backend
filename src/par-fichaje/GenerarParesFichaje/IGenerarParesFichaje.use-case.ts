import { ParFichajeGenerado } from "./GenerarParesFichaje.use-case";

export abstract class IGenerarParesFichajeUseCase {
  /**
   *
   * @description Buscará por las entradas que estén entre hoy inicio y hoy final
   */
  abstract execute(): Promise<ParFichajeGenerado[]>;
}
