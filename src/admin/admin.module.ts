import { Module } from "@nestjs/common";
import { Admin } from "./admin.class";
import { AdminController } from "./admin.controller";
import { FirebaseAuthGuard } from "../guards/firebase-auth.guard";

@Module({
  providers: [Admin, FirebaseAuthGuard],
  exports: [Admin],
  controllers: [AdminController],
})
export class AdminModule {}
