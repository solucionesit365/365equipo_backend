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
import { Incidencia } from "./incidencias.class";
import { Incidencias } from './incidencias.interface';

@Controller('incidencias')
export class IncidenciasController {
    constructor(
        private readonly authInstance: AuthService,
        private readonly tokenService: TokenService,
        private readonly incidenciaInstance: Incidencia,
    ) { }

    @Post("nuevaIncidencia")
    @UseGuards(AuthGuard)
    async nuevaIncidencia(@Headers("authorization") authHeader: string,
        @Body() incidencia: Incidencias) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            return {
                ok: true,
                data: await this.incidenciaInstance.nuevaIncidencia(incidencia)
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidencias")
    @UseGuards(AuthGuard)
    async getIncidencias(@Headers("authorization") authHeader: string) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidencias();
            if (respIncidencias) return { ok: true, data: respIncidencias };
            else throw Error("No se ha encontrado ninguna ausencia");
        } catch (error) {
            console.log(error);
        }
    }

    @Get("getIncidenciasEstado")
    @UseGuards(AuthGuard)
    async getIncidenciasEstado(
        @Headers("authorization") authHeader: string,
        @Query() { estado }: { estado: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByEstado(estado)
            return {
                ok: true,
                data: respIncidencias,
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidenciasByCategoria")
    @UseGuards(AuthGuard)
    async getIncidenciasByCategoria(
        @Headers("authorization") authHeader: string,
        @Query() { categoria }: { categoria: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByCategoria(categoria)
            return {
                ok: true,
                data: respIncidencias,
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidenciasByPrioridad")
    @UseGuards(AuthGuard)
    async getIncidenciasByPrioridad(
        @Headers("authorization") authHeader: string,
        @Query() { prioridad }: { prioridad: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByPrioridad(prioridad)

            return {
                ok: true,
                data: respIncidencias,
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Post("updateIncidenciaEstado")
    async updateIncidenciaEstado(
        @Headers("authorization") authHeader: string,
        @Body() incidencia: Incidencias
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            return {
                ok: true,
                data: await this.incidenciaInstance.updateIncidenciaEstado(
                    incidencia
                ),
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    // updateIncidenciaMensajes

    @Post("updateIncidenciaMensajes")
    async updateIncidenciaMensajes(
        @Headers("authorization") authHeader: string,
        @Body() incidencia: Incidencias
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            return {
                ok: true,
                data: await this.incidenciaInstance.updateIncidenciaMensajes(
                    incidencia
                ),
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidenciasByUid")
    @UseGuards(AuthGuard)
    async getIncidenciasByUid(
        @Headers("authorization") authHeader: string,
        @Query() { uid }: { uid: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByUid(uid)

            return {
                ok: true,
                data: respIncidencias,
            };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }




}
