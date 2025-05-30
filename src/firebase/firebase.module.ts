import { Global, Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { IFirebaseService } from "./firebase.interface";

@Global()
@Module({
  providers: [{ provide: IFirebaseService, useClass: FirebaseService }],
  exports: [IFirebaseService],
})
export class FirebaseModule {}
