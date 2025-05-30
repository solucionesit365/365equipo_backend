import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { IPrismaService } from "./prisma.interface";

@Global()
@Module({
  providers: [{ provide: IPrismaService, useClass: PrismaService }],
  exports: [IPrismaService],
})
export class PrismaModule {}
