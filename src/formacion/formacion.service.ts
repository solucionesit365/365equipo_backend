import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  CompartirFormacionDto,
  CompartirFormacionManualDto,
  CreateFormacionDto,
  GetFormacionesDto,
  UpdateFormacionDto,
} from "./formacion.dto";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.class";

@Injectable()
export class FormacionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private generarMensajeFormacion(
    nombreTrabajador: string,
    formacion: any,
  ): string {
    return `
      <div style="padding: 20px; background-color: #f7f9fc; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Nueva formación asignada</h2>
        
        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
          Estimado/a <strong>${nombreTrabajador}</strong>,
        </p>

        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
          Se te ha asignado una nueva formación que requiere tu atención:
        </p>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3498db;">
          <h3 style="color: #2c3e50; margin: 0 0 10px 0;">${formacion.name}</h3>
          <p style="color: #7f8c8d; margin: 0;">
            Esta formación es importante para tu desarrollo profesional y debe ser completada 
            lo antes posible.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://365equipo.com/realizarFormacion/${formacion.id}" 
             style="display: inline-block; 
                    background-color: #3498db; 
                    color: #ffffff; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: background-color 0.3s ease;">
            Comenzar Formación
          </a>
        </div>

        <div style="background-color: #ffffff; 
                    padding: 15px; 
                    border-radius: 6px; 
                    margin-top: 20px;
                    border: 1px solid #e1e8ed;">
          <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
            <strong>Nota importante:</strong> Esta formación ha sido asignada específicamente 
            para ti. Por favor, asegúrate de completarla en su totalidad.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e8ed;">
          <p style="color: #95a5a6; font-size: 14px; margin: 0;">
            Si tienes alguna dificultad para acceder a la formación, por favor contacta con 
            el departamento de formación.
          </p>
        </div>
      </div>
    `;
  }

  private async enviarEmailFormacion(
    trabajador: { nombreApellidos: string; email: string },
    formacion: any,
  ) {
    try {
      const mensaje = this.generarMensajeFormacion(
        trabajador.nombreApellidos,
        formacion,
      );
      const emailHtml = this.emailService.generarEmailTemplate(
        trabajador.nombreApellidos,
        mensaje,
      );

      await this.emailService.enviarEmail(
        trabajador.email,
        emailHtml,
        `📚 Nueva formación asignada: ${formacion.name}`,
      );

      return {
        success: true,
        trabajador: trabajador.nombreApellidos,
        email: trabajador.email,
      };
    } catch (error) {
      console.error(`Error al enviar email a ${trabajador.email}:`, error);
      return {
        success: false,
        trabajador: trabajador.nombreApellidos,
        email: trabajador.email,
        error: error.message,
      };
    }
  }

  async getFormaciones(req: GetFormacionesDto) {
    try {
      return await this.prisma.formacion.findMany({
        where: {
          department: req.status,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Error al obtener las formaciones",
      );
    }
  }

  async getFormacionById(req: { id: string }) {
    try {
      const formacion = await this.prisma.formacion.findUnique({
        where: {
          id: req.id,
        },
        include: {
          pasos: true,
        },
      });

      if (!formacion) {
        throw new NotFoundException(`Formación con id ${req.id} no encontrada`);
      }

      return formacion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException("Error al obtener la formación");
    }
  }

  async compartirFormacionGrupo(data: CompartirFormacionDto) {
    try {
      const { formacionId, trabajadores } = data;
      const formacion = await this.getFormacionById({ id: formacionId });

      if (!formacion) {
        throw new NotFoundException("Formación no encontrada");
      }

      const resultados = await Promise.all(
        trabajadores.map((trabajador) =>
          this.enviarEmailFormacion(trabajador, formacion),
        ),
      );

      const exitosos = resultados.filter((r) => r.success).length;
      const fallidos = resultados.filter((r) => !r.success).length;

      return {
        mensaje: `Formación compartida: ${exitosos} emails enviados correctamente, ${fallidos} fallos`,
        detalles: resultados,
      };
    } catch (error) {
      console.error("Error al compartir la formación:", error);
      throw new InternalServerErrorException("Error al compartir la formación");
    }
  }

  async compartirFormacionManual(data: CompartirFormacionManualDto) {
    try {
      const { formacionId, trabajador } = data;
      const formacion = await this.getFormacionById({ id: formacionId });

      if (!formacion) {
        throw new NotFoundException("Formación no encontrada");
      }

      const resultado = await this.enviarEmailFormacion(trabajador, formacion);

      return {
        mensaje: resultado.success
          ? "Formación compartida correctamente"
          : "Error al compartir la formación",
        detalle: resultado,
      };
    } catch (error) {
      console.error("Error al compartir la formación:", error);
      throw new InternalServerErrorException("Error al compartir la formación");
    }
  }

  async createFormacion(req: CreateFormacionDto) {
    try {
      const { name, department, description, pasos, nPasos } = req;

      return await this.prisma.formacion.create({
        data: {
          name,
          department,
          description,
          nPasos,
          pasos: {
            create: pasos.map((paso) => ({
              resourceId: paso.resourceId,
              name: paso.name,
              description: paso.description,
              type: paso.type,
            })),
          },
        },
      });
    } catch (error) {
      throw new InternalServerErrorException("Error al crear la formación");
    }
  }

  async deleteFormacion(id: string) {
    try {
      const formacion = await this.prisma.formacion.findUnique({
        where: { id },
      });

      if (!formacion) {
        throw new NotFoundException(`Formación con id ${id} no encontrada`);
      }

      await this.prisma.formacion.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException("Error al eliminar la formación");
    }
  }

  async updateFormacion(updateDto: UpdateFormacionDto) {
    try {
      const existingFormacion = await this.prisma.formacion.findUnique({
        where: { id: updateDto.id },
      });

      if (!existingFormacion) {
        throw new NotFoundException(
          `Formación con id ${updateDto.id} no encontrada`,
        );
      }

      const { pasos, ...formacionData } = updateDto;

      return await this.prisma.formacion.update({
        where: { id: updateDto.id },
        data: {
          department: formacionData.department,
          description: formacionData.description,
          name: formacionData.name,
          nPasos: formacionData.nPasos,
          pasos: pasos
            ? {
                create: pasos.map((paso) => ({
                  resourceId: paso.resourceId,
                  name: paso.name,
                  description: paso.description,
                  type: paso.type,
                })),
              }
            : undefined,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Error al actualizar la formación",
      );
    }
  }
}
