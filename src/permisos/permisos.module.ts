import { Module } from "@nestjs/common";
import { PermisosService } from "./permisos.class";

@Module({
  providers: [PermisosService],
  exports: [PermisosService],
})
export class PermisosModule {}
