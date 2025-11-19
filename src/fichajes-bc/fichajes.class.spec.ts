import { Test, TestingModule } from '@nestjs/testing';
import { Fichajes } from './fichajes.class';
import { FichajesDatabase } from './fichajes.mongodb';
import { TrabajadorService } from '../trabajadores/trabajadores.class';
import { ITurnoRepository } from '../turno/repository/interfaces/turno.repository.interface';
import { IGetTurnoDelDiaUseCase } from '../turno/use-cases/interfaces/IGetTurnoDelDia.use-case';
import { DateTime } from 'luxon';
import { Trabajador, Turno } from '@prisma/client';
import { ObjectId } from 'mongodb';
import 'reflect-metadata';

describe('Fichajes - getParesSinValidar con trabajadores externos', () => {
  let fichajesService: Fichajes;
  let mockFichajesDatabase: jest.Mocked<FichajesDatabase>;
  let mockTrabajadorService: jest.Mocked<TrabajadorService>;
  let mockTurnoRepository: jest.Mocked<ITurnoRepository>;
  let mockGetTurnoDelDiaUseCase: jest.Mocked<IGetTurnoDelDiaUseCase>;

  beforeEach(async () => {
    mockFichajesDatabase = {
      getFichajesByIdSql: jest.fn(),
    } as any;

    mockTrabajadorService = {} as any;

    mockTurnoRepository = {
      createTurno: jest.fn(),
      createTurnos: jest.fn(),
      getTurnosPorTrabajador: jest.fn(),
      getTurnosPorTienda: jest.fn(),
      getTurnosPorEquipo: jest.fn(),
      deleteTurno: jest.fn(),
      updateManyTurnos: jest.fn(),
      getTurnoDelDia: jest.fn(),
    };

    mockGetTurnoDelDiaUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Fichajes,
        {
          provide: FichajesDatabase,
          useValue: mockFichajesDatabase,
        },
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
        {
          provide: IGetTurnoDelDiaUseCase,
          useValue: mockGetTurnoDelDiaUseCase,
        },
      ],
    }).compile();

    fichajesService = module.get<Fichajes>(Fichajes);
  });

  it('debería estar definido', () => {
    expect(fichajesService).toBeDefined();
  });

  describe('getParesSinValidar', () => {
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

    const subordinado2: Trabajador = {
      ...subordinado1,
      id: 2,
      idApp: 'uid-subordinado-2',
      nombreApellidos: 'Subordinado 2',
      dni: '22222222B',
    };

    const trabajadorExterno: Trabajador = {
      ...subordinado1,
      id: 999,
      idApp: 'uid-externo',
      nombreApellidos: 'Trabajador Externo',
      dni: '99999999Z',
      idTienda: 4015, // Pertenece a otra tienda
      idResponsable: 200, // Tiene otro responsable
    };

    const fichajeEntrada = {
      _id: new ObjectId(),
      hora: new Date('2025-11-10T08:00:00'),
      uid: 'uid-subordinado-1',
      tipo: 'ENTRADA' as const,
      validado: false,
      idExterno: 1,
      enviado: true,
      nombre: 'Subordinado 1',
      dni: '11111111A',
    };

    const fichajeSalida = {
      _id: new ObjectId(),
      hora: new Date('2025-11-10T17:00:00'),
      uid: 'uid-subordinado-1',
      tipo: 'SALIDA' as const,
      validado: false,
      idExterno: 1,
      enviado: true,
      nombre: 'Subordinado 1',
      dni: '11111111A',
    };

    const fichajeExternoEntrada = {
      _id: new ObjectId(),
      hora: new Date('2025-11-10T08:00:00'),
      uid: 'uid-externo',
      tipo: 'ENTRADA' as const,
      validado: false,
      idExterno: 999,
      enviado: true,
      nombre: 'Trabajador Externo',
      dni: '99999999Z',
    };

    const fichajeExternoSalida = {
      _id: new ObjectId(),
      hora: new Date('2025-11-10T17:00:00'),
      uid: 'uid-externo',
      tipo: 'SALIDA' as const,
      validado: false,
      idExterno: 999,
      enviado: true,
      nombre: 'Trabajador Externo',
      dni: '99999999Z',
    };

    const turnoSubordinado: Turno = {
      id: 'turno-1',
      inicio: new Date('2025-11-10T08:00:00'),
      final: new Date('2025-11-10T17:00:00'),
      tiendaId: 4014,
      idTrabajador: 1,
      borrable: true,
      bolsaHorasInicial: 0,
    };

    const turnoExterno: Turno = {
      id: 'turno-999',
      inicio: new Date('2025-11-10T08:00:00'),
      final: new Date('2025-11-10T17:00:00'),
      tiendaId: 4014,
      idTrabajador: 999,
      borrable: true,
      bolsaHorasInicial: 0,
    };

    it('debería incluir solo subordinados cuando no se proporciona idTienda', async () => {
      const subordinados = [subordinado1, subordinado2];

      mockFichajesDatabase.getFichajesByIdSql
        .mockResolvedValueOnce([fichajeEntrada, fichajeSalida] as any)
        .mockResolvedValueOnce([] as any);

      mockGetTurnoDelDiaUseCase.execute.mockResolvedValue(turnoSubordinado as any);

      const result = await fichajesService.getParesSinValidar(subordinados);

      expect(result).toHaveLength(1);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledTimes(2);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(1, false);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(2, false);
      expect(mockTurnoRepository.getTurnosPorTienda).not.toHaveBeenCalled();
    });

    it('debería incluir trabajadores externos que tienen turnos en la tienda', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      // Mock fichajes de subordinado
      mockFichajesDatabase.getFichajesByIdSql
        .mockResolvedValueOnce([fichajeEntrada, fichajeSalida] as any)
        .mockResolvedValueOnce([fichajeExternoEntrada, fichajeExternoSalida] as any);

      // Mock turnos por semana (últimas 3 semanas)
      mockTurnoRepository.getTurnosPorTienda
        .mockResolvedValueOnce([turnoSubordinado] as any) // Semana 1
        .mockResolvedValueOnce([turnoExterno] as any) // Semana 2
        .mockResolvedValueOnce([turnoSubordinado] as any) // Semana 3
        .mockResolvedValueOnce([turnoSubordinado] as any); // Semana actual

      mockGetTurnoDelDiaUseCase.execute
        .mockResolvedValueOnce(turnoSubordinado as any)
        .mockResolvedValueOnce(turnoExterno as any);

      const result = await fichajesService.getParesSinValidar(subordinados, idTienda);

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(mockTurnoRepository.getTurnosPorTienda).toHaveBeenCalled();
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(999, false);
    });

    it('no debería duplicar trabajadores que son subordinados Y tienen turnos', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      mockFichajesDatabase.getFichajesByIdSql.mockResolvedValueOnce(
        [fichajeEntrada, fichajeSalida] as any,
      );

      // El subordinado también tiene turnos en la tienda
      mockTurnoRepository.getTurnosPorTienda
        .mockResolvedValue([turnoSubordinado] as any);

      mockGetTurnoDelDiaUseCase.execute.mockResolvedValue(turnoSubordinado as any);

      const result = await fichajesService.getParesSinValidar(subordinados, idTienda);

      // Debe llamarse solo 1 vez por el subordinado, no 2 veces
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledTimes(1);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(1, false);
    });

    it('debería buscar turnos en las últimas 3 semanas', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      mockFichajesDatabase.getFichajesByIdSql.mockResolvedValue([] as any);
      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([] as any);

      await fichajesService.getParesSinValidar(subordinados, idTienda);

      // Debería llamar a getTurnosPorTienda 4 veces (4 semanas)
      expect(mockTurnoRepository.getTurnosPorTienda).toHaveBeenCalledTimes(4);
      expect(mockTurnoRepository.getTurnosPorTienda).toHaveBeenCalledWith(
        idTienda,
        expect.any(DateTime),
      );
    });

    it('debería manejar múltiples trabajadores externos correctamente', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      const trabajadorExterno2 = { ...trabajadorExterno, id: 888 };
      const turnoExterno2 = { ...turnoExterno, id: 'turno-888', idTrabajador: 888 };

      mockFichajesDatabase.getFichajesByIdSql
        .mockResolvedValueOnce([fichajeEntrada, fichajeSalida] as any) // Subordinado
        .mockResolvedValueOnce([fichajeExternoEntrada, fichajeExternoSalida] as any) // Externo 1
        .mockResolvedValueOnce([fichajeExternoEntrada, fichajeExternoSalida] as any); // Externo 2

      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([
        turnoSubordinado,
        turnoExterno,
        turnoExterno2,
      ] as any);

      mockGetTurnoDelDiaUseCase.execute
        .mockResolvedValueOnce(turnoSubordinado as any)
        .mockResolvedValueOnce(turnoExterno as any)
        .mockResolvedValueOnce(turnoExterno2 as any);

      const result = await fichajesService.getParesSinValidar(subordinados, idTienda);

      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(999, false);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(888, false);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('debería manejar correctamente cuando no hay trabajadores externos', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      mockFichajesDatabase.getFichajesByIdSql.mockResolvedValueOnce(
        [fichajeEntrada, fichajeSalida] as any,
      );

      // Solo turnos de subordinados, sin externos
      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([turnoSubordinado] as any);

      mockGetTurnoDelDiaUseCase.execute.mockResolvedValue(turnoSubordinado as any);

      const result = await fichajesService.getParesSinValidar(subordinados, idTienda);

      expect(result).toHaveLength(1);
      // Solo debe consultar fichajes del subordinado, no de externos
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledTimes(1);
    });

    it('debería manejar el caso cuando un trabajador externo no tiene fichajes', async () => {
      const subordinados = [subordinado1];
      const idTienda = 4014;

      mockFichajesDatabase.getFichajesByIdSql
        .mockResolvedValueOnce([fichajeEntrada, fichajeSalida] as any) // Subordinado
        .mockResolvedValueOnce([] as any); // Externo sin fichajes

      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([
        turnoSubordinado,
        turnoExterno,
      ] as any);

      mockGetTurnoDelDiaUseCase.execute.mockResolvedValue(turnoSubordinado as any);

      const result = await fichajesService.getParesSinValidar(subordinados, idTienda);

      // Debe incluir al subordinado pero no al externo sin fichajes
      expect(result).toHaveLength(1);
      expect(mockFichajesDatabase.getFichajesByIdSql).toHaveBeenCalledWith(999, false);
    });
  });
});
