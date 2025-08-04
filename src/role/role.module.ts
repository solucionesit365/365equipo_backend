import { Global, Module } from "@nestjs/common";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";

@Global()
@Module({
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
