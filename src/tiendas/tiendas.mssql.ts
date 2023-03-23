import { recSoluciones } from "../bbdd/mssql";
import { TiendaDto } from "./tiendas.dto";

export async function getTiendas() {
  const sql = "SELECT * FROM tiendas";
  const resTiendas = await recSoluciones("soluciones", sql);

  if (resTiendas.recordset.length > 0)
    return resTiendas.recordset as TiendaDto[];
  return null;
}
