import { Global, Module } from "@nestjs/common";
import { MongoService } from "./mongo.service";
import { IMongoService } from "./mongo.interface";

@Global()
@Module({
  providers: [{ provide: IMongoService, useClass: MongoService }],
  exports: [MongoService],
})
export class MongoModule {}
