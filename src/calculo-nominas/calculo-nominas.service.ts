import { Injectable } from "@nestjs/common";
import { NotificacionHorasExtrasClass } from "../notificacion-horas-extras/notificacion-horas-extras.class";
import { Fichajes } from "../fichajes-bc/fichajes.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { CalendarioFestivoService } from "src/calendario-festivos/calendario-festivos.class";
import { DateTime } from "luxon";

@Injectable()
export class CalculoNominasService {
  constructor(
    private readonly schHorasExtras: NotificacionHorasExtrasClass,
    private readonly schFichajes: Fichajes,
    private readonly schTrabajadores: TrabajadorService,
    private readonly schCalendario: CalendarioFestivoService,
  ) {}

  //   Con rango de fechas en parametros
  //   async calcularPDIS(fechaInicio: Date, fechaFin: Date) {
  //     const trabajadores = await this.schTrabajadores.getTrabajadores();

  //     // Filtramos solo los que tengan el rol 'Dependienta'
  //     const dependientas = trabajadores.filter((trabajador) =>
  //       trabajador.roles?.some(
  //         (rol: { name: string }) => rol.name === "Dependienta",
  //       ),
  //     );

  //     // Obtenemos todos los festivos
  //     const festivos = await this.schCalendario.getfestivos();

  //     const resultadosPDIS = [];

  //     for (const dependienta of dependientas) {
  //       const uid = dependienta.idApp;
  //       const tiendaId = dependienta.tienda;

  //       // Filtrar festivos que aplican a la tienda del trabajador o globales
  //       const festivosAplicables = festivos.filter(
  //         (f: any) =>
  //           Array.isArray(f.tienda) &&
  //           (f.tienda.includes(tiendaId) || f.tienda.includes(-1)),
  //       );

  //       // Construir rangos festivos
  //       const rangosFestivos = festivosAplicables.map((f: any) => ({
  //         inicio: DateTime.fromFormat(f.fechaInicio, "dd/MM/yyyy").startOf("day"),
  //         fin: DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy").endOf("day"),
  //       }));

  //       // Obtener y ordenar fichajes
  //       const fichajes = await this.schFichajes.getFichajesByUid(
  //         uid,
  //         fechaInicio,
  //         fechaFin,
  //       );
  //       const fichajesOrdenados = this.schFichajes.ordenarPorHora(fichajes);

  //       let totalHorasFestivo = 0;

  //       for (let i = 0; i < fichajesOrdenados.length - 1; i++) {
  //         const entrada = fichajesOrdenados[i];
  //         const salida = fichajesOrdenados[i + 1];

  //         if (entrada.tipo !== "ENTRADA" || salida.tipo !== "SALIDA") continue;

  //         const fechaEntrada = DateTime.fromJSDate(entrada.hora);

  //         const esFestivo = rangosFestivos.some(
  //           (rango) => fechaEntrada >= rango.inicio && fechaEntrada <= rango.fin,
  //         );

  //         if (esFestivo) {
  //           const horaEntrada = DateTime.fromJSDate(entrada.hora);
  //           const horaSalida = DateTime.fromJSDate(salida.hora);
  //           const horas = horaSalida.diff(horaEntrada, "hours").hours;
  //           totalHorasFestivo += horas;
  //         }

  //         i++; // saltamos al siguiente par
  //       }

  //       resultadosPDIS.push({
  //         nombre: dependienta.nombreApellidos,
  //         dni: dependienta.dni,
  //         idSql: dependienta.id,
  //         totalHorasFestivo,
  //       });
  //     }

  //     console.log("Resultados PDIS:", resultadosPDIS);

  //     return resultadosPDIS;
  //   }

