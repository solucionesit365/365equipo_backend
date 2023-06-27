import {
    Controller,
    Post,
    UseGuards,
    Headers,
    Body,
    Get,
    Query,
} from '@nestjs/common';
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";
import { AuditoriasInterface } from "./auditorias.interface"
import { Auditorias } from './auditorias.class';


@Controller('auditorias')
export class AuditoriasController {
    constructor(
        private readonly authInstance: AuthService,
        private readonly tokenService: TokenService,
        private readonly auditoriaInstance: Auditorias,
    ) { }

    @Post("nuevaAuditoria")
    @UseGuards(AuthGuard)
    async nuevaIncidencia(@Headers("authorization") authHeader: string,
        @Body() auditoria: AuditoriasInterface) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            return {
                ok: true,
                data: await this.auditoriaInstance.nuevaAuditoria(auditoria)
            };

        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getAuditorias")
    @UseGuards(AuthGuard)
    async getAuditorias(@Headers("authorization") authHeader: string) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            const respAuditoria = await this.auditoriaInstance.getAuditorias();
            if (respAuditoria) return { ok: true, data: respAuditoria };
            else throw Error("No se ha encontrado ninguna auditoria");
        } catch (error) {
            console.log(error);
        }
    }


}
