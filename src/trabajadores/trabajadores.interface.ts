import { UserRecord } from "firebase-admin/auth";
import { Prisma, Trabajador } from "@prisma/client";
import {
  CreateTrabajadorRequestDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";
import { DateTime } from "luxon";

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
        fechaBaja: null; // Para contratos aún vigentes
      };
      orderBy: {
        fechaAlta: "desc"; // Ordena por la fecha más reciente
      };
      take: 1; // Toma solo el contrato más reciente
    };
    responsable: true;
    tienda: true;
    roles: true;
    permisos: true;
    empresa: true;
  };
}>[];

export interface ITrabajadorDatabaseService {
  crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto): Promise<boolean>;
  createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ): Promise<any>;
  actualizarTrabajadoresLote(modificaciones: any[]): Promise<any>;
  getTrabajadoresOmne(): Promise<any[]>;
  updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ): Promise<{ updated: number }>;
  updateManyContratos(
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
  deleteManyTrabajadores(
    dnis: { dni: string }[],
  ): Prisma.PrismaPromise<Prisma.BatchPayload>;
  normalizarDNIs(): Prisma.PrismaPromise<number>;
  getTrabajadoresPorDNI(dnisArray: string[]): Promise<Trabajador[]>;
  getAllTrabajadores(include: TIncludeTrabajador): Promise<any[]>;
  crearTrabajadorOmne(
    reqTrabajador: CreateTrabajadorRequestDto,
  ): Promise<boolean>;
  getTrabajadorByAppId(uid: string): Promise<Trabajador | null>;
  crearTrabajadorInterno(
    trabajador: Prisma.TrabajadorCreateInput,
  ): Promise<Trabajador>;
  getTrabajadorBySqlId(id: number): Promise<TResultGetTrabajadorBySqlId>;
  getTrabajadorByDni(dni: string): Promise<TResultGetTrabajadorByDni>;
  getTrabajadores(): Promise<TGetTrabajadores>;
  getTrabajadorTokenQR(idTrabajador: number, tokenQR: string);
  getTrabajadoresByTienda(idTienda: number);
  getSubordinadosConTienda(idAppResponsable: string);
  esCoordinadora(uid: string);
  esCoordinadoraPorId(id: number);
  getSubordinados(idApp: string);
  getSubordinadosById(id: number, conFecha?: DateTime);
  getSubordinadosConTiendaPorId(idResponsable: number);
  getSubordinadosByIdsql(id: number);
  getSubordinadosByIdNew(id: number, conFecha?: DateTime);
  isValidDate(value: string);
  isValidUsuario(usuario: any);
  setIdApp(idSql: number, uid: string);
  actualizarUsuarios(usuariosNuevos: any[], modificarEnApp: any[]);
  eliminarUsuarios(usuariosAEliminar: any[]);
  getResponsableTienda(idTienda: number);
  sqlHandleCambios(
    modificado: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  );
  guardarCambiosForm(
    trabajador: TrabajadorFormRequest,
    original: TrabajadorFormRequest,
  );
  getNivelMenosUno(idSql: number);
  getNivelUno(idSql: number);
  getNivelCero(idSql: number);
  borrarTrabajador(idSql: number);
  getCoordinadoras();
  uploadFoto(displayFoto: string, uid: string);
  deleteTrabajador(idSql: number);
  borrarConFechaBaja();
  findTrabajadorByEmailLike(email: string);
}

export interface TIncludeTrabajador {
  contratos?: boolean;
  responsable?: boolean;
  tienda?: boolean;
  roles?: boolean;
  permisos?: boolean;
  empresa?: boolean;
}