  //   Sin parametros de fechas y automaticamente
  async calcularPDIS() {
    const trabajadores = await this.schTrabajadores.getTrabajadores();
    const festivos = await this.schCalendario.getfestivos();

    // 🎯 Detectar el periodo de pluses actual
    // const hoy = DateTime.now();
    // const festivoPlusActual = festivos.find((f: any) => {
    //   if (f.categoria !== "General") return false;
    //   const titulo = (f.titulo || "").toLowerCase();
    //   const descripcion = (f.descripcion || "").toLowerCase();
    //   const inicio = DateTime.fromFormat(f.fechaInicio, "dd/MM/yyyy");
    //   const fin = DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy");

    //   return (
    //     (titulo.includes("plus") || descripcion.includes("plus")) &&
    //     hoy >= inicio.startOf("day") &&
    //     hoy <= fin.endOf("day")
    //   );
    // });

    // if (!festivoPlusActual) {
    //   throw new Error("No se encontró un periodo de pluses vigente.");
    // }

    // const fechaInicio = DateTime.fromFormat(
    //   typeof festivoPlusActual.fechaInicio === "string"
    //     ? festivoPlusActual.fechaInicio
    //     : DateTime.fromJSDate(festivoPlusActual.fechaInicio).toFormat(
    //         "dd/MM/yyyy",
    //       ),
    //   "dd/MM/yyyy",
    // ).startOf("day");
    // const fechaFin = DateTime.fromFormat(
    //   typeof festivoPlusActual.fechaFinal === "string"
    //     ? festivoPlusActual.fechaFinal
    //     : DateTime.fromJSDate(festivoPlusActual.fechaFinal).toFormat(
    //         "dd/MM/yyyy",
    //       ),
    //   "dd/MM/yyyy",
    // ).endOf("day");

    // 🎯 Detectar el periodo de pluses anterior
    const hoy = DateTime.now();

    const plusesPasados = festivos.filter((f: any) => {
      if (f.categoria !== "General") return false;
      const titulo = (f.titulo || "").toLowerCase();
      const descripcion = (f.descripcion || "").toLowerCase();
      const fin = DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy");

      return (
        (titulo.includes("plus") || descripcion.includes("plus")) && fin < hoy
      );
    });

    // Ordenar por fecha final descendente y tomar el más reciente
    const festivoPlusAnterior = plusesPasados.sort((a, b) => {
      const bFechaFinalStr =
        typeof b.fechaFinal === "string"
          ? b.fechaFinal
          : DateTime.fromJSDate(b.fechaFinal).toFormat("dd/MM/yyyy");
      const aFechaFinalStr =
        typeof a.fechaFinal === "string"
          ? a.fechaFinal
          : DateTime.fromJSDate(a.fechaFinal).toFormat("dd/MM/yyyy");
      return (
        DateTime.fromFormat(bFechaFinalStr, "dd/MM/yyyy").toMillis() -
        DateTime.fromFormat(aFechaFinalStr, "dd/MM/yyyy").toMillis()
      );
    })[0];

    if (!festivoPlusAnterior) {
      throw new Error("No se encontró un periodo anterior de pluses.");
    }

    const fechaInicio = DateTime.fromFormat(
      typeof festivoPlusAnterior.fechaInicio === "string"
        ? festivoPlusAnterior.fechaInicio
        : DateTime.fromJSDate(festivoPlusAnterior.fechaInicio).toFormat(
            "dd/MM/yyyy",
          ),
      "dd/MM/yyyy",
    ).startOf("day");
    const fechaFin = DateTime.fromFormat(
      typeof festivoPlusAnterior.fechaFinal === "string"
        ? festivoPlusAnterior.fechaFinal
        : DateTime.fromJSDate(festivoPlusAnterior.fechaFinal).toFormat(
            "dd/MM/yyyy",
          ),
      "dd/MM/yyyy",
    ).endOf("day");

    console.log(fechaInicio.toJSDate());
    console.log(fechaFin.toJSDate());

    // 🔎 Filtrar dependientas
    const dependientas = trabajadores.filter(
      (trabajador) =>
        trabajador.roles?.some(
          (rol: { name: string }) => rol.name === "Dependienta",
        ) &&
        ["ime mil s.l.u", "filapeña s.l.u"].includes(
          trabajador.empresa.nombre.toLowerCase(),
        ),
    );

    const resultadosPDIS = [];
    // 🕓 Obtener fichajes del periodo de pluses
    const fichajesPorUid = await Promise.all(
      dependientas.map((d) =>
        this.schFichajes
          .getFichajesByUid(
            d.idApp,
            fechaInicio.toJSDate(),
            fechaFin.toJSDate(),
          )
          .then((f) => ({ dependienta: d, fichajes: f })),
      ),
    );

    for (const { dependienta, fichajes } of fichajesPorUid) {
      const tiendaId = dependienta.tienda;

      // 🏪 Filtrar festivos aplicables a la tienda o globales
      const festivosAplicables = festivos.filter(
        (f: any) =>
          Array.isArray(f.tienda) &&
          (f.tienda.includes(tiendaId) || f.tienda.includes(-1)),
      );

      // 📅 Convertir festivos a rangos
      const rangosFestivos = festivosAplicables.map((f: any) => ({
        inicio: DateTime.fromFormat(f.fechaInicio, "dd/MM/yyyy").startOf("day"),
        fin: DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy").endOf("day"),
      }));

      const fichajesOrdenados = this.schFichajes.ordenarPorHora(fichajes);

      let totalHorasFestivo = 0;

      for (let i = 0; i < fichajesOrdenados.length - 1; i++) {
        const entrada = fichajesOrdenados[i];
        const salida = fichajesOrdenados[i + 1];

        if (entrada.tipo !== "ENTRADA" || salida.tipo !== "SALIDA") continue;

        const fechaEntrada = DateTime.fromJSDate(entrada.hora);

        // ✅ Verificar si el fichaje es en un día festivo dentro del periodo de pluses
        const esFestivoDentroDePluses = rangosFestivos.some(
          (rango) =>
            fechaEntrada >= rango.inicio &&
            fechaEntrada <= rango.fin &&
            fechaEntrada >= fechaInicio &&
            fechaEntrada <= fechaFin,
        );

        if (esFestivoDentroDePluses) {
          const horaEntrada = DateTime.fromJSDate(entrada.hora);
          const horaSalida = DateTime.fromJSDate(salida.hora);
          const horas = horaSalida.diff(horaEntrada, "hours").hours;
          totalHorasFestivo += horas;
        }

        i++; // saltar al siguiente par
      }

      resultadosPDIS.push({
        nombre: dependienta.nombreApellidos,
        dni: dependienta.dni,
        idSql: dependienta.id,
        numPerceptor: dependienta.nPerceptor,
        empresa: dependienta.empresa.nombre,
        pdisp: totalHorasFestivo,
      });
    }

    console.log("Resultados PDIS:", resultadosPDIS);
    return resultadosPDIS;
  }

