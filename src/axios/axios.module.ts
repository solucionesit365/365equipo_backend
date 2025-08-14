import { Global, Module } from "@nestjs/common";
import { AxiosBcService } from "./axios-bc.service";
import { AxiosBcHitService } from "./axios-bc.hit.service";

@Global()
@Module({
  providers: [AxiosBcService, AxiosBcHitService],
  exports: [AxiosBcService, AxiosBcHitService],
})
export class AxiosModule {}
