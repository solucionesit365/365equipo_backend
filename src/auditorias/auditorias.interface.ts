import { ObjectId } from "mongodb";

export interface AuditoriasInterface {
    _id: ObjectId;
    tituloAuditoria: string;
    descripcion: string;
    caducidad: Date;
    tienda: number;
    preguntas: {
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