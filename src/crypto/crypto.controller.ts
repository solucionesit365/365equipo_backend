import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../guards/auth.guard";
import { CryptoService } from "./crypto.class";

@Controller("crypto")
export class CryptoController {
  constructor(private readonly cryptoInstance: CryptoService) {}
}
