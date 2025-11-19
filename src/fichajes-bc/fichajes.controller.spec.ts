import { Test, TestingModule } from '@nestjs/testing';
import { FichajesController } from './fichajes.controller';
import { Fichajes } from './fichajes.class';
import { TrabajadorService } from '../trabajadores/trabajadores.class';
import { Notificaciones } from '../notificaciones/notificaciones.class';
import { AuthGuard } from '../guards/auth.guard';
import { SchedulerGuard } from '../guards/scheduler.guard';
import { UserRecord } from 'firebase-admin/auth';
import { Trabajador } from '@prisma/client';
import 'reflect-metadata';

describe('FichajesController - sinValidar con trabajadores externos', () => {
  let controller: FichajesController;
  let mockFichajesService: jest.Mocked<Fichajes>;
  let mockTrabajadorService: jest.Mocked<TrabajadorService>;

  beforeEach(async () => {
    mockFichajesService = {
      getParesSinValidar: jest.fn(),
      nuevaEntrada: jest.fn(),
      nuevaSalida: jest.fn(),
      nuevoInicioDescanso: jest.fn(),
      nuevoFinalDescanso: jest.fn(),
      getEstado: jest.fn(),
      getTiempoDescansoTotalDia: jest.fn(),
      getInicioFichaje: jest.fn(),
      sincroFichajes: jest.fn(),
      fusionarFichajesBC: jest.fn(),
      getNominas: jest.fn(),
      getFichajesByIdSql: jest.fn(),
      getFichajesByUid: jest.fn(),
      getFichajesByUidInverso: jest.fn(),
      updateFichaje: jest.fn(),
      hayFichajesPendientes: jest.fn(),
      validarFichajesAntiguos: jest.fn(),
      getFichajes: jest.fn(),
      obtenerParesTrabajador: jest.fn(),
      ordenarPorHora: jest.fn(),
      getAllFichajes: jest.fn(),
      setAllFichajes: jest.fn(),
    } as any;

    mockTrabajadorService = {
      getSubordinados: jest.fn(),
      getTrabajadorByAppId: jest.fn(),
      getTrabajadores: jest.fn(),
      getTrabajadorBySqlId: jest.fn(),
      crearUsuarioInterno: jest.fn(),
      getSubordinadosConTienda: jest.fn(),
      getSubordinadosConTiendaPorId: jest.fn(),
      esCoordinadoraPorId: jest.fn(),
      getSubordinadosByIdsql: jest.fn(),
      esCoordinadora: jest.fn(),
      esCoordinadora2: jest.fn(),
      getSubordinadosById: jest.fn(),
      getSubordinadosByIdNew: jest.fn(),
      getTrabajadorTokenQR: jest.fn(),
      registrarUsuario: jest.fn(),
    } as any;

    const mockNotificaciones = {
      sendNotificationToDevice: jest.fn(),
      getFCMToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichajesController],
      providers: [
        {
          provide: Fichajes,
          useValue: mockFichajesService,
        },
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
        {
          provide: Notificaciones,
          useValue: mockNotificaciones,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SchedulerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FichajesController>(FichajesController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getSinValidar', () => {
    const mockUser: UserRecord = {
      uid: 'test-uid-coordinador',
      email: 'coordinador@test.com',
      emailVerified: true,
      displayName: 'Coordinador Test',
      photoURL: null,
      disabled: false,
      metadata: {
        creationTime: new Date().toUTCString(),
        lastSignInTime: new Date().toUTCString(),
        toJSON: () => ({}),
      },
      providerData: [],
      toJSON: () => ({}),
    };

    const subordinado1: Trabajador = {
      id: 1,
      idApp: 'uid-subordinado-1',
      nombreApellidos: 'Subordinado 1',
      dni: '11111111A',
      emails: 'sub1@test.com',
      displayName: 'Sub 1',
      direccion: null,
      ciudad: null,
      telefonos: null,
      fechaNacimiento: null,
      nacionalidad: null,
      nSeguridadSocial: null,
      codigoPostal: null,
      cuentaCorriente: null,
      tipoTrabajador: 'Dependienta',
      idResponsable: 100,
      idTienda: 4014,
      llevaEquipo: false,
      tokenQR: null,
      displayFoto: null,
      excedencia: false,
      dispositivo: null,
      empresaId: null,
      esTienda: false,
      nPerceptor: null,
      workEmail: null,
      isPermanent: false,
    };

    const coordinador: Trabajador = {
      ...subordinado1,
      id: 100,
      idApp: 'test-uid-coordinador',
      nombreApellidos: 'Coordinador Test',
      dni: '00000000X',
      idTienda: 4014,
      idResponsable: null,
    };

    it('debería llamar a getParesSinValidar con el idTienda del coordinador', async () => {
      const subordinados = [subordinado1];
      const paresFichajes = [];

      mockTrabajadorService.getSubordinados.mockResolvedValue(subordinados as any);
      mockTrabajadorService.getTrabajadorByAppId.mockResolvedValue(coordinador as any);
      mockFichajesService.getParesSinValidar.mockResolvedValue(paresFichajes);

      const result = await controller.getSinValidar(undefined, mockUser);

      expect(mockTrabajadorService.getSubordinados).toHaveBeenCalledWith(mockUser.uid);
      expect(mockTrabajadorService.getTrabajadorByAppId).toHaveBeenCalledWith(mockUser.uid);
      expect(mockFichajesService.getParesSinValidar).toHaveBeenCalledWith(
        subordinados,
        coordinador.idTienda,
      );
      expect(result).toEqual({
        ok: true,
        data: paresFichajes,
      });
    });

    it('debería usar el UID proporcionado en lugar del usuario actual', async () => {
      const uidCoordinadoraA = 'uid-coordinadora-a';
      const coordinadoraA: Trabajador = {
        ...coordinador,
        idApp: uidCoordinadoraA,
      };
      const subordinados = [subordinado1];
      const paresFichajes = [];

      mockTrabajadorService.getSubordinados.mockResolvedValue(subordinados as any);
      mockTrabajadorService.getTrabajadorByAppId.mockResolvedValue(coordinadoraA as any);
      mockFichajesService.getParesSinValidar.mockResolvedValue(paresFichajes);

      await controller.getSinValidar(uidCoordinadoraA, mockUser);

      expect(mockTrabajadorService.getSubordinados).toHaveBeenCalledWith(uidCoordinadoraA);
      expect(mockTrabajadorService.getTrabajadorByAppId).toHaveBeenCalledWith(
        uidCoordinadoraA,
      );
      expect(mockFichajesService.getParesSinValidar).toHaveBeenCalledWith(
        subordinados,
        coordinadoraA.idTienda,
      );
    });

    it('debería pasar undefined como idTienda cuando el coordinador no tiene tienda asignada', async () => {
      const coordinadorSinTienda: Trabajador = {
        ...coordinador,
        idTienda: null,
      };
      const subordinados = [subordinado1];
      const paresFichajes = [];

      mockTrabajadorService.getSubordinados.mockResolvedValue(subordinados as any);
      mockTrabajadorService.getTrabajadorByAppId.mockResolvedValue(coordinadorSinTienda as any);
      mockFichajesService.getParesSinValidar.mockResolvedValue(paresFichajes);

      await controller.getSinValidar(undefined, mockUser);

      expect(mockFichajesService.getParesSinValidar).toHaveBeenCalledWith(subordinados, null);
    });

    it('debería manejar errores correctamente', async () => {
      const errorMessage = 'Error al obtener subordinados';
      mockTrabajadorService.getSubordinados.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getSinValidar(undefined, mockUser);

      expect(result).toEqual({
        ok: false,
        message: errorMessage,
      });
    });

    it('debería manejar cuando no hay subordinados', async () => {
      const subordinados: Trabajador[] = [];
      const paresFichajes = [];

      mockTrabajadorService.getSubordinados.mockResolvedValue(subordinados as any);
      mockTrabajadorService.getTrabajadorByAppId.mockResolvedValue(coordinador as any);
      mockFichajesService.getParesSinValidar.mockResolvedValue(paresFichajes);

      const result = await controller.getSinValidar(undefined, mockUser);

      expect(mockFichajesService.getParesSinValidar).toHaveBeenCalledWith([], coordinador.idTienda);
      expect(result).toEqual({
        ok: true,
        data: paresFichajes,
      });
    });

    it('debería incluir trabajadores externos en la respuesta cuando hay turnos en la tienda', async () => {
      const subordinados = [subordinado1];
      const paresFichajes = [
        {
          entrada: { idTrabajador: 1 },
          salida: { idTrabajador: 1 },
          cuadrante: {},
        },
        {
          entrada: { idTrabajador: 999 }, // Trabajador externo
          salida: { idTrabajador: 999 },
          cuadrante: {},
        },
      ];

      mockTrabajadorService.getSubordinados.mockResolvedValue(subordinados as any);
      mockTrabajadorService.getTrabajadorByAppId.mockResolvedValue(coordinador as any);
      mockFichajesService.getParesSinValidar.mockResolvedValue(paresFichajes as any);

      const result = await controller.getSinValidar(undefined, mockUser);

      expect(result).toEqual({
        ok: true,
        data: paresFichajes,
      });
      expect(result.data.length).toBe(2);
    });
  });
});
