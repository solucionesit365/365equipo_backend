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
  }[];
  totalHoras: number;
  enviado: boolean;
  historialPlanes: string[];
}
