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
import { AuditoriasInterface, AuditoriaRespuestas } from "./auditorias.interface"
import { Auditorias } from './auditorias.class';
import { query } from 'mssql';


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


    @Post("updateHabilitarAuditoria")
    async updateHabilitarAuditoria(
        @Body() auditoria: AuditoriasInterface,
        @Headers("authorization") authHeader: string,
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respAuditoria = await this.auditoriaInstance.updateHabilitarAuditoria(auditoria);
            if (respAuditoria)
                return {
                    ok: true,
                    data: respAuditoria
                };
            console.log(respAuditoria);

            throw Error("No se ha podido habilitar la auditoria");
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Post("updateDeshabilitarAuditoria")
    async updateDeshabilitarAuditoria(
        @Body() auditoria: AuditoriasInterface,
        @Headers("authorization") authHeader: string,
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respAuditoria = await this.auditoriaInstance.updateDeshabilitarAuditoria(auditoria);
            if (respAuditoria)
                return {
                    ok: true,
                    data: respAuditoria
                };
            console.log(respAuditoria);

            throw Error("No se ha podido deshabilitar la auditoria");
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Post("respuestasAuditorias")
    @UseGuards(AuthGuard)
    async respuestasAuditorias(@Headers("authorization") authHeader: string,
        @Body() auditoria: AuditoriaRespuestas) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            return {
                ok: true,
                data: await this.auditoriaInstance.respuestasAuditorias(auditoria)
            };

        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getRespuestaAuditorias")
    @UseGuards(AuthGuard)
    async getRespuestaAuditoria(@Headers("authorization") authHeader: string,
        @Body("id") id) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            return {
                ok: true,
                data: await this.auditoriaInstance.getRespuestasAuditorias(id)
            };
        } catch (error) {
            console.log(error);
            return { ok: false, message: error.message };
        }
    }

}
