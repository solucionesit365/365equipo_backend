import { UserRecord } from "firebase-admin/auth";
import { Prisma, Trabajador } from "@prisma/client";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";
import { DateTime } from "luxon";

// Los tipos se mantienen igual
type UserRecordWithoutToJSON = Omit<UserRecord, "toJSON">;

export interface TrabajadorCompleto
  extends Trabajador,
    UserRecordWithoutToJSON {
  displayName: string;
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

type TResultGetTrabajadorByDni = Prisma.TrabajadorGetPayload<{
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
export abstract class ITrabajadorDatabaseService {
  abstract crearTrabajador(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean>;

  abstract createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ): Promise<any>;

  abstract actualizarTrabajadoresLote(modificaciones: any[]): Promise<any>;

  abstract getTrabajadoresOmne(): Promise<any[]>;

  abstract updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ): Promise<{ updated: number }>;

  abstract updateManyContratos(
    contratosModificaciones: Array<{
      contratoId: string;
      horasContrato: number;
    }>,
  ): Promise<
    {
      id: string;
      fechaAlta: Date;
      horasContrato: number;
      inicioContrato: Date;
      finalContrato: Date | null;
      fechaAntiguedad: Date;
      fechaBaja: Date | null;
      idTrabajador: number;
    }[]
  >;

  abstract deleteManyTrabajadores(
    dnis: { dni: string }[],
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;

  abstract normalizarDNIs(): Prisma.PrismaPromise<number>;

  abstract getTrabajadoresPorDNI(dnisArray: string[]): Promise<Trabajador[]>;

  abstract getAllTrabajadores(include: TIncludeTrabajador): Promise<any[]>;

  abstract crearTrabajadorOmne(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean>;

  abstract getTrabajadorByAppId(uid: string): Promise<Trabajador | null>;

  abstract crearTrabajadorInterno(
    trabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador>;

  abstract getTrabajadorBySqlId(
    id: number,
  ): Promise<TResultGetTrabajadorBySqlId>;

  abstract getTrabajadorByDni(dni: string): Promise<TResultGetTrabajadorByDni>;

  abstract getTrabajadores(): Promise<TGetTrabajadores>;

  abstract getTrabajadorTokenQR(
    idTrabajador: number,
    tokenQR: string,
  ): Promise<any>;

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

  abstract isValidDate(value: string): boolean;

  abstract isValidUsuario(usuario: any): boolean;

  abstract setIdApp(idSql: number, uid: string): Promise<any>;

  abstract actualizarUsuarios(
    usuariosNuevos: any[],
    modificarEnApp: any[],
  ): Promise<any>;

  abstract eliminarUsuarios(usuariosAEliminar: any[]): Promise<any>;

  abstract getResponsableTienda(idTienda: number): Promise<any>;

  abstract sqlHandleCambios(
    modificado: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  ): Promise<any>;

  abstract guardarCambiosForm(
    trabajador: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  ): Promise<any>;

  abstract getNivelMenosUno(idSql: number): Promise<any>;

  abstract getNivelUno(idSql: number): Promise<any>;

  abstract getNivelCero(idSql: number): Promise<any>;

  abstract borrarTrabajador(idSql: number): Promise<any>;

  abstract getCoordinadoras(): Promise<any>;

  abstract uploadFoto(displayFoto: string, uid: string): Promise<any>;

  abstract deleteTrabajador(idSql: number): Promise<any>;

  abstract borrarConFechaBaja(): Promise<any>;

  abstract findTrabajadorByEmailLike(email: string): Promise<any>;
}
