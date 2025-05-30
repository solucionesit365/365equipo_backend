import { Module } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { PermissionController } from "./permission.controller";
import { IPermissionService } from "./permission.interface";

@Module({
  providers: [{ provide: IPermissionService, useClass: PermissionService }],
  controllers: [PermissionController],
})
export class PermissionModule {}
