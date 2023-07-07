import { ObjectId } from "mongodb";

export interface AuditoriasInterface {
    _id: ObjectId;
    tituloAuditoria: string;
    descripcion: string;
    caducidad: Date;
    tienda: number;
    configuracion: {
        preguntasDependientaA: boolean,
        preguntasDependientaB_C: boolean,
        preguntasResponsable: boolean
    }
    preguntas: {
        archivo: boolean;
        pregunta: string;
        tipo: string;
    }[];
    preguntasDependientaA: {
        archivo: boolean;
        pregunta: string;
        tipo: string;
    }[];
    preguntasDependientaB_C: {
        archivo: boolean;
        pregunta: string;
        tipo: string;
    }[];
    preguntasResponsable: {
        archivo: boolean;
        pregunta: string;
        tipo: string;
    }[];
    habilitado: boolean;
    deptCreador: string;
}

export interface AuditoriaRespuestas {
    _id: ObjectId;
    auditoria: string,
    idAuditoria: string,
    descripcion: string,
    persona: string,
    respuestas: [],
    tienda: number,
    ultimaRespuesta: Date
}