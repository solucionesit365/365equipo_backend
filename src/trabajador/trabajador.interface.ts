import { UserRecord } from "firebase-admin/auth";
import { Prisma, Trabajador } from "@prisma/client";
import { CreateTrabajadorRequestDto } from "./trabajador.dto";
import { DateTime } from "luxon";

// Los tipos se mantienen igual
type UserRecordWithoutToJSON = Omit<UserRecord, "toJSON">;

export interface TrabajadorCompleto
  extends Trabajador,
    UserRecordWithoutToJSON {
  displayName: string;
}

export interface TOmneTrabajador {
  noPerceptor: string;
  apellidosYNombre: string;
  nombre: string;
  email: string;
  documento: string;
  viaPublica: string;
  numero: string;
  piso: string;
  poblacion: string;
  noTelfMovilPersonal: string;
  nacionalidad: number;
  codPaisNacionalidad: string;
  noAfiliacion: string;
  cp: string;
  centroTrabajo: string;
  antiguedadEmpresa: string;
  altaContrato: string;
  bajaEmpresa: string;
  cambioAntiguedad: string;
  categoria: string;
  fechaCalculoAntiguedad: string;
  tipoContrato: string;
  systemModifiedAt: string;
  systemCreatedAt: string;
  horassemana: number;
  descripcionCentro: string;
  auxiliaryIndex1: string;
  auxiliaryIndex2: number;
  auxiliaryIndex3: string;
  auxiliaryIndex4: string;
  empresaID: string;
  fechaNacimiento: DateTime | null;
}

type TResultGetTrabajadorBySqlId = Prisma.TrabajadorGetPayload<{
  include: {
    contratos: {
      where: {
        fechaBaja: null;
      };
      orderBy: {
        fechaAlta: "desc";
      };
      take: 1;
    };
    responsable: true;
    tienda: true;
  };
}>;

export type TResultGetTrabajadorByDni = Prisma.TrabajadorGetPayload<{
  include: {
    contratos: {
      where: {
        fechaBaja: null;
      };
      orderBy: {
        fechaAlta: "desc";
      };
      take: 1;
    };
  };
}>;

type TGetTrabajadores = Prisma.TrabajadorGetPayload<{
  include: {
    contratos: {
      where: {
        fechaBaja: null;
      };
      orderBy: {
        fechaAlta: "desc";
      };
      take: 1;
    };
    responsable: true;
    tienda: true;
    roles: true;
    permisos: true;
    empresa: true;
  };
}>[];

export interface TIncludeTrabajador {
  contratos?: boolean;
  responsable?: boolean;
  tienda?: boolean;
  roles?: boolean;
  permisos?: boolean;
  empresa?: boolean;
}

// CLASE ABSTRACTA EN LUGAR DE INTERFAZ
export abstract class ITrabajadorRepositoryDatabase {
  abstract crearTrabajador(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean>;

  abstract createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ): Promise<any>;

  abstract actualizarTrabajadoresLote(modificaciones: any[]): Promise<any>;

  abstract getTrabajadoresOmne(): Promise<any[]>;

  abstract getTrabajadorByDni(dni: string): Promise<TResultGetTrabajadorByDni>;

  abstract updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ): Promise<{ updated: number }>;

  abstract deleteManyTrabajadores(
    dnis: { dni: string }[],
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;

  abstract getAllTrabajadores(include: TIncludeTrabajador): Promise<any[]>;

  abstract getTrabajadorByAppId(uid: string): Promise<Trabajador | null>;

  abstract crearTrabajadorInterno(
    trabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador>;

  abstract getTrabajadorBySqlId(
    id: number,
  ): Promise<TResultGetTrabajadorBySqlId>;

  abstract getTrabajadores(): Promise<TGetTrabajadores>;

  abstract getTrabajadorTokenQR(
    idTrabajador: number,
    tokenQR: string,
  ): Promise<any>;

  abstract updateTrabajador(
    idTrabajador: number,
    payload: Prisma.TrabajadorUpdateInput,
  ): Promise<Trabajador>;
  abstract getTrabajadorByDni(dni: string): Promise<TResultGetTrabajadorByDni>;

  abstract getTrabajadoresByTienda(idTienda: number): Promise<any>;

  abstract getSubordinadosConTienda(idAppResponsable: string): Promise<any>;

  abstract esCoordinadora(uid: string): Promise<any>;

  abstract esCoordinadoraPorId(id: number): Promise<any>;

  abstract getSubordinados(idApp: string): Promise<any>;

  abstract getSubordinadosById(id: number, conFecha?: DateTime): Promise<any>;

  abstract getSubordinadosConTiendaPorId(idResponsable: number): Promise<any>;

  abstract getSubordinadosByIdsql(id: number): Promise<any>;

  abstract getSubordinadosByIdNew(
    id: number,
    conFecha?: DateTime,
  ): Promise<any>;

  abstract borrarTrabajador(idSql: number): Promise<any>;

  abstract deleteTrabajador(idSql: number): Promise<any>;

  abstract borrarConFechaBaja(): Promise<any>;
}

export abstract class ITrabajadorRepository {
  abstract crearTrabajador(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean>;

  abstract getTrabajadoresModificadosOmne(): Promise<any[]>;

  abstract crearArrayTrabajadores(trabajadoresRaw: any): any[];

  abstract getAllTrabajadores(include: TIncludeTrabajador): Promise<any[]>;

  abstract updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ): Promise<any>;

  abstract createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ): Promise<any>;

  abstract updateTrabajador(
    idTrabajador: number,
    payload: Prisma.TrabajadorUpdateInput,
  ): Promise<Trabajador>;
  abstract getTrabajadorByDni(dni: string): Promise<TResultGetTrabajadorByDni>;

  abstract deleteManyTrabajadores(
    dnis: { dni: string }[],
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;

  abstract limpiarTrabajadoresConFinalContrato(): Promise<any>;

  abstract eliminarTrabajador(idSql: number): Promise<any>;

  abstract getTrabajadorByAppId(uid: string): Promise<Trabajador | null>;

  abstract getTrabajadoresByTienda(idTienda: number): Promise<any>;

  abstract getTrabajadorBySqlId(
    id: number,
  ): Promise<TResultGetTrabajadorBySqlId>;

  /* Usuarios que no vienen de HIT */
  abstract crearUsuarioInterno(
    trabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador>;
  abstract getTrabajadores(): Promise<TGetTrabajadores>;

  abstract getSubordinadosConTienda(idAppResponsable: string): Promise<any>;

  abstract getSubordinadosConTiendaPorId(idResponsable: number): Promise<any>;

  abstract esCoordinadoraPorId(id: number): Promise<any>;

  abstract getSubordinadosByIdsql(id: number): Promise<any>;

  abstract esCoordinadora(uid: string): Promise<boolean>;

  abstract getSubordinados(uid: string): Promise<any>;

  abstract getSubordinadosById(id: number, conFecha?: DateTime): Promise<any>;

  abstract getSubordinadosByIdNew(
    id: number,
    conFecha?: DateTime,
  ): Promise<any>;

  abstract getTrabajadorTokenQR(
    idTrabajador: number,
    tokenQR: string,
  ): Promise<any>;
}
