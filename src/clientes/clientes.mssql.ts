import { recHitBind } from "../bbdd/mssql";

export async function nuevoCliente(
  nombre: string,
  apellidos: string,
  telefono: string,
  id: string,
  codigoPostal: string,
  idExterna: string,
  email: string,
) {
  // @param0 = id
  // @param1 = nombre + apellidos
  // @param2 = telefono
  // @param3 = codigoPostal
  // @param4 = idExterna
  // @param5 = email
  const sql = `
  IF EXISTS (SELECT * FROM ClientsFinals WHERE Id = @param0 OR emili = @param5) 
    BEGIN
      SELECT 'YA_EXISTE' as resultado
    END
  ELSE
    BEGIN
      INSERT INTO ClientsFinals VALUES (@param0, @param1, @param2, '', @param5, '', @param3, '', @param4);
      INSERT INTO Punts (IdClient, Punts, data, Punts2, data2) VALUES (@param0, 2500, GETDATE(), NULL, NULL);
      SELECT 'CREADO' as resultado;
    END
  `;

  await recHitBind(
    "Fac_Tena",
    sql,
    id,
    nombre + " " + apellidos,
    telefono,
    codigoPostal,
    idExterna,
    email,
  );
}
