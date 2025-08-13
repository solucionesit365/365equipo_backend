import { Injectable } from "@nestjs/common";
import { AusenciasDatabase } from "./ausencias.mongodb";
import { Cuadrantes } from "../cuadrantes/cuadrantes.class";
import { ObjectId } from "mongodb";
import { TiposAusencia } from "../cuadrantes/cuadrantes.interface";
import { AusenciaInterface } from "./ausencias.interface";
import { DateTime } from "luxon";
import { TrabajadorService } from "../trabajadores/trabajadores.class";

@Injectable()
export class AusenciasService {
  constructor(
    private readonly schAusencias: AusenciasDatabase,
    private readonly cuadrantesInstance: Cuadrantes,
    private readonly trabajadoresInstance: TrabajadorService,
  ) {}

  // Cuadrantes 2.0
  async nuevaAusencia(
    idUsuario: number,
    nombre: string,
    dni: string,
    tipo: TiposAusencia,
    horasContrato: number,
    tienda: string,
    fechaInicio: Date,
    fechaFinal: Date,
    fechaRevision: Date,
    comentario: string,
    completa: boolean,
    horas: number,
  ) {
    return await this.schAusencias.nuevaAusencia({
      idUsuario,
      nombre,
      dni,
      tipo,
      horasContrato,
      tienda,
      fechaInicio,
      fechaFinal,
      fechaRevision,
      comentario,
      completa,
      horas,
    });
  }

  async deleteAusencia(idAusencia: string) {
    // 1. Primero, obten la ausencia que vas a eliminar para poder usar sus propiedades.
    const ausenciaToDelete = await this.schAusencias.getAusenciasById(
      new ObjectId(idAusencia),
    );
    if (!ausenciaToDelete) {
      throw new Error("Ausencia no encontrada");
    }

    // 2. Elimina la ausencia de schAusencias.
    await this.schAusencias.deleteAusencia(idAusencia);

    return true; // Devuelve true o lo que necesites para indicar que la operación fue exitosa.
  }

  // actualiza aunsencias sin fechaRevision
  async updateAusencia(ausencia: AusenciaInterface) {
    const ausenciaToUpdate = await this.schAusencias.getAusenciasById(
      new ObjectId(ausencia._id),
    );
    if (!ausenciaToUpdate) {
      throw new Error("Ausencia no encontrada");
    }

    const fechaFinalToUpdate = ausenciaToUpdate.fechaFinal
      ? ausenciaToUpdate.fechaFinal
      : ausenciaToUpdate.fechaRevision;
    // if (
    //   // Verifica si `fechaInicio` ha cambiado o uno de ellos es `null`
    //   (ausenciaToUpdate.fechaInicio &&
    //     ausencia.fechaInicio &&
    //     ausenciaToUpdate.fechaInicio.getTime() !==
    //       ausencia.fechaInicio.getTime()) ||
    //   (!ausenciaToUpdate.fechaInicio && ausencia.fechaInicio) ||
    //   (ausenciaToUpdate.fechaInicio && !ausencia.fechaInicio) ||
    //   // Verifica si `fechaFinalToUpdate` ha cambiado
    //   (fechaFinalToUpdate &&
    //     ausencia.fechaFinal &&
    //     fechaFinalToUpdate.getTime() !== ausencia.fechaFinal.getTime()) ||
    //   (!fechaFinalToUpdate && ausencia.fechaFinal)
    // ) {
    //   // Si las fechas de la ausencia han cambiado, llama a addAusenciaToCuadrantes
    //   await this.cuadrantesInstance.addAusenciaToCuadrantes(ausencia);
    // }

    await this.schAusencias.updateAusencia(ausencia);

    // Elimina cuadrantes que están fuera del nuevo rango de fechas
    await this.schAusencias.eliminarCuadrantesFueraDeRango(
      ausencia.idUsuario,
      ausencia.fechaInicio,
      ausencia.fechaFinal,
      ausencia.tipo,
    );

    return true;
  }

