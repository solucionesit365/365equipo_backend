export interface ParametrosDTO {
  _id: string;
  lastSyncWorkers: Date;
  name: string;
}

export interface CampañaMedicaDTO {
  fechaFinalRevision?: Date | null;
  correoCentroMedico?: string | null;
  OtroCorreo?: string | null;
}

export interface CorreosFurgosDTO {
  _id: string;
  mails?: string[];
}

export interface ParametroDTO2 {
  _id?: string;
  name: string;
  campañaMedica: CampañaMedicaDTO;
}
