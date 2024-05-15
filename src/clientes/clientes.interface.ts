export interface SolicitudCliente {
  _id: string;
  email: string;
  fechaRegistro: Date;
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  newsletter: boolean;
  codigoPostal?: string;
};

export interface CodigoFlayers {
  _id: string;
  email: string;
  fechaRegistro: Date;
  caducado: boolean;
  codigo: string;
}
