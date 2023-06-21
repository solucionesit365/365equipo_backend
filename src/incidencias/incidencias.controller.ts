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
import { Notificaciones } from "src/notificaciones/notificaciones.class";
import { Trabajador } from "../trabajadores/trabajadores.class";

@Controller('incidencias')
export class IncidenciasController {
    constructor(
        private readonly authInstance: AuthService,
        private readonly tokenService: TokenService,
        private readonly incidenciaInstance: Incidencia,
        private readonly notificaciones: Notificaciones,
        private readonly trabajadores: Trabajador,
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
    async getIncidencia(@Headers("authorization") authHeader: string) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidencias();
            if (respIncidencias) {
                // Filtrar las incidencias por destinatario
                const filteredIncidencias = respIncidencias.filter(incidencia =>
                    incidencia.destinatario === "tecnicos"
                );
                return { ok: true, data: filteredIncidencias };
            } else {
                throw Error("No se ha encontrado ninguna incidencia");
            }
        } catch (error) {
            console.log(error);
        }
    }


    @Get("getIncidenciasRrhh")
    @UseGuards(AuthGuard)
    async getIncidenciasRrhh(@Headers("authorization") authHeader: string) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidencias();
            if (respIncidencias) {
                // Filtrar las incidencias por destinatario
                const filteredIncidencias = respIncidencias.filter(incidencia =>
                    incidencia.destinatario === "rrhh"
                );
                return { ok: true, data: filteredIncidencias };
            } else {
                throw Error("No se ha encontrado ninguna incidencia");
            }
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
            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "tecnicos"
            );
            return { ok: true, data: filteredIncidencias };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidenciasEstadoRrhh")
    @UseGuards(AuthGuard)
    async getIncidenciasEstadoRrhh(
        @Headers("authorization") authHeader: string,
        @Query() { estado }: { estado: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasEstadoRrhh(estado)
            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "rrhh"
            );
            return { ok: true, data: filteredIncidencias };
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
            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "tecnicos"
            );
            return { ok: true, data: filteredIncidencias };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }


    @Get("getIncidenciasByCategoriaRrhh")
    @UseGuards(AuthGuard)
    async getIncidenciasByCategoriaRrhh(
        @Headers("authorization") authHeader: string,
        @Query() { categoria }: { categoria: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByCategoriaRrhh(categoria)
            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "rrhh"
            );
            return { ok: true, data: filteredIncidencias };
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
            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "tecnicos"
            );
            return { ok: true, data: filteredIncidencias };
        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getIncidenciasByPrioridadRrhh")
    @UseGuards(AuthGuard)
    async getIncidenciasByPrioridadRrhh(
        @Headers("authorization") authHeader: string,
        @Query() { prioridad }: { prioridad: string },
    ) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);
            const respIncidencias = await this.incidenciaInstance.getIncidenciasByPrioridadRrhh(prioridad)

            // Filtrar las incidencias por destinatario
            const filteredIncidencias = respIncidencias.filter(incidencia =>
                incidencia.destinatario === "rrhh"
            );
            return { ok: true, data: filteredIncidencias };
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

            if (await this.incidenciaInstance.updateIncidenciaEstado(
                incidencia)) {
                const arrayTrabajador = await this.trabajadores.getTrabajadorByAppId(incidencia.uid)
                if (arrayTrabajador.idApp != null) {
                    this.notificaciones.newInAppNotification({
                        uid: arrayTrabajador.idApp,
                        titulo: "Estado de la incidencia",
                        mensaje: `El estado de tu incidencia a cambiado a ${incidencia.estado}`,
                        leido: false,
                        creador: "SISTEMA",
                    })
                }

                return {
                    ok: true,
                }
            }
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
            if (await this.incidenciaInstance.updateIncidenciaMensajes(
                incidencia)) {
                const arrayTrabajador = await this.trabajadores.getTrabajadorByAppId(incidencia.uid)
                if (arrayTrabajador.idApp != null) {
                    this.notificaciones.newInAppNotification({
                        uid: arrayTrabajador.idApp,
                        titulo: "Mensaje Incidencia",
                        mensaje: "Te han respondido la incidencia",
                        leido: false,
                        creador: "SISTEMA",
                    })
                }


                return {
                    ok: true,
                }
            }
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
