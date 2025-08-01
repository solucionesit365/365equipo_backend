import { Module } from "@nestjs/common";
import { ISubordinadoRepository } from "./repository/ISubordinado.repository";
import { SubordinadoRepository } from "./repository/Subordinado.repository";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: ISubordinadoRepository, useClass: SubordinadoRepository },
  ],
  exports: [ISubordinadoRepository],
})
export class SubordinadoModule {}