  async updateAusenciaResto(ausencia: AusenciaInterface) {
    const ausenciaToUpdate = await this.schAusencias.getAusenciasById(
      new ObjectId(ausencia._id),
    );

    if (!ausenciaToUpdate) {
      throw new Error("Ausencia no encontrada");
    }

    const fechaFinalToUpdate = ausenciaToUpdate.fechaFinal
      ? ausenciaToUpdate.fechaFinal
      : ausenciaToUpdate.fechaRevision;

    // if (
    //   // Verifica si `fechaInicio` ha cambiado o uno de ellos es `null`
    //   (ausenciaToUpdate.fechaInicio &&
    //     ausencia.fechaInicio &&
    //     ausenciaToUpdate.fechaInicio.getTime() !==
    //       ausencia.fechaInicio.getTime()) ||
    //   (!ausenciaToUpdate.fechaInicio && ausencia.fechaInicio) ||
    //   (ausenciaToUpdate.fechaInicio && !ausencia.fechaInicio) ||
    //   // Verifica si `fechaFinalToUpdate` ha cambiado
    //   (fechaFinalToUpdate &&
    //     ausencia.fechaFinal &&
    //     fechaFinalToUpdate.getTime() !== ausencia.fechaFinal.getTime()) ||
    //   (!fechaFinalToUpdate && ausencia.fechaFinal)
    // ) {
    //   // Si las fechas de la ausencia han cambiado, llama a addAusenciaToCuadrantes
    //   await this.cuadrantesInstance.addAusenciaToCuadrantes(ausencia);
    // }

    await this.schAusencias.updateAusenciaResto(ausencia);

    // Elimina cuadrantes que están fuera del nuevo rango de fechas
    await this.schAusencias.eliminarCuadrantesFueraDeRango(
      ausencia.idUsuario,
      ausencia.fechaInicio,
      ausencia.fechaFinal,
      ausencia.tipo,
    );

    return true;
  }

  async getAusencias() {
    return await this.schAusencias.getAusencias();
  }

  async getAusenciaById(idAusencia: ObjectId) {
    return await this.schAusencias.getAusenciasById(idAusencia);
  }

  async getAusenciasTrabajador(
    idTrabajador: number,
    inicio: DateTime,
    final: DateTime,
  ) {
    return await this.schAusencias.getAusenciasTrabajador(
      idTrabajador,
      inicio,
      final,
    );
  }

  async getAusenciasIntervalo(fechaInicio: DateTime, fechaFinal: DateTime) {
    return await this.schAusencias.getAusenciasIntervalo(
      fechaInicio,
      fechaFinal,
    );
  }

  private normalizarFecha(fecha: Date): string {
    const dt = DateTime.fromJSDate(fecha);
    const hora = dt.hour;

    if (hora === 23) {
      return dt.plus({ days: 1 }).toISODate(); // pasa al día siguiente
    } else if (hora === 22) {
      return dt.toISODate(); // mismo día
    } else {
      return dt.toISODate(); // normalmente es 00:00
    }
  }

