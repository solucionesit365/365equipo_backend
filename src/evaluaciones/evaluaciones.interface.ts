import { ObjectId } from "mongodb";

export interface evaluacionesInterface {
  _id: ObjectId;
  titulo: string;
  tipo: string;
  foto: string;
  opinionEvaluado: string;
  opinionResponsable: string;
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
    año: string;
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
  compromisos: [];
  firmarResponsable: string;
  firmaEvaluado: string;
}

export interface iluoInterface {
  _id: ObjectId;
  titulo: string;
  plantillaAsociada: string;
  opinionEvaluado: string;
  opinionResponsable: string;
  configuracion: {
    preguntasExtras: boolean;
    objetivos: boolean;
    formacion: boolean;
    compromisos: boolean;
    destallesExtras: boolean;
    evolucionCorporativa: boolean;
    compartirEvaluacion: boolean;
  };
  encuestado: {
    nombre: string;
    idSql: number;
    Fecha: string;
    año: string;
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
  compromisos: [];
  firmarResponsable: string;
  firmaEvaluado: string;
}
