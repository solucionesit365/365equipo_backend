import { Module } from "@nestjs/common";
import { culture365Controller } from "./culture365.controller";
import { culture365Class } from "./culture365.class";
import { culture365Mongo } from "./culture365.mongodb";

@Module({
  imports: [],
  controllers: [culture365Controller],
  providers: [culture365Class, culture365Mongo],
})
export class Culture365Module {}
