import { Test, TestingModule } from '@nestjs/testing';
import { CopiarTurnosPorSemanaUseCase } from './CopiarTurnosPorSemana.use-case';
import { IGetTurnosEquipoCoordinadoraUseCase } from './interfaces/IGetTurnosEquipoCoordinadora.use-case';
import { ITurnoRepository } from '../repository/interfaces/turno.repository.interface';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('CopiarTurnosPorSemanaUseCase', () => {
  let useCase: CopiarTurnosPorSemanaUseCase;
  let mockGetTurnosEquipoCoordinadoraUseCase: jest.Mocked<IGetTurnosEquipoCoordinadoraUseCase>;
  let mockTurnoRepository: jest.Mocked<ITurnoRepository>;

  beforeEach(async () => {
    mockGetTurnosEquipoCoordinadoraUseCase = {
      execute: jest.fn(),
    };

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopiarTurnosPorSemanaUseCase,
        {
          provide: IGetTurnosEquipoCoordinadoraUseCase,
          useValue: mockGetTurnosEquipoCoordinadoraUseCase,
        },
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
      ],
    }).compile();

    useCase = module.get<CopiarTurnosPorSemanaUseCase>(CopiarTurnosPorSemanaUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería copiar turnos de la semana origen a la semana destino', async () => {
      const tiendaID = 1;
      const diaDeSemanaOrigen = DateTime.fromISO('2024-01-01');
      const diaDeSemanaDestino = DateTime.fromISO('2024-01-08');

      const turnosOrigen = [
        {
          id: 'turno-1',
          inicio: new Date('2024-01-01T08:00:00'),
          final: new Date('2024-01-01T16:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
        {
          id: 'turno-2',
          inicio: new Date('2024-01-02T08:00:00'),
          final: new Date('2024-01-02T16:00:00'),
          tiendaId: 1,
          idTrabajador: 2,
          borrable: true,
        },
      ];

      mockGetTurnosEquipoCoordinadoraUseCase.execute.mockResolvedValue(turnosOrigen as any);

      await useCase.execute(tiendaID, diaDeSemanaOrigen, diaDeSemanaDestino);

      expect(mockGetTurnosEquipoCoordinadoraUseCase.execute).toHaveBeenCalledWith(
        tiendaID,
        diaDeSemanaOrigen,
      );

      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            inicio: new Date('2024-01-08T08:00:00'),
            final: new Date('2024-01-08T16:00:00'),
            tiendaId: 1,
            idTrabajador: 1,
            borrable: true,
          }),
          expect.objectContaining({
            inicio: new Date('2024-01-09T08:00:00'),
            final: new Date('2024-01-09T16:00:00'),
            tiendaId: 1,
            idTrabajador: 2,
            borrable: true,
          }),
        ])
      );
    });

    it('debería manejar turnos vacíos de la semana origen', async () => {
      const tiendaID = 1;
      const diaDeSemanaOrigen = DateTime.fromISO('2024-01-01');
      const diaDeSemanaDestino = DateTime.fromISO('2024-01-08');

      mockGetTurnosEquipoCoordinadoraUseCase.execute.mockResolvedValue([]);

      await useCase.execute(tiendaID, diaDeSemanaOrigen, diaDeSemanaDestino);

      expect(mockGetTurnosEquipoCoordinadoraUseCase.execute).toHaveBeenCalledWith(
        tiendaID,
        diaDeSemanaOrigen,
      );

      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith([]);
    });

    it('debería calcular correctamente la diferencia de fechas para copiar', async () => {
      const tiendaID = 1;
      const diaDeSemanaOrigen = DateTime.fromISO('2024-01-01');
      const diaDeSemanaDestino = DateTime.fromISO('2024-01-15'); // 14 días después

      const turnosOrigen = [
        {
          id: 'turno-1',
          inicio: new Date('2024-01-01T08:00:00'),
          final: new Date('2024-01-01T16:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
      ];

      mockGetTurnosEquipoCoordinadoraUseCase.execute.mockResolvedValue(turnosOrigen as any);

      await useCase.execute(tiendaID, diaDeSemanaOrigen, diaDeSemanaDestino);

      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            inicio: new Date('2024-01-15T08:00:00'),
            final: new Date('2024-01-15T16:00:00'),
            tiendaId: 1,
            idTrabajador: 1,
            borrable: true,
          }),
        ])
      );
    });
  });
});