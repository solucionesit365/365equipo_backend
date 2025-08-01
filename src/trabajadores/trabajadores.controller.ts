import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  InternalServerErrorException,
} from "@nestjs/common";
import { SchedulerGuard } from "../guards/scheduler.guard";
import { TrabajadorService } from "./trabajadores.class";
import { AuthGuard } from "../guards/auth.guard";
import { Roles } from "../decorators/role.decorator";
import { User } from "../decorators/get-user.decorator";
import { UserRecord } from "firebase-admin/auth";
import { Prisma } from "@prisma/client";
import pMap from "p-map";
import {
  CreateTrabajadorRequestDto,
  DeleteTrabajadorDto,
  GetSubordinadosByIdDto,
  GetSubordinadosDto,
  GetTrabajadorBySqlIdDto,
  PermitirRegistroDto,
  RegisterDto,
  TrabajadorFormRequest,
} from "./trabajadores.dto";

import { RoleGuard } from "../guards/role.guard";
import { LoggerService } from "src/logger/logger.service";

// Función auxiliar para dividir arrays en chunks pequeños
function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

@Controller("trabajadores")
export class TrabajadoresController {
  constructor(
    private readonly trabajadorInstance: TrabajadorService,
    private readonly loggerService: LoggerService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getTrabajadores() {
    const arrayTrabajadores = await this.trabajadorInstance.getTrabajadores();

    return arrayTrabajadores.map((trabajador) => {
      return {
        ...trabajador,
        inicioContrato:
          trabajador.contratos[0].inicioContrato.toLocaleDateString(),
      };
    });
  }

  @UseGuards(SchedulerGuard)
  @Get("sincroTrabajadoresOmne")
  async sincroTrabajadoresOmne() {
    const trabajadoresOmne =
      await this.trabajadorInstance.getTrabajadoresModificadosOmne();

    const trabajadoresApp = (await this.trabajadorInstance.getAllTrabajadores({
      contratos: true,
    })) as Array<Prisma.TrabajadorGetPayload<{ include: { contratos: true } }>>;

    const cambiosDetectados =
      await this.trabajadorInstance.getCambiosDetectados(
        trabajadoresApp,
        trabajadoresOmne,
      );

    const BATCH_SIZE = 50;

    // Procesa updates en lotes pequeños
    await pMap(
      chunkArray(cambiosDetectados.modificar, BATCH_SIZE),
      async (batch) => {
        await this.trabajadorInstance.updateManyTrabajadores(
          batch.map((modificacion) => ({
            dni: modificacion.dni,
            cambios: modificacion.cambios,
            nuevoContrato: {
              ...modificacion.contrato,
            },
          })) as any,
        );
      },
      { concurrency: 2 },
    );

    // Procesa deletes en lotes pequeños
    await pMap(
      chunkArray(cambiosDetectados.eliminar, BATCH_SIZE),
      async (batch) => {
        await this.trabajadorInstance.deleteManyTrabajadores(batch);
      },
      { concurrency: 2 },
    );

    // Procesa creates en lotes pequeños
    await pMap(
      chunkArray(cambiosDetectados.crear, BATCH_SIZE),
      async (batch) => {
        await this.trabajadorInstance.createManyTrabajadores(batch);
      },
      { concurrency: 2 },
    );

    return {
      message: "Sincronización completada exitosamente",
      resumen: {
        modificados: cambiosDetectados.modificar.length,
        eliminados: cambiosDetectados.eliminar.length,
        creados: cambiosDetectados.crear.length,
      },
    };
  }

  @UseGuards(SchedulerGuard)
  @Post("limpiezaTrabajadores")
  async limpiezaTrabajadores() {
    return await this.trabajadorInstance.limpiarTrabajadoresConFinalContrato();
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadorByAppId")
  async getTrabajadorByAppId(@Query() { uid }) {
    try {
      const resUser = await this.trabajadorInstance.getTrabajadorByAppId(uid);

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadorBySqlId")
  async getTrabajadorBySqlId(@Query() req: GetTrabajadorBySqlIdDto) {
    // Fallo de seguridad grave, se introduce el uid desde el frontend. Añadir si tiene rol para acceder a ese usuario
    return await this.trabajadorInstance.getTrabajadorBySqlId(Number(req.id));
  }

  @UseGuards(AuthGuard)
  @Get("getMyOwnWorker")
  async getMyOwnWorker(@User() user: UserRecord) {
    // Fallo de seguridad grave, se introduce el uid desde el frontend. Añadir si tiene rol para acceder a ese usuario
    return await this.trabajadorInstance.getTrabajadorByAppId(user.uid);
  }

  @UseGuards(AuthGuard)
  @Get("getTrabajadoresByTienda")
  async getTrabajadoresByTienda(@Query() { idTienda }) {
    try {
      const resUser = await this.trabajadorInstance.getTrabajadoresByTienda(
        Number(idTienda),
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Get("validarQR")
  async validarQRTrabajador(@Query() { idTrabajador, tokenQR }) {
    try {
      if (!idTrabajador && !tokenQR) throw Error("Faltan datos");
      const resUser = await this.trabajadorInstance.getTrabajadorTokenQR(
        Number(idTrabajador),
        tokenQR,
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getSubordinados")
  async getSubordinados(@Query() req: GetSubordinadosDto) {
    const resUser = await this.trabajadorInstance.getSubordinados(req.uid);

    return { ok: true, data: resUser };
  }

  @UseGuards(AuthGuard)
  @Get("getSubordinadosById")
  async getSubordinadoById(@Query() req: GetSubordinadosByIdDto) {
    return this.trabajadorInstance.getSubordinadosById(req.idResponsable);
  }

  @UseGuards(AuthGuard)
  @Get("actualizarTrabajadores")
  async actualizarTrabajadores() {
    try {
      return {
        ok: true,
        // data: await this.trabajadorInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Get("sincronizarConHit")
  async sincronizarConHit() {
    try {
      return {
        ok: true,
        // data: await this.trabajadorInstance.sincronizarConHit(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @Post("registro")
  async registroUsuarios(@Body() req: RegisterDto) {
    try {
      if (req.password.length < 6)
        throw Error("Algunos parámetros no son correctos");

      return {
        ok: true,
        data: await this.trabajadorInstance.registrarUsuario(
          req.dni,
          req.password,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("normalizarDNIs")
  async normalizarDNIs() {
    try {
      await this.trabajadorInstance.normalizarDNIs();
      return;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(
        "Error al normalizar los DNIs de los trabajadores",
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post("guardarCambios")
  async guardarCambiosForm(
    @Body("original")
    original: TrabajadorFormRequest,
    @Body("modificado")
    modificado: TrabajadorFormRequest,
    // @User() firebaseUser: UserRecord,
    @User() user: UserRecord,
  ) {
    try {
      const usuarioCompleto =
        await this.trabajadorInstance.getTrabajadorByAppId(user.uid);
      const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;
      // Registro de auditoría
      await this.loggerService.create({
        action: "Actualizar Trabajador",
        name: nombreUsuario,
        extraData: {
          originalData: original,
          modifiedData: modificado,
        },
      });
      return {
        ok: true,
        data: await this.trabajadorInstance.guardarCambiosForm(
          original,
          // firebaseUser,
          modificado,
        ),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("arbolById")
  async getArbolById(@Query() { idSql }: { idSql: string }) {
    try {
      if (!idSql) throw Error("Faltan parámetros");

      return {
        ok: true,
        data: await this.trabajadorInstance.getArbolById(Number(idSql)),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getAllCoordis")
  async getAllCoordis() {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.getCoordis(),
      };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Get("getSubordinadosByIdsql")
  async getSubordinadosByIdsql(@Query() { idSql }: { idSql: string }) {
    try {
      if (!idSql) throw Error("Faltan datos");

      const resUser = await this.trabajadorInstance.getSubordinadosByIdsql(
        Number(idSql),
      );

      return { ok: true, data: resUser };
    } catch (err) {
      console.log(err);
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(AuthGuard)
  @Post("uploadFoto")
  async uploadFoto(@Body() { displayFoto, uid }) {
    try {
      return {
        ok: true,
        data: await this.trabajadorInstance.uploadFoto(displayFoto, uid),
      };
    } catch (error) {
      console.log(error);
      return { ok: false, message: error.message };
    }
  }

  // Faltan roles
  @UseGuards(AuthGuard)
  @Post("crear")
  async crearTrabajador(@Body() req: CreateTrabajadorRequestDto) {
    return await this.trabajadorInstance.crearTrabajador(req);
  }

  @Roles("Super_Admin", "RRHH_ADMIN")
  @UseGuards(AuthGuard, RoleGuard)
  @Post("eliminar")
  async eliminarTrabajador(
    @Body() req: DeleteTrabajadorDto,
    @User() user: UserRecord,
  ) {
    const trabajadorDelete = await this.trabajadorInstance.getTrabajadorBySqlId(
      req.id,
    );
    if (!trabajadorDelete) {
      throw new Error("Trabajador no encontrada");
    }

    // 3. Obtener el nombre del usuario autenticado
    const usuarioCompleto = await this.trabajadorInstance.getTrabajadorByAppId(
      user.uid,
    );
    const nombreUsuario = usuarioCompleto?.nombreApellidos || user.email;

    // 4. Registrar la auditoría con la información del trabajador eliminado
    await this.loggerService.create({
      action: "Eliminar Trabajador",
      name: nombreUsuario,
      extraData: { trabajadorData: trabajadorDelete },
    });

    return await this.trabajadorInstance.eliminarTrabajador(req.id);
  }

  @Roles("Super_Admin")
  @UseGuards(AuthGuard)
  @Get("listadoSanidad")
  async listadoSanidad() {
    const trabajadoresFull = await this.trabajadorInstance.getTrabajadores();
    const trabajadoresSanidad = trabajadoresFull.map((trabajador) => {
      return {
        id: trabajador.id,
        nombre: trabajador.nombreApellidos,
        dni: trabajador.dni,
        tienda: trabajador.tienda?.nombre,
      };
    });

    return trabajadoresSanidad;
  }

  @UseGuards(AuthGuard)
  @Post("postAutomatizaciones")
  async enviarEmailAuto(@Body() req: any, @User() user: UserRecord) {
    return await this.trabajadorInstance.enviarEmailAuto(req, user);
  }

  @UseGuards(AuthGuard)
  @Post("restaurar")
  async restaurarTrabajador(@Body() req: any) {
    if (req.empresaId) {
      req.idEmpresa = req.empresaId;
      delete req.empresaId;
    }

    return await this.trabajadorInstance.restaurarTrabajador(req);
  }
  @UseGuards(AuthGuard)
  @Post("validarCodigo")
  async validarCodigo(@Body() { codigoEmpleado }: { codigoEmpleado: string }) {
    try {
      if (!codigoEmpleado) {
        throw new Error("El código de empleado es obligatorio");
      }

      // Buscar trabajador por código de empleado (ID)
      const trabajador =
        await this.trabajadorInstance.getTrabajadorByCodigo(codigoEmpleado);

      if (!trabajador) {
        return { ok: false, message: "Código de empleado inválido" };
      }

      // Verificar si el trabajador tiene el rol de Coordinadora_A
      if (trabajador.roles[0].name !== "Coordinadora_A") {
        return { ok: false, message: "No tienes permisos para esta acción" };
      }

      return {
        ok: true,
        usuario: {
          idSql: trabajador.id,
          uid: trabajador.idApp,
          nombre: trabajador.nombreApellidos,
          rol: trabajador.roles[0].name,
        },
      };
    } catch (error) {
      console.error(error);
      return { ok: false, message: error.message };
    }
  }

  @UseGuards(SchedulerGuard)
  @Post("permitirRegistro")
  async permitirRegistro(@Body() req: PermitirRegistroDto) {
    return await this.trabajadorInstance.permitirRegistro(req.email);
  }

  @UseGuards(AuthGuard)
  @Post("cambiarTiendaEquipo")
  async cambiarTiendaEquipo(@Body() body: { id: number; tienda: number }) {
    const trabajador = await this.trabajadorInstance.getTrabajadorBySqlId(
      body.id,
    );
    if (!trabajador) throw new Error("Trabajador no encontrado");

    const original = await this.trabajadorInstance.getTrabajadorBySqlId(
      trabajador.id,
    );

    const originalForm: TrabajadorFormRequest = {
      ...original,
      arrayRoles: [],
      arrayPermisos: [],
    };

    const modificado: TrabajadorFormRequest = {
      ...originalForm,
      idTienda: body.tienda,
    };

    const resultado = await this.trabajadorInstance.guardarCambiosForm(
      originalForm,
      modificado,
    );

    return resultado;
  }
}
