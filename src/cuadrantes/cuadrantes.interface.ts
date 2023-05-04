export interface TCuadrante {
  _id: string;
  idTrabajador: number;
  nombre: string;
  idTienda: number;
  semana: number;
  arraySemanalHoras: {
    horaEntrada: string;
    horaSalida: string;
    idPlan: string;
    ausencia?: AusenciaDto
  }[];
  totalHoras: number;
  enviado: boolean;
  historialPlanes: string[];
}

export type AusenciaDto = {
  tipo: "TOTAL" | "PARCIAL",
  horas: number;
}