export interface SolicitudVacaciones {
  idBeneficiario: number;
  totalDias: number;
  fechaInicio: string;
  fechaFinal: string;
  fechaIncorporacion: string;
  observaciones: string;
  respuestaSolicitud: string;
  fechaCreacion: string;
  estado: string;
  idSolicitud: number;
  enviado: boolean;
  creador: number;
  tienda?: number;
}