  // PPROD
  async calcularPPROD() {
    const trabajadores = await this.schTrabajadores.getTrabajadores();
    const notificaciones =
      await this.schHorasExtras.getAllNotificacionesHorasExtras();

    // 🎯 Filtrar trabajadores con contrato de 40h (100%)
    const trabajadores40h = trabajadores.filter(
      (t) => t.contratos[0].horasContrato === 100,
    );

    // 🔎 Crear un mapa para lookup rápido por DNI
    const trabajadoresMap = new Map(trabajadores40h.map((t) => [t.dni, t]));

    const resultados = new Map<
      string,
      {
        nombre: string;
        dni: string;
        idSql: number;
        numPerceptor: number;
        empresa: string;
        totalHorasNotificadas: number;
      }
    >();

    for (const noti of notificaciones) {
      const trabajador = trabajadoresMap.get(noti.dniTrabajador);
      if (!trabajador) continue; // ignorar si no aplica

      // 📌 Calcular total de horas notificadas en este bloque con reduce
      const total = (noti.horasExtras || []).reduce((acc, bloque) => {
        const { fecha, horaInicio, horaFinal, apagar, revision } = bloque;
        if (!fecha || !horaInicio || !horaFinal || !apagar || !revision)
          return acc;

        const inicio = DateTime.fromFormat(
          `${fecha} ${horaInicio}`,
          "dd/MM/yyyy HH:mm",
        );
        const fin = DateTime.fromFormat(
          `${fecha} ${horaFinal}`,
          "dd/MM/yyyy HH:mm",
        );

        if (inicio.isValid && fin.isValid && fin > inicio) {
          acc += fin.diff(inicio, "hours").hours;
        }
        return acc;
      }, 0);

      // 📌 Insertar o acumular en el mapa de resultados
      const result = resultados.get(trabajador.dni);
      if (!result) {
        resultados.set(trabajador.dni, {
          nombre: trabajador.nombreApellidos,
          dni: trabajador.dni,
          idSql: trabajador.id,
          numPerceptor: trabajador.nPerceptor,
          empresa: trabajador.empresa.nombre,
          totalHorasNotificadas: total,
        });
      } else {
        result.totalHorasNotificadas += total;
      }
    }

    return Array.from(resultados.values());
  }

