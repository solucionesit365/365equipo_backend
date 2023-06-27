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