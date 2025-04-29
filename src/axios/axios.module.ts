import { Global, Module } from "@nestjs/common";
import { AxiosBcService } from "./axios-bc.service";

@Global()
@Module({
  providers: [AxiosBcService],
  exports: [AxiosBcService],
})
export class AxiosModule {}
