import { Module } from "@nestjs/common";
import { Cultura365Controller } from "./cultura365.controller";
import { cultura365Class } from "./cultura365.class";
import { cultura365Mongo } from "./cultura365.mongodb";

@Module({
  imports: [],
  controllers: [Cultura365Controller],
  providers: [cultura365Class, cultura365Mongo],
})
export class Cultura365Module {}
