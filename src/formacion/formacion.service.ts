import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  CompartirFormacionDto,
  CompartirFormacionManualDto,
  CompartirFormacionInvitadoDto,
  CompletarFormacionInvitadoDto,
  CreateFormacionDto,
  GetFormacionesDto,
  GetFormacionInvitadoDto,
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

  async completarFormacion(req: { trabajadorId: number; formacionId: string }) {
    try {
      const { trabajadorId, formacionId } = req;

      // Verificar que la formación existe
      const formacion = await this.prisma.formacion.findUnique({
        where: { id: formacionId },
      });

      if (!formacion) {
        throw new NotFoundException(
          `Formación con id ${formacionId} no encontrada`,
        );
      }

      // Crear o actualizar el registro de completitud
      const formacionCompletada = await this.prisma.formacionCompletada.upsert({
        where: {
          trabajadorId_formacionId: {
            trabajadorId,
            formacionId,
          },
        },
        update: {
          completedAt: new Date(),
        },
        create: {
          trabajadorId,
          formacionId,
        },
      });

      return {
        ok: true,
        message: "Formación completada exitosamente",
        data: formacionCompletada,
      };
    } catch (error) {
      console.error("Error al completar formación:", error);
      throw new InternalServerErrorException("Error al completar la formación");
    }
  }

  async getFormacionesCompletadas() {
    try {
      // Obtener formaciones completadas por trabajadores registrados
      const formacionesCompletadas =
        await this.prisma.formacionCompletada.findMany({
          include: {
            formacion: {
              include: {
                pasos: true, // Incluir los pasos de la formación
              },
            },
            trabajador: {
              select: {
                id: true,
                nombreApellidos: true,
                displayName: true,
                emails: true,
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        });

      // Obtener formaciones completadas por invitados
      const formacionesCompletadasInvitados =
        await this.prisma.formacionCompletadaInvitado.findMany({
          include: {
            invitado: {
              include: {
                formacion: {
                  include: {
                    pasos: true, // Incluir los pasos de la formación
                  },
                },
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        });

      // Agrupar por formación combinando ambos tipos
      const agrupadasPorFormacion: Record<string, any> = {};

      // Procesar completados por trabajadores registrados
      formacionesCompletadas.forEach((item) => {
        if (!agrupadasPorFormacion[item.formacionId]) {
          agrupadasPorFormacion[item.formacionId] = {
            formacion: item.formacion,
            completados: [],
          };
        }
        agrupadasPorFormacion[item.formacionId].completados.push({
          tipo: "trabajador",
          trabajadorId: item.trabajadorId,
          trabajadorNombre:
            item.trabajador.nombreApellidos || item.trabajador.displayName,
          trabajadorEmail: item.trabajador.emails,
          completedAt: item.completedAt,
        });
      });

      // Procesar completados por invitados
      formacionesCompletadasInvitados.forEach((item) => {
        const formacionId = item.invitado.formacionId;
        if (!agrupadasPorFormacion[formacionId]) {
          agrupadasPorFormacion[formacionId] = {
            formacion: item.invitado.formacion,
            completados: [],
          };
        }
        agrupadasPorFormacion[formacionId].completados.push({
          tipo: "invitado",
          invitadoId: item.invitadoId,
          trabajadorNombre: item.invitado.nombreCompleto,
          trabajadorEmail: item.invitado.email,
          completedAt: item.completedAt,
        });
      });

      // Obtener los cuestionarios con sus preguntas para cada formación
      const formacionesConPreguntas = await Promise.all(
        Object.values(agrupadasPorFormacion).map(async (item: any) => {
          // Obtener los IDs de los cuestionarios de los pasos tipo CUESTIONARIO
          const cuestionarioIds = item.formacion.pasos
            .filter((paso: any) => paso.type === "CUESTIONARIO")
            .map((paso: any) => paso.resourceId);

          // Si hay cuestionarios, obtener las preguntas
          let cuestionarios = [];
          if (cuestionarioIds.length > 0) {
            cuestionarios = await this.prisma.questionnaire.findMany({
              where: {
                id: {
                  in: cuestionarioIds,
                },
              },
              include: {
                questions: {
                  include: {
                    options: true, // Incluir las opciones de respuesta
                  },
                },
              },
            });
          }

          // Añadir los cuestionarios a la formación
          return {
            ...item,
            formacion: {
              ...item.formacion,
              cuestionarios, // Añadir los cuestionarios con sus preguntas
            },
          };
        }),
      );

      return {
        ok: true,
        data: formacionesConPreguntas,
      };
    } catch (error) {
      console.error("Error al obtener formaciones completadas:", error);
      throw new InternalServerErrorException(
        "Error al obtener las formaciones completadas",
      );
    }
  }

  async compartirFormacionInvitado(
    data: CompartirFormacionInvitadoDto,
    invitadoPorId: number,
  ) {
    try {
      const { formacionId, nombreCompleto, email, dni, telefono } = data;

      // Verificar que la formación existe
      const formacion = await this.getFormacionById({ id: formacionId });
      if (!formacion) {
        throw new NotFoundException("Formación no encontrada");
      }

      // Crear el invitado con token único
      const invitado = await this.prisma.formacionInvitado.create({
        data: {
          formacionId,
          nombreCompleto,
          email,
          dni,
          telefono,
          invitadoPorId,
        },
      });

      // Generar URL con token
      const baseURL = process.env.FRONTEND_URL || "https://365equipo.com";
      const invitadoUrl = `${baseURL}/realizarFormacion/invitado/${invitado.token}`;

      // Enviar email con el enlace
      const mensaje = this.generarMensajeFormacionInvitado(
        nombreCompleto,
        formacion,
        invitadoUrl,
      );
      const emailHtml = this.emailService.generarEmailTemplate(
        nombreCompleto,
        mensaje,
      );

      await this.emailService.enviarEmail(
        email,
        emailHtml,
        `📚 Nueva formación asignada: ${formacion.name}`,
      );

      return {
        ok: true,
        mensaje: "Invitación enviada correctamente",
        token: invitado.token,
        url: invitadoUrl,
      };
    } catch (error) {
      console.error("Error al compartir formación con invitado:", error);
      throw new InternalServerErrorException("Error al compartir la formación");
    }
  }

  private generarMensajeFormacionInvitado(
    nombreTrabajador: string,
    formacion: any,
    url: string,
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
          <a href="${url}"
             style="display: inline-block;
                    background-color: #3498db;
                    color: #ffffff;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Comenzar Formación
          </a>
        </div>

        <div style="background-color: #ffffff;
                    padding: 15px;
                    border-radius: 6px;
                    margin-top: 20px;
                    border: 1px solid #e1e8ed;">
          <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
            <strong>Nota importante:</strong> Este enlace es personal e intransferible.
            Úsalo para acceder a tu formación.
          </p>
        </div>
      </div>
    `;
  }

  async getFormacionInvitado(data: GetFormacionInvitadoDto) {
    try {
      const invitado = await this.prisma.formacionInvitado.findUnique({
        where: { token: data.token },
        include: {
          formacion: {
            include: {
              pasos: true,
            },
          },
          completadas: true,
        },
      });

      if (!invitado) {
        throw new NotFoundException(
          "Invitación no encontrada o token inválido",
        );
      }

      return {
        ok: true,
        invitado: {
          nombreCompleto: invitado.nombreCompleto,
          email: invitado.email,
          formacion: invitado.formacion,
          yaCompletada: invitado.completadas.length > 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error al obtener formación de invitado:", error);
      throw new InternalServerErrorException("Error al obtener la formación");
    }
  }

  async completarFormacionInvitado(data: CompletarFormacionInvitadoDto) {
    try {
      const invitado = await this.prisma.formacionInvitado.findUnique({
        where: { token: data.token },
        include: {
          formacion: true,
        },
      });

      if (!invitado) {
        throw new NotFoundException(
          "Invitación no encontrada o token inválido",
        );
      }

      // Crear registro de completitud
      const completada = await this.prisma.formacionCompletadaInvitado.create({
        data: {
          invitadoId: invitado.id,
        },
      });

      return {
        ok: true,
        mensaje: "Formación completada exitosamente",
        data: completada,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("Error al completar formación de invitado:", error);
      throw new InternalServerErrorException("Error al completar la formación");
    }
  }
}
