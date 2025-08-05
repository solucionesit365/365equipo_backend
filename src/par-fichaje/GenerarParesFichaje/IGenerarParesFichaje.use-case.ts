import { ParFichaje } from "@prisma/client";
import { DateTime } from "luxon";

export abstract class IGenerarParesFichajeUseCase {
  /**
   *
   * @description Buscará por las entradas que estén entre hoy inicio y hoy final
   */
  abstract execute(): Promise<ParFichaje[]>;
}
