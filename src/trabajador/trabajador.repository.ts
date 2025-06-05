import { Injectable } from "@nestjs/common";
import { CreateTrabajadorRequestDto } from "./trabajador.dto";
import {
  ITrabajadorRepository,
  ITrabajadorRepositoryDatabase,
  TIncludeTrabajador,
} from "./trabajador.interface";
import { Prisma, Trabajador } from "@prisma/client";
import { DateTime } from "luxon";

@Injectable()
export class TrabajadorRepository implements ITrabajadorRepository {
  constructor(
    private readonly schTrabajadores: ITrabajadorRepositoryDatabase,
  ) {}

  crearTrabajador(reqTrabajador: CreateTrabajadorRequestDto) {
    return this.schTrabajadores.crearTrabajador(reqTrabajador);
  }

  async getTrabajadoresModificadosOmne() {
    const trabajadoresRaw = await this.schTrabajadores.getTrabajadoresOmne();
    return this.crearArrayTrabajadores(trabajadoresRaw);
  }

  crearArrayTrabajadores(trabajadoresRaw: any): any[] {
    return trabajadoresRaw.flatMap((empresa: any) => {
      if (empresa.trabajadores && Array.isArray(empresa.trabajadores)) {
        return empresa.trabajadores.map((trabajador: any) => {
          // Convertir documento a string, pasar a mayúsculas y quitar espacios
          const documentoNormalizado = String(trabajador.documento)
            .toUpperCase()
            .replace(/\s+/g, "");
          return {
            ...trabajador,
            documento: documentoNormalizado,
            empresaID: empresa.empresaID,
          };
        });
      }
      return [];
    });
  }

  getAllTrabajadores(include: TIncludeTrabajador) {
    return this.schTrabajadores.getAllTrabajadores(include);
  }

  // Update Many con diferentes valores a modificar
  updateManyTrabajadores(
    modificaciones: {
      dni: string;
      cambios: Omit<Prisma.TrabajadorUpdateInput, "contratos">;
      nuevoContrato: Prisma.Contrato2CreateInput;
    }[],
  ) {
    return this.schTrabajadores.actualizarTrabajadoresLote(modificaciones);
  }

  createManyTrabajadores(
    arrayNuevosTrabajadores: Prisma.TrabajadorCreateInput[],
  ) {
    return this.schTrabajadores.createManyTrabajadores(arrayNuevosTrabajadores);
  }

  deleteManyTrabajadores(dnis: { dni: string }[]) {
    return this.schTrabajadores.deleteManyTrabajadores(dnis);
  }

  limpiarTrabajadoresConFinalContrato() {
    return this.schTrabajadores.borrarConFechaBaja();
  }

  eliminarTrabajador(idSql: number) {
    return this.schTrabajadores.deleteTrabajador(idSql);
  }

  getTrabajadorByAppId(uid: string) {
    return this.schTrabajadores.getTrabajadorByAppId(uid);
  }

  getTrabajadoresByTienda(idTienda: number) {
    return this.schTrabajadores.getTrabajadoresByTienda(idTienda);
  }

  getTrabajadorBySqlId(id: number) {
    return this.schTrabajadores.getTrabajadorBySqlId(id);
  }

  /* Usuarios que no vienen de HIT */
  crearUsuarioInterno(trabajador: Prisma.TrabajadorCreateInput) {
    return this.schTrabajadores.crearTrabajadorInterno(trabajador);
  }

  updateTrabajador(
    idTrabajador: number,
    payload: Prisma.TrabajadorUpdateInput,
  ): Promise<Trabajador> {
    return this.schTrabajadores.updateTrabajador(idTrabajador, payload);
  }

  async getTrabajadores() {
    const arrayTrabajadores = await this.schTrabajadores.getTrabajadores();

    if (arrayTrabajadores) return arrayTrabajadores;
    return [];
  }

  getSubordinadosConTienda(idAppResponsable: string) {
    return this.schTrabajadores.getSubordinadosConTienda(idAppResponsable);
  }

  getTrabajadorByDni(dni: string) {
    return this.schTrabajadores.getTrabajadorByDni(dni);
  }

  async getSubordinadosConTiendaPorId(idResponsable: number) {
    return await this.schTrabajadores.getSubordinadosConTiendaPorId(
      idResponsable,
    );
  }

  async esCoordinadoraPorId(id: number) {
    return await this.schTrabajadores.esCoordinadoraPorId(id);
  }

  async getSubordinadosByIdsql(id: number) {
    return await this.schTrabajadores.getSubordinadosByIdsql(id);
  }

  async esCoordinadora(uid: string): Promise<boolean> {
    return await this.schTrabajadores.esCoordinadora(uid);
  }

  async getSubordinados(uid: string) {
    return await this.schTrabajadores.getSubordinados(uid);
  }

  async getSubordinadosById(id: number, conFecha?: DateTime) {
    return await this.schTrabajadores.getSubordinadosById(id, conFecha);
  }

  async getSubordinadosByIdNew(id: number, conFecha?: DateTime) {
    return await this.schTrabajadores.getSubordinadosByIdNew(id, conFecha);
  }

  async getTrabajadorTokenQR(idTrabajador: number, tokenQR: string) {
    const resUser = await this.schTrabajadores.getTrabajadorTokenQR(
      idTrabajador,
      tokenQR,
    );

    if (resUser) return resUser;
    throw Error("No se ha podido obtener la información del usuario");
  }

  borrarTrabajadorDeSql(idSql: number) {
    return this.schTrabajadores.borrarTrabajador(idSql);
  }
}
