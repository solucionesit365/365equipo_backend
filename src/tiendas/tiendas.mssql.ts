import { recHit, recSoluciones, recSolucionesClassic } from "../bbdd/mssql";
import { Tienda } from "./tiendas.dto";

export async function getTiendas(): Promise<Tienda[]> {
  const sql =
    "SELECT id, LOWER(nombre) as nombre, direccion, idExterno FROM tiendas ORDER BY nombre";
  const resTiendas = await recSoluciones(sql);

  if (resTiendas.recordset.length > 0) return resTiendas.recordset;
  return null;
}

/* ¡¡ Solo Hit !! */
export async function getTiendasHit(): Promise<
  {
    id: number;
    nombre: string;
    direccion: string;
  }[]
> {
  const tiendas = await recHit(
    "Fac_Tena",
    `
      select 
        cli.Codi as id, 
        LOWER(cli.nom) as nombre, 
        cli.adresa as direccion 
      from paramsHw ph 
      left join clients cli ON cli.Codi = ph.Valor1 
      where 
        cli.nom NOT LIKE '%antigua%' AND 
        cli.nom NOT LIKE '%vieja%' AND 
        cli.nom NOT LIKE '%no%' AND 
        cli.codi IS NOT NULL 
      order by cli.nom
    `,
  );

  if (tiendas.recordset.length > 0) return tiendas.recordset;
  return [];
}

export async function addTiendasNuevas(nuevas: any[]) {
  let sql = "";

  for (let i = 0; i < nuevas.length; i++) {
    if (nuevas[i].id && nuevas[i].nombre) {
      sql += `
      INSERT INTO tiendas (nombre, direccion, idExterno)
      VALUES ('${nuevas[i].nombre}', '${nuevas[i].direccion}', ${nuevas[i].id});`;
    }
  }

  if (sql != "") {
    const resNuevas = await recSolucionesClassic(sql);
    if (resNuevas.rowsAffected[0] > 0) return true;
  }
  return false;
}
