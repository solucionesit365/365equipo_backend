import {
    Body,
    Controller,
    Post,
    UseGuards,
    Headers,
    Get,
    Query,
} from '@nestjs/common';
import { CalendarioFestivo } from './calendario-festivos.class';
import { CalendarioFestivosInterface } from './calendario-festivos.interface';
import { AuthGuard } from "../auth/auth.guard";
import { TokenService } from "../get-token/get-token.service";
import { AuthService } from "../firebase/auth";

@Controller('calendario-festivos')
export class CalendarioFestivosController {
    constructor(
        private readonly calendarioFestivosInstance: CalendarioFestivo,
        private readonly authInstance: AuthService,
        private readonly tokenService: TokenService,) { }


    @Post("nuevoFestivo")
    @UseGuards(AuthGuard)
    async nuevaIncidencia(@Headers("authorization") authHeader: string,
        @Body() festivo: CalendarioFestivosInterface) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            return {
                ok: true,
                data: await this.calendarioFestivosInstance.nuevoFestivo(festivo)
            };

        } catch (err) {
            console.log(err);
            return { ok: false, message: err.message };
        }
    }

    @Get("getFestivos")
    @UseGuards(AuthGuard)
    async getAuditorias(@Headers("authorization") authHeader: string) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            const respCalendario = await this.calendarioFestivosInstance.getfestivos();
            if (respCalendario) return { ok: true, data: respCalendario };
            else throw Error("No se ha encontrado ningun festivo");
        } catch (error) {
            console.log(error);
        }
    }


    @Get("getFestivosByTienda")
    @UseGuards(AuthGuard)
    async getFestivosByTienda(@Headers("authorization") authHeader: string,
        @Query() { tienda }: { tienda: number }) {
        try {
            const token = this.tokenService.extract(authHeader);
            await this.authInstance.verifyToken(token);

            const respCalendario = await this.calendarioFestivosInstance.getfestivosByTienda(Number(tienda));
            console.log(respCalendario);
            if (respCalendario) return { ok: true, data: respCalendario };


            else throw Error("No se ha encontrado ningun festivo por tienda ");
        } catch (error) {
            console.log(error);
        }
    }




}
