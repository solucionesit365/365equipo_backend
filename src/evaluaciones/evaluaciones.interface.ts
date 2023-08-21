export interface evaluacionesInterface {
  titulo: string;
  tipo: TipoEvaluacion;
  configuracion: {
    preguntasExtras: boolean;
    objetivos: boolean;
    formacion: boolean;
    compromisos: boolean;
    destallesExtras: boolean;
    evolucionCorporativa: boolean;
    compartirEvaluacion: boolean;
    subirFoto: boolean;
  };
  encuestado: {
    nombre: string;
    idSql: number;
    Fecha: string;
    departamento: string;
  };
  PreguntasEvaluadas: string[];
  puntuacion: number;
  objetivos: {
    añoAnterior: {
      titulo: string;
      consecución: string;
    };
    añoActual: {
      titulo: string;
      indicador: string;
      fechaFin: string;
    };
  };
  destallesExtras: {
    habilidades: string;
    hobbies: string;
    formaciones: string;
    experienciaPrevia: string;
  };
  evolucionCorporativa: {
    promocion: boolean;
    aprenderFuncionesPuestoActual: boolean;
    interesOtroPuesto: boolean;
  };
  formacion: {
    Propuesta: string;
    necesidad: string;
    origenNecesidad: string;
  };
  preguntasExtras: [];
  compromisos: {
    titulo: string;
    fecha: string;
    responsable: number;
  };
  firmarResponsable: string;
  firmaEvaluado: string;
}

export type TipoEvaluacion = "estructura" | "general";