  async sincronizarAusenciasOmne() {
    const mapTipoOmneToLocal: Record<string, TiposAusencia> = {
      "ENF.COMUN": "BAJA",
      ACCLABORAL: "BAJA",
      ABSENTISMO: "ABSENTISMO",
      PATERNIDAD: "PERMISO MATERNIDAD/PATERNIDAD",
      MATERNIDAD: "PERMISO MATERNIDAD/PATERNIDAD",
      RIESGOEMBA: "REM",
      MENSTRUAC: "BAJA",
      INTERRUMP: "BAJA",
      "SUSP.EMP.": "SANCIÓN",
    };

    const ausenciasOmne = await this.schAusencias.getAusenciasBC();
    const trabajadores = await this.trabajadoresInstance.getTrabajadores();
    const ausenciasLocales = await this.schAusencias.getAusencias();

    if (!Array.isArray(ausenciasOmne)) {
      console.error("Error al obtener ausencias de Omne:", ausenciasOmne);
      return;
    }

    const mapaTrabajadores = new Map(
      trabajadores.map((t) => [`${t.empresaId}-${t.nPerceptor}`, t]),
    );

    // Crear set para búsqueda rápida de ausencias ya existentes
    const ausenciasExistentes = new Set(
      ausenciasLocales.map((a) => {
        const inicio = this.normalizarFecha(a.fechaInicio);
        const fin = this.normalizarFecha(a.fechaFinal);
        return `${a.idUsuario}-${a.tipo}-${inicio}-${fin}`;
      }),
    );

    //Bucle procesado en paralelo
    const tareas = ausenciasOmne.map(async (omne) => {
      const tipoLocal = mapTipoOmneToLocal[omne.codIncidencia];
      if (!tipoLocal) return;

      const perceptorOmne = Number(omne.noPerceptor);
      if (!perceptorOmne) return;

      const key = `${omne.empresaID}-${perceptorOmne}`;
      const trabajador = mapaTrabajadores.get(key);
      if (!trabajador) return;

      const idUsuario = trabajador.id;
      const nombre = trabajador.nombreApellidos || "";
      const dni = trabajador.dni || "";
      const tienda = trabajador.tienda?.nombre || "";
      const horasContrato = trabajador.contratos?.[0]?.horasContrato
        ? (trabajador.contratos[0].horasContrato * 40) / 100
        : 40;

      const fechaInicio = new Date(omne.fInicio);
      const fechaFinal =
        omne.fechaFinalizacion !== "0001-01-01"
          ? new Date(omne.fechaFinalizacion)
          : null;

      const fechaRevision =
        omne.fechaSigRevMedica !== "0001-01-01"
          ? new Date(omne.fechaSigRevMedica)
          : null;

      const claveAusencia = `${idUsuario}-${tipoLocal}-${this.normalizarFecha(
        fechaInicio,
      )}-${this.normalizarFecha(fechaFinal)}`;

      // Verificar si la ausencia ya existe en el sistema local usando el Set 'ausenciasExistentes'
      if (ausenciasExistentes.has(claveAusencia)) {
        // Si la ausencia ya existe, buscamos la entrada correspondiente en ausenciasLocales
        const ausenciaLocal = ausenciasLocales.find((a) => {
          const inicio = this.normalizarFecha(a.fechaInicio);
          const fin = this.normalizarFecha(a.fechaFinal);
          return `${a.idUsuario}-${a.tipo}-${inicio}-${fin}` === claveAusencia;
        });

        // Comparar el comentario (que refleja los días de la incidencia)
        const comentarioLocal = ausenciaLocal?.comentario || "";
        const comentarioOmne = `Duración estimada ${omne.diasIncidencia} día${
          omne.diasIncidencia > 1 ? "s" : ""
        }`;

        // Detectamos si el comentario ha cambiado
        const comentarioCambioDetectado = comentarioLocal !== comentarioOmne;

        if (comentarioCambioDetectado) {
          // Si detectamos que el comentario ha cambiado, actualizamos la ausencia
          const ausenciaActualizar = {
            ...ausenciaLocal,
            fechaInicio,
            fechaFinal,
            fechaRevision,
            comentario: comentarioOmne, // Actualizamos el comentario con la duración correcta
          };

          // Si tiene fecha de revisión, usamos updateAusenciaResto
          if (fechaRevision) {
            await this.updateAusenciaResto(ausenciaActualizar); // Actualización con 'fechaRevision'
          } else {
            await this.updateAusencia(ausenciaActualizar); // Actualización sin 'fechaRevision'
          }

          console.log(`✅ Ausencia actualizada: ${nombre} (${dni})`);
          console.log(
            `📌 Ausencia actualizada: ${nombre} (${dni}) - ${tipoLocal} [Empresa: ${
              omne.empresaID
            }] del ${fechaInicio.toISOString().split("T")[0]} al ${
              fechaFinal
                ? fechaFinal.toISOString().split("T")[0]
                : "sin fecha final"
            } (${omne.diasIncidencia} día${
              omne.diasIncidencia > 1 ? "s" : ""
            })`,
          );
        }
      } else {
        // Si la ausencia no existe, la insertamos como nueva
        await this.nuevaAusencia(
          idUsuario,
          nombre,
          dni,
          tipoLocal as TiposAusencia,
          horasContrato,
          tienda,
          fechaInicio,
          fechaFinal,
          fechaRevision,
          `Duración estimada ${omne.diasIncidencia} día${
            omne.diasIncidencia > 1 ? "s" : ""
          }`,
          true,
          0,
        );

        console.log(`✅ Ausencia insertada: ${nombre} (${dni})`);
        console.log(
          `📌 Ausencia creada: ${nombre} (${dni}) - ${tipoLocal} [Empresa: ${
            omne.empresaID
          }] del ${fechaInicio.toISOString().split("T")[0]} al ${
            fechaFinal
              ? fechaFinal.toISOString().split("T")[0]
              : "sin fecha final"
          } (${omne.diasIncidencia} día${omne.diasIncidencia > 1 ? "s" : ""})`,
        );
      }
    });

    // Esperar todas las tareas en paralelo, sin que se interrumpa por errores
    await Promise.allSettled(tareas);

    console.log("✅ Sincronización finalizada.");
  }
}
