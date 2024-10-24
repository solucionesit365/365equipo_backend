import { ObjectId } from "mongodb";

export interface Incidencias {
  _id: ObjectId;
  autorizoLLamada: boolean;
  categoria: string;
  descripcion: string;
  destinatario: string;
  estado: string;
  fechaCreacion: Date;
  multimedia: string;
  prioridad: string;
  mensajes: {
    fechaResp: Date;
    mensaje: string;
    nombre: string;
  }[];
  nombre: string;
  uid: string;
  tienda: string;
}

export interface IncidenciasInvitado {
  _id: ObjectId;
  autorizoLLamada: boolean;
  categoria: string;
  descripcion: string;
  destinatario: string;
  estado: string;
  fechaCreacion: Date;
  multimedia: string;
  prioridad: string;
  mensajes: {
    fechaResp: Date;
    mensaje: string;
    nombre: string;
  }[];
  nombre: string;
  telefono: string;
}
