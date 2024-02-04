import { Module } from "@nestjs/common";
import { Admin } from "./admin.class";
import { AdminController } from "./admin.controller";

@Module({
  providers: [Admin],
  exports: [Admin],
  controllers: [AdminController],
})
export class AdminModule {}
