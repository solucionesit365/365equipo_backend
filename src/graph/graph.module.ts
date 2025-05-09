import { Module } from "@nestjs/common";
import { GraphService } from "./graph.service";
import { GraphController } from './graph.controller';

@Module({
  providers: [GraphService],
  exports: [GraphService],
  controllers: [GraphController],
})
export class GraphModule {}
