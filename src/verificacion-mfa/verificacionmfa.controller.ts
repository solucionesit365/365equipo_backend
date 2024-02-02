import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
  Query,
  VersioningType,
} from "@nestjs/common";
import { VerificacionMFA } from "./verificacionmfa.interface";
import { VerificacionClass } from "./verificacionmfa.class";
import { AuthGuard } from "../guards/auth.guard";
import { EmailClass } from "src/email/email.class";
import { FirebaseService } from "../firebase/firebase.service";

@Controller("verificacionmfa")
export class VerificacionmfaController {
  constructor(
    private readonly verificacionInstance: VerificacionClass,
    private readonly authInstance: FirebaseService,
    private readonly email: EmailClass,
  ) {}

  @Post("nuevaVerificacionMFA")
  @UseGuards(AuthGuard)
  async nuevaVerificacionMFA(
    @Headers("authorization") authHeader: string,
    @Body() verificacion: VerificacionMFA,
  ) {
    try {
      const usuario = await this.authInstance.getUserByUid(verificacion.uid);
      this.email.enviarEmail(
        usuario.email,
        `Utiliza este codigo para poder ver tu perfil: ${verificacion.codigo}`,
        "Tu codigo de Verificación",
      );
      return {
        ok: true,
        data: await this.verificacionInstance.nuevaVerificacionMFA(
          verificacion,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("getVerificacionMFA")
  @UseGuards(AuthGuard)
  async verificacionMFA(
    @Query() { uid, utilizado }: { uid: string; utilizado: string },
  ) {
    try {
      const bol = utilizado == "true" ? true : false;

      const respVerificacion = await this.verificacionInstance.verificacionMFA(
        uid,
        bol,
      );
      return {
        ok: true,
        data: respVerificacion,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("deleteVerificacionMFA")
  async deleteVerificacionMFA(@Body() { _id }: { _id: string }) {
    try {
      console.log(_id);
      if (await this.verificacionInstance.deleteVerificacionMFA(_id))
        return {
          ok: true,
        };

      throw Error("No se ha podido borrar la verificacion");
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }
}
