import { Global, Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from "./firebase.controller";
import { IFirebaseService } from "./firebase.interface";

@Global()
@Module({
  providers: [{ provide: IFirebaseService, useClass: FirebaseService }],
  exports: [IFirebaseService],
  controllers: [FirebaseController],
})
export class FirebaseModule {}
