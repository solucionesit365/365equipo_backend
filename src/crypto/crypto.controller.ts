import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";

@Controller("crypto")
export class CryptoController {
    @Post("encriptar")
    @UseGuards(AuthGuard)
    async encriptar(@Body() {  }) {

    }
}
