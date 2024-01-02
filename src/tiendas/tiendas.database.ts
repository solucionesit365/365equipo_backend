import { Injectable } from "@nestjs/common";
import { recHit } from "../bbdd/mssql";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TiendaDatabaseService {
  constructor(private readonly prisma: PrismaService) {}
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
    const tiendas = await recHit(
      "Fac_Tena",
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
