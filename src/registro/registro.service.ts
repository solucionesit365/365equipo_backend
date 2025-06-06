import { Injectable } from "@nestjs/common";
import { ITrabajadorRepository } from "../trabajador/trabajador.interface";
import { DateTime } from "luxon";
import { IFirebaseService } from "../firebase/firebase.interface";
import { EmailService } from "../email/email.class";

@Injectable()
export class RegistroService {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    private readonly firebaseService: IFirebaseService,
    private readonly emailInstance: EmailService,
  ) {}

  async registrarUsuario(dni: string, password: string) {
    dni = dni.trim().toUpperCase();
    const datosUsuario = await this.trabajadorRepository.getTrabajadorByDni(
      dni,
    );

    if (!DateTime.fromJSDate(datosUsuario.contratos[0]?.inicioContrato).isValid)
      throw Error("Fecha de inicio de contrato incorrecta");

    const arrayEmails = datosUsuario.emails.split(";");

    if (!datosUsuario.telefonos)
      throw Error("Teléfono no registrado en la ficha");

    if (!arrayEmails[0].trim()) throw Error("Email no registrado en la ficha");

    const usuarioCreado = await this.firebaseService.getAuth().createUser({
      email: arrayEmails[0].trim(),
      emailVerified: false,
      phoneNumber: "+34" + datosUsuario.telefonos,
      password: password,
      displayName: datosUsuario.displayName,
      disabled: false,
    });

    await this.trabajadorRepository.updateTrabajador(datosUsuario.id, {
      idApp: usuarioCreado.uid,
    });

    const link = await this.firebaseService
      .getAuth()
      .generateEmailVerificationLink(usuarioCreado.email);
    const body = ` Haz click en el siguiente enlace para verificar tu email:<br>
          ${link}
        `;

    await this.emailInstance.enviarEmail(
      usuarioCreado.email,
      body,
      "365 Equipo - Verificar email",
    );

    return arrayEmails[0].trim();
  }
}