  //   Sin fichaje de salida
  //   async calcularPDOM() {
  //     const trabajadores = await this.schTrabajadores.getTrabajadores();
  //     const festivos = await this.schCalendario.getfestivos();

  //     // 🔍 Buscar el rango de pluses anterior (igual que en PDIS)
  //     const hoy = DateTime.now();

  //     const plusesPasados = festivos.filter((f: any) => {
  //       if (f.categoria !== "General") return false;
  //       const titulo = (f.titulo || "").toLowerCase();
  //       const descripcion = (f.descripcion || "").toLowerCase();
  //       const fin = DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy");

  //       return (
  //         (titulo.includes("plus") || descripcion.includes("plus")) && fin < hoy
  //       );
  //     });

  //     const festivoPlusAnterior = plusesPasados.sort((a, b) => {
  //       const bFechaFinalStr =
  //         typeof b.fechaFinal === "string"
  //           ? b.fechaFinal
  //           : DateTime.fromJSDate(b.fechaFinal).toFormat("dd/MM/yyyy");
  //       const aFechaFinalStr =
  //         typeof a.fechaFinal === "string"
  //           ? a.fechaFinal
  //           : DateTime.fromJSDate(a.fechaFinal).toFormat("dd/MM/yyyy");
  //       return (
  //         DateTime.fromFormat(bFechaFinalStr, "dd/MM/yyyy").toMillis() -
  //         DateTime.fromFormat(aFechaFinalStr, "dd/MM/yyyy").toMillis()
  //       );
  //     })[0];

  //     if (!festivoPlusAnterior) {
  //       throw new Error("No se encontró un periodo anterior de pluses.");
  //     }

  //     const fechaInicio = DateTime.fromFormat(
  //       typeof festivoPlusAnterior.fechaInicio === "string"
  //         ? festivoPlusAnterior.fechaInicio
  //         : DateTime.fromJSDate(festivoPlusAnterior.fechaInicio).toFormat(
  //             "dd/MM/yyyy",
  //           ),
  //       "dd/MM/yyyy",
  //     ).startOf("day");

  //     const fechaFin = DateTime.fromFormat(
  //       typeof festivoPlusAnterior.fechaFinal === "string"
  //         ? festivoPlusAnterior.fechaFinal
  //         : DateTime.fromJSDate(festivoPlusAnterior.fechaFinal).toFormat(
  //             "dd/MM/yyyy",
  //           ),
  //       "dd/MM/yyyy",
  //     ).endOf("day");

  //     const dependientas = trabajadores.filter((trabajador) =>
  //       trabajador.roles?.some(
  //         (rol: { name: string }) => rol.name === "Dependienta",
  //       ),
  //     );

  //     const resultadosPDOM = [];

  //     for (const dependienta of dependientas) {
  //       const uid = dependienta.idApp;

