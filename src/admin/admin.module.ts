import { Module } from "@nestjs/common";
import { Admin } from "./admin.class";

@Module({
  providers: [Admin],
  exports: [Admin],
})
export class AdminModule {}
