import { Injectable } from "@nestjs/common";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class NominasDatabase {
  constructor(private readonly hitMssqlService: HitMssqlService) {}

  async getNomina(dni: string, idArchivo: string) {
    const sql = `
        DECLARE @idUsuario int = null
        select @idUsuario = id from dependentesExtes where nom = 'DNI' and valor like '${dni}'
        select archivo from archivo where propietario = convert(nvarchar, @idUsuario) AND id = '${idArchivo}'
        `;
    const resNomina = await this.hitMssqlService.recHit(sql);

    // if (resNomina.recordset.length > 0) {
    //   return resNomina.recordset[0].archivo.toString("base64");
    // }
    throw Error("No ha podido obtener esta nómina");
  }

  async getListadoNominas(dni: string) {
    const sql = `
        DECLARE @idUsuario int = null
        SELECT @idUsuario = id from dependentesExtes WHERE nom = 'DNI' and valor like '${dni}'
        SELECT id, nombre, extension, descripcion, mime from archivo WHERE propietario = convert(nvarchar, @idUsuario)
    `;

    const resListado = await this.hitMssqlService.recHit(sql);

    return []; //resListado.recordset;
  }
}
