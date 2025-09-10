import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {
  IUpdateTrabajadorUseCase,
  IUpdateTrabajadorDto,
} from "./interfaces/IUpdateTrabajador.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { Trabajador } from "@prisma/client";
import { IContratoRepository } from "../../contrato/repository/interfaces/IContrato.repository";

@Injectable()
export class UpdateTrabajadorUseCase implements IUpdateTrabajadorUseCase {
  constructor(
    private readonly trabajadorRepository: ITrabajadorRepository,
    @Inject(forwardRef(() => IContratoRepository))
    private readonly contratoRepository: IContratoRepository,
  ) {}

  async execute(trabajadores: IUpdateTrabajadorDto[]): Promise<Trabajador[]> {
    const trabajadoresActualizados: Trabajador[] = [];

    for (const trabajador of trabajadores) {
      const { id, ...datosActualizar } = trabajador;

      // Hay que obtener el id del contrato para poder actualizar los datos de esa colección
      // Desde Business Central se utiliza solo el último contrato. Deja de tener sentido el get horas de contrato con parámetro fecha.
      const contrato = await this.contratoRepository.findByTrabajadorId(id);
      await this.contratoRepository.update(contrato[0].id, {
        horasContrato: this.convertirHorasSemanalesAPorcentaje(
          trabajador.horasContrato,
        ),
        inicioContrato: trabajador.inicioContrato,
        finalContrato: trabajador.finalContrato,
        fechaAlta: trabajador.fechaAlta,
        fechaAntiguedad: trabajador.fechaAntiguedad,
      });

      // Eliminar las propiedades sobrantes para no intentar insertarlas en prisma
      delete datosActualizar.horasContrato;
      delete datosActualizar.inicioContrato;
      delete datosActualizar.finalContrato;
      delete datosActualizar.fechaAlta;
      delete datosActualizar.fechaAntiguedad;

      const trabajadorActualizado = await this.trabajadorRepository.updateOne(
        id,
        datosActualizar,
      );

      trabajadoresActualizados.push(trabajadorActualizado);
    }

    return trabajadoresActualizados;
  }

  async executeOne(trabajador: IUpdateTrabajadorDto): Promise<Trabajador> {
    const { id, ...datosActualizar } = trabajador;

    const trabajadorActualizado = await this.trabajadorRepository.updateOne(
      id,
      datosActualizar,
    );

    return trabajadorActualizado;
  }

  private convertirHorasSemanalesAPorcentaje(horas: number) {
    const jornadaCompleta = 40; // Definir la jornada completa como 40 horas semanales
    if (horas >= jornadaCompleta) return 100;
    return Math.round((horas / jornadaCompleta) * 100);
  }
}
