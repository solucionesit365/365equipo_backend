import { Module } from "@nestjs/common";
import { PermisosService } from "./permisos.class";
import { PermisosController } from "./permisos.controller";

@Module({
  providers: [PermisosService],
  exports: [PermisosService],
  controllers: [PermisosController],
})
export class PermisosModule {}
