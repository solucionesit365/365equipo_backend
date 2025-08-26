import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { RevisionMedicaDto } from "./revision-medica.dto";
import { AuthGuard } from "../guards/auth.guard";
import { EmailService } from "../email/email.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { ParametrosService } from "src/parametros/parametros.service";
import { RevisionMedicaDatabase } from "./revision-medica.database";
import { DateTime } from "luxon";

@Controller("revision-medica")
export class RevisionMedicaController {
  constructor(
    private readonly parametrosDb: ParametrosService,
    private readonly emailService: EmailService,
    private readonly trabajadores: TrabajadorService,
    private readonly revisionDb: RevisionMedicaDatabase,
  ) {}

  @UseGuards(AuthGuard)
  @Post("solicitar")
  async solicitarRevision(@Body() data: RevisionMedicaDto) {
    const campania = await this.parametrosDb.getParametrosCampaniaMedica();

    if (!campania?.campañaMedica) {
      return { ok: false, message: "No hay campaña activa configurada." };
    }

    const cfg = campania.campañaMedica;

    if (
      !cfg.fechaFinalRevision ||
      new Date(cfg.fechaFinalRevision) < new Date()
    ) {
      return { ok: false, message: "La campaña ya ha finalizado." };
    }

    const trabajador = await this.trabajadores.getTrabajadorBySqlId(
      Number(data.trabajadorId),
    );

    const destinatarios = [
      cfg.correoCentroMedico,
      cfg.OtroCorreo,
      // trabajador?.responsable?.emails,
    ]
      .filter(Boolean)
      .join(","); // 👈 todos en un único correo

    // Normalizar y formatear la fecha
    const fechaLegible = new Date(data.fechaPreferencia);
    const fechaFormateada = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(fechaLegible);

    const html = this.emailService.generarEmailTemplateRevisionMedica(
      trabajador?.nombreApellidos || "Trabajador",
      data.telefono,
      fechaFormateada,
    );

    await this.emailService.enviarEmail(
      destinatarios,
      html,
      "Solicitud de revisión médica",
    );
    // ✅ Guardar en Mongo
    await this.revisionDb.guardarSolicitud({
      nombreTrabajador: trabajador?.nombreApellidos || "Trabajador",
      telefono: data.telefono,
      fechaPreferencia: fechaLegible,
      fechaSolicitud: DateTime.now().toJSDate(),
      trabajadorId: Number(data.trabajadorId),
    });

    return { ok: true, message: "Solicitud enviada correctamente." };
  }

  @UseGuards(AuthGuard)
  @Get("getSolicitudes")
  async getSolicitudes() {
    return this.revisionDb.getSolicitudes();
  }
}
