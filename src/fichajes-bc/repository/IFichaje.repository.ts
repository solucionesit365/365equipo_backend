import { DateTime } from "luxon";
import { FichajeDto } from "../fichajes.interface";

export abstract class IFichajeRepository {
  /**
   *
   * @description Devuelve los fichajes. Busca "entrada" que estén entre startSearch y endSearch
   */
  abstract getFichajes(
    startSearch: DateTime,
    endSearch: DateTime,
  ): Promise<FichajeDto[]>;
}
