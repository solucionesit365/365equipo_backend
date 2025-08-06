import { Injectable } from "@nestjs/common";
import { IGenerarParesFichajeUseCase } from "./IGenerarParesFichaje.use-case";
import { DateTime } from "luxon";
import { IFichajeRepository } from "../../fichajes-bc/repository/IFichaje.repository";
import { FichajeDto } from "../../fichajes-bc/fichajes.interface";
import { ObjectId, WithId } from "mongodb";

// Interfaz para los pares de fichaje generados
export interface ParFichajeGenerado {
  entrada: FichajeDto;
  salida: FichajeDto;
  cuadrante?: any; // TODO: definir tipo correcto cuando se implemente
}

@Injectable()
export class GenerarParesFichajeUseCase implements IGenerarParesFichajeUseCase {
  constructor(private readonly fichajeRepository: IFichajeRepository) {}

  async execute(): Promise<ParFichajeGenerado[]> {
    // 1. Obtener hoy al inicio del día o más antiguos (máximo 2 días)
    const hoy = DateTime.now().startOf("day");
    const haceDosDias = hoy.minus({ days: 2 });

    const fichajesSimples = await this.fichajeRepository.getFichajes(
      hoy,
      haceDosDias,
    );

    // 2. Agrupar fichajes por trabajador
    const fichajesPorTrabajador = this.agruparPorTrabajador(fichajesSimples);
    
    // 3. Generar pares para cada trabajador
    const todosLosPares: ParFichajeGenerado[] = [];
    
    for (const [idTrabajador, fichajes] of fichajesPorTrabajador) {
      const pares = this.crearParesDeFichajes(fichajes);
      todosLosPares.push(...pares);
    }
    
    return todosLosPares;
  }

  private agruparPorTrabajador(fichajes: FichajeDto[]): Map<number, FichajeDto[]> {
    const grupos = new Map<number, FichajeDto[]>();
    
    for (const fichaje of fichajes) {
      const id = fichaje.idTrabajador || fichaje.idExterno;
      if (!grupos.has(id)) {
        grupos.set(id, []);
      }
      grupos.get(id)!.push(fichaje);
    }
    
    // Ordenar cada grupo por hora cronológicamente
    for (const [id, fichajesTrabajador] of grupos) {
      fichajesTrabajador.sort((a, b) => a.hora.getTime() - b.hora.getTime());
    }
    
    return grupos;
  }

  private crearParesDeFichajes(fichajes: FichajeDto[]): ParFichajeGenerado[] {
    const pares: ParFichajeGenerado[] = [];
    let i = 0;
    
    while (i < fichajes.length) {
      const fichajeActual = fichajes[i];
      
      // Si encontramos una entrada, buscar su salida correspondiente
      if (fichajeActual.tipo === "ENTRADA") {
        let salidaEncontrada: FichajeDto | null = null;
        let j = i + 1;
        
        // Buscar la siguiente salida (puede ser en el mismo día o días posteriores)
        while (j < fichajes.length) {
          if (fichajes[j].tipo === "SALIDA") {
            const horaEntrada = DateTime.fromJSDate(fichajeActual.hora);
            const horaSalida = DateTime.fromJSDate(fichajes[j].hora);
            
            // Verificar que la salida sea posterior a la entrada
            if (horaSalida > horaEntrada) {
              // Limitar a un máximo de 24 horas entre entrada y salida
              const diferencia = horaSalida.diff(horaEntrada, 'hours').hours;
              if (diferencia <= 24) {
                salidaEncontrada = fichajes[j];
                // Marcar la salida como usada removiéndola del array
                fichajes.splice(j, 1);
                break;
              }
            }
          }
          j++;
        }
        
        // Si encontramos una salida válida, crear el par
        if (salidaEncontrada) {
          pares.push({
            entrada: fichajeActual,
            salida: salidaEncontrada,
            // cuadrante se puede agregar más adelante si es necesario
          });
        }
        // Si no hay salida, la entrada queda huérfana (podrías manejar esto más adelante)
      }
      
      i++;
    }
    
    return pares;
  }
}
