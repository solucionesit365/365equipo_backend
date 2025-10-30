import { Test, TestingModule } from '@nestjs/testing';
import { SaveTurnosTrabajadorSemanalUseCase } from './SaveTurnosTrabajadorSemanal.use-case';
import { ITurnoRepository } from '../repository/interfaces/turno.repository.interface';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('SaveTurnosTrabajadorSemanalUseCase', () => {
  let useCase: SaveTurnosTrabajadorSemanalUseCase;
  let mockTurnoRepository: jest.Mocked<ITurnoRepository>;

  beforeEach(async () => {
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
        SaveTurnosTrabajadorSemanalUseCase,
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
      ],
    }).compile();

    useCase = module.get<SaveTurnosTrabajadorSemanalUseCase>(SaveTurnosTrabajadorSemanalUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería crear nuevos turnos y actualizar los existentes', async () => {
      const idTrabajador = 1;
      const inicioSemana = DateTime.fromISO('2024-01-01');

      const turnosBBDD = [
        {
          id: 'existing-1',
          inicio: new Date('2024-01-01T08:00:00'),
          final: new Date('2024-01-01T16:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
      ];

      const arrayTurnos = [
        {
          id: 'existing-1',
          inicio: DateTime.fromISO('2024-01-01T09:00:00'),
          final: DateTime.fromISO('2024-01-01T17:00:00'),
          tiendaId: 1,
          borrable: true,
        },
        {
          id: 'tmp-new-1',
          inicio: DateTime.fromISO('2024-01-02T08:00:00'),
          final: DateTime.fromISO('2024-01-02T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      const updatedTurnos = [...turnosBBDD, { id: 'new-1', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 1, borrable: true }];

      mockTurnoRepository.getTurnosPorTrabajador
        .mockResolvedValueOnce(turnosBBDD as any)
        .mockResolvedValueOnce(updatedTurnos as any);

      const result = await useCase.execute(idTrabajador, inicioSemana, arrayTurnos);

      expect(mockTurnoRepository.getTurnosPorTrabajador).toHaveBeenCalledWith(idTrabajador, inicioSemana);
      expect(mockTurnoRepository.getTurnosPorTrabajador).toHaveBeenCalledTimes(2);

      expect(mockTurnoRepository.updateManyTurnos).toHaveBeenCalledWith([
        {
          idTrabajador: 1,
          inicio: new Date('2024-01-01T09:00:00'),
          final: new Date('2024-01-01T17:00:00'),
          borrable: true,
          id: 'existing-1',
          tiendaId: 1,
          bolsaHorasInicial: 0,
        },
      ]);

      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith([
        {
          final: new Date('2024-01-02T16:00:00'),
          inicio: new Date('2024-01-02T08:00:00'),
          idTrabajador: 1,
          tiendaId: 1,
          borrable: true,
        },
      ]);

      expect(result).toBe(updatedTurnos);
    });

    it('debería manejar solo turnos nuevos', async () => {
      const idTrabajador = 1;
      const inicioSemana = DateTime.fromISO('2024-01-01');

      const arrayTurnos = [
        {
          id: 'tmp-new-1',
          inicio: DateTime.fromISO('2024-01-01T08:00:00'),
          final: DateTime.fromISO('2024-01-01T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
        {
          id: 'tmp-new-2',
          inicio: DateTime.fromISO('2024-01-02T08:00:00'),
          final: DateTime.fromISO('2024-01-02T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      await useCase.execute(idTrabajador, inicioSemana, arrayTurnos);

      expect(mockTurnoRepository.updateManyTurnos).not.toHaveBeenCalled();
      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            idTrabajador: 1,
            tiendaId: 1,
          }),
        ])
      );
    });

    it('debería manejar solo turnos existentes para actualizar', async () => {
      const idTrabajador = 1;
      const inicioSemana = DateTime.fromISO('2024-01-01');

      const arrayTurnos = [
        {
          id: 'existing-1',
          inicio: DateTime.fromISO('2024-01-01T08:00:00'),
          final: DateTime.fromISO('2024-01-01T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      await useCase.execute(idTrabajador, inicioSemana, arrayTurnos);

      expect(mockTurnoRepository.createTurnos).not.toHaveBeenCalled();
      expect(mockTurnoRepository.updateManyTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'existing-1',
            idTrabajador: 1,
          }),
        ])
      );
    });

    it('debería manejar array vacío de turnos', async () => {
      const idTrabajador = 1;
      const inicioSemana = DateTime.fromISO('2024-01-01');

      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      await useCase.execute(idTrabajador, inicioSemana, []);

      expect(mockTurnoRepository.updateManyTurnos).not.toHaveBeenCalled();
      expect(mockTurnoRepository.createTurnos).not.toHaveBeenCalled();
    });
  });
});