  //       const fichajes = await this.schFichajes.getFichajesByUid(
  //         uid,
  //         fechaInicio.toJSDate(),
  //         fechaFin.toJSDate(),
  //       );

  //       const domingosTrabajados = new Set<string>();

  //       for (const fichaje of fichajes) {
  //         if (fichaje.tipo !== "ENTRADA") continue;

  //         const fecha = DateTime.fromJSDate(fichaje.hora);
  //         if (fecha.weekday === 7) {
  //           // Domingo en Luxon
  //           domingosTrabajados.add(fecha.toISODate());
  //         }
  //       }

  //       resultadosPDOM.push({
  //         nombre: dependienta.nombreApellidos,
  //         dni: dependienta.dni,
  //         idSql: dependienta.id,
  //         domingosTrabajados: domingosTrabajados.size,
  //       });
  //     }

  //     return resultadosPDOM;
  //   }

  //   Con entrada y salida
  async calcularPDOM() {
    const trabajadores = await this.schTrabajadores.getTrabajadores();
    const festivos = await this.schCalendario.getfestivos();

    const hoy = DateTime.now();

    // 🔎 Sacar último periodo de pluses (igual que antes)
    const plusesPasados = festivos.filter((f: any) => {
      if (f.categoria !== "General") return false;
      const titulo = (f.titulo || "").toLowerCase();
      const descripcion = (f.descripcion || "").toLowerCase();
      const fin = DateTime.fromFormat(f.fechaFinal, "dd/MM/yyyy");
      return (
        (titulo.includes("plus") || descripcion.includes("plus")) && fin < hoy
      );
    });

    const festivoPlusAnterior = plusesPasados.sort((a, b) => {
      const bFechaFinalStr =
        typeof b.fechaFinal === "string"
          ? b.fechaFinal
          : DateTime.fromJSDate(b.fechaFinal).toFormat("dd/MM/yyyy");
      const aFechaFinalStr =
        typeof a.fechaFinal === "string"
          ? a.fechaFinal
          : DateTime.fromJSDate(a.fechaFinal).toFormat("dd/MM/yyyy");
      return (
        DateTime.fromFormat(bFechaFinalStr, "dd/MM/yyyy").toMillis() -
        DateTime.fromFormat(aFechaFinalStr, "dd/MM/yyyy").toMillis()
      );
    })[0];

    if (!festivoPlusAnterior) {
      throw new Error("No se encontró un periodo anterior de pluses.");
    }

    const fechaInicio = DateTime.fromFormat(
      typeof festivoPlusAnterior.fechaInicio === "string"
        ? festivoPlusAnterior.fechaInicio
        : DateTime.fromJSDate(festivoPlusAnterior.fechaInicio).toFormat(
            "dd/MM/yyyy",
          ),
      "dd/MM/yyyy",
    ).startOf("day");

    const fechaFin = DateTime.fromFormat(
      typeof festivoPlusAnterior.fechaFinal === "string"
        ? festivoPlusAnterior.fechaFinal
        : DateTime.fromJSDate(festivoPlusAnterior.fechaFinal).toFormat(
            "dd/MM/yyyy",
          ),
      "dd/MM/yyyy",
    ).endOf("day");

    // 🔎 Filtrar dependientas SOLO de empresas IME Mil y Filapeña
    const dependientas = trabajadores.filter(
      (trabajador) =>
        trabajador.roles?.some(
          (rol: { name: string }) => rol.name === "Dependienta",
        ) &&
        ["ime mil s.l.u", "filapeña s.l.u"].includes(
          trabajador.empresa.nombre.toLowerCase(),
        ),
    );

    // 🚀 Lanzar fichajes en paralelo
    const fichajesPorDependienta = await Promise.all(
      dependientas.map(async (dependienta) => {
        const fichajes = await this.schFichajes.getFichajesByUid(
          dependienta.idApp,
          fechaInicio.toJSDate(),
          fechaFin.toJSDate(),
        );
        return { dependienta, fichajes };
      }),
    );

    // Procesar resultados
    const resultadosPDOM = fichajesPorDependienta.map(
      ({ dependienta, fichajes }) => {
        const fichajesOrdenados = this.schFichajes.ordenarPorHora(fichajes);
        const domingosConPares = new Set<string>();

        for (let i = 0; i < fichajesOrdenados.length - 1; i++) {
          const entrada = fichajesOrdenados[i];
          const salida = fichajesOrdenados[i + 1];

          if (entrada.tipo === "ENTRADA" && salida.tipo === "SALIDA") {
            const fechaEntrada = DateTime.fromJSDate(entrada.hora);
            const fechaSalida = DateTime.fromJSDate(salida.hora);

            if (
              fechaEntrada.weekday === 7 &&
              fechaEntrada.toISODate() === fechaSalida.toISODate()
            ) {
              domingosConPares.add(fechaEntrada.toISODate());
              i++;
            }
          }
        }

        return {
          nombre: dependienta.nombreApellidos,
          dni: dependienta.dni,
          idSql: dependienta.id,
          numPerceptor: dependienta.nPerceptor,
          empresa: dependienta.empresa.nombre,
          pdom: domingosConPares.size,
        };
      },
    );

    return resultadosPDOM;
  }

