import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { HitMssqlService } from "../hit-mssql/hit-mssql.service";

@Injectable()
export class TiendaDatabaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly FacTenaService: HitMssqlService,
  ) {}
  async getTiendas() {
    return await this.prisma.tienda.findMany();
  }

  /* ¡¡ Solo Hit !! */
  async getTiendasHit(): Promise<
    {
      idExterno: number;
      nombre: string;
      direccion: string;
    }[]
  > {
    const tiendas = await this.FacTenaService.recHit(
      `
    SELECT 
      cli.Codi as idExterno, 
      LOWER(cli.nom) as nombre, 
      cli.adresa as direccion 
    FROM paramsHw ph 
    LETF JOIN clients cli ON cli.Codi = ph.Valor1 
    WHERE 
      cli.nom NOT LIKE '%antigua%' AND 
      cli.nom NOT LIKE '%vieja%' AND 
      cli.nom NOT LIKE '%no%' AND 
      cli.codi IS NOT NULL 
    ORDER BY cli.nom
  `,
    );

    if (tiendas.recordset.length > 0) return tiendas.recordset;
    return [];
  }

  async addTiendasNuevas(nuevas: Prisma.TiendaCreateInput[]) {
    const resCreate = await this.prisma.tienda.createMany({
      data: nuevas,
    });

    return !!resCreate.count;
  }
}
