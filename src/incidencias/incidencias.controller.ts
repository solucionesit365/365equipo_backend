import {
    Controller,
    Post,
    UseGuards,
    Headers,
    Body,
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
}
