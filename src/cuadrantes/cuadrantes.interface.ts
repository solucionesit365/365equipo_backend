export interface TCuadrante {
  _id?: string;
  idTrabajador: number;
  nombre: string;
  idTienda: number;
  semana: number;
  year: number;
  arraySemanalHoras: {
    horaEntrada: string;
    horaSalida: string;
    idPlan: string;
    ausencia?: {
      tipo: TiposAusencia;
      parcial: boolean;
      horasParcial?: number;
    };
  }[];
  totalHoras: number;
  enviado: boolean;
  historialPlanes: string[];
}

export type TiposAusencia = "BAJA" | "DIA_PERSONAL" | "VACACIONES";
