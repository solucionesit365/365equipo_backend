import { Global, Module } from "@nestjs/common";
import { MongoService } from "./mongo.service";
import { IMongoService } from "./mongo.interface";

@Global()
@Module({
  providers: [MongoService, { provide: IMongoService, useClass: MongoService }],
  exports: [IMongoService, MongoService],
})
export class MongoModule {}