  async calcularHCOMPL() {
    const trabajadores = await this.schTrabajadores.getTrabajadores();
    const notificaciones =
      await this.schHorasExtras.getAllNotificacionesHorasExtras();

    // 🎯 Filtrar trabajadores con contrato de menos de 40h
    const trabajadoresMenos40 = trabajadores.filter(
      (t) => t.contratos[0].horasContrato < 100,
    );

    // 🔎 Crear un mapa para lookup rápido por DNI
    const trabajadoresMap = new Map(trabajadoresMenos40.map((t) => [t.dni, t]));

    const resultados = new Map<
      string,
      {
        nombre: string;
        dni: string;
        idSql: number;
        numPerceptor: number;
        empresa: string;
        totalHorasNotificadas: number;
      }
    >();

    for (const noti of notificaciones) {
      const trabajador = trabajadoresMap.get(noti.dniTrabajador);
      if (!trabajador) continue; // ignorar si no aplica

      // 📌 Reducir en una sola pasada las horas de los bloques válidos
      const total = (noti.horasExtras || []).reduce((acc, bloque) => {
        const { fecha, horaInicio, horaFinal, apagar, revision } = bloque;
        if (!fecha || !horaInicio || !horaFinal || !apagar || !revision)
          return acc;

        // Usamos Luxon para validar las horas
        const inicio = DateTime.fromFormat(
          `${fecha} ${horaInicio}`,
          "dd/MM/yyyy HH:mm",
        );
        const fin = DateTime.fromFormat(
          `${fecha} ${horaFinal}`,
          "dd/MM/yyyy HH:mm",
        );

        if (inicio.isValid && fin.isValid && fin > inicio) {
          acc += fin.diff(inicio, "hours").hours;
        }
        return acc;
      }, 0);

      // 📌 Guardar en resultados (sumar si ya existe)
      if (!resultados.has(trabajador.dni)) {
        resultados.set(trabajador.dni, {
          nombre: trabajador.nombreApellidos,
          dni: trabajador.dni,
          idSql: trabajador.id,
          numPerceptor: trabajador.nPerceptor,
          empresa: trabajador.empresa.nombre,
          totalHorasNotificadas: total,
        });
      } else {
        resultados.get(trabajador.dni)!.totalHorasNotificadas += total;
      }
    }

    return Array.from(resultados.values());
  }

  async calcularTodo() {
    const [pdis, pprod, pdom, hcompl] = await Promise.all([
      this.calcularPDIS(),
      this.calcularPPROD(),
      this.calcularPDOM(),
      this.calcularHCOMPL(),
    ]);

    return {
      pdis,
      pprod,
      pdom,
      hcompl,
    };
  }
}
