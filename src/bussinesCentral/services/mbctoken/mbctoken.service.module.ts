import { Module } from "@nestjs/common";
import { MbctokenService } from "./mbctoken.service";

@Module({
  providers: [MbctokenService],
  exports: [MbctokenService],
})
export class MBCTokenModule {}
