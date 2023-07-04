import { Injectable } from "@nestjs/common";
import { VerificacionMFA } from "./verificacionmfa.interface";
import { VerifiacacionDatabase } from "./verificacionmfa.mongodb";

@Injectable()
export class VerificacionClass {
    constructor(
        private readonly schVerificacion: VerifiacacionDatabase) { }

    async nuevaVerificacionMFA(verificacion: VerificacionMFA) {
        return await this.schVerificacion.nuevaVerificacionMFA(verificacion);

    }

    async verificacionMFA(uid: string, utilizado: boolean) {
        return await this.schVerificacion.verificacionMFA(uid, utilizado)
    }

    async deleteVerificacionMFA(_id: string) {
        return await this.schVerificacion.deleteVerificacionMFA(_id);
    }
}