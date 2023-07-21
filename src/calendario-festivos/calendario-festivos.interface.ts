import { ObjectId } from "mongodb";

export interface CalendarioFestivosInterface {
    _id?: ObjectId;
    titulo: string;
    descripcion: string;
    todosEventos: boolean;
    fechaInicio: Date;
    fechaFinal: Date;
    horaInicio: Date;
    horaFinal: Date;
    color: {
        background: string,
        foreground: string
    }
    tienda: number[];
    categoria: string;
}
