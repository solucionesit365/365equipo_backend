import { recHitBind } from "../bbdd/mssql";

export async function nuevoCliente(
  nombre: string,
  apellidos: string,
  telefono: string,
  id: string,
) {
  // @param0 = id
  // @param1 = nombre + apellidos
  // @param2 = telefono
  const sql = `
  IF EXISTS (SELECT * FROM ClientsFinals WHERE Id = @param0 OR Nom = @param1)
    BEGIN
      SELECT 'YA_EXISTE' as resultado
    END
  ELSE
    BEGIN
      INSERT INTO ClientsFinals VALUES (@param0, @param1, @param2, '', '', '', '', '', '');
      INSERT INTO Punts (IdClient, Punts, data, Punts2, data2) VALUES (@param0, 2500, GETDATE(), NULL, NULL);
      SELECT 'CREADO' as resultado;
    END
  `;

  await recHitBind("Fac_Tena", sql, id, nombre + " " + apellidos, telefono);
}
