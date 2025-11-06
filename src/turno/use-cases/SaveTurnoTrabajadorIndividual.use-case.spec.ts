import { Test, TestingModule } from '@nestjs/testing';
import { SaveTurnoTrabajadorIndividualUseCase } from './SaveTurnoTrabajadorIndividual.use-case';
import { ITurnoRepository } from '../repository/interfaces/turno.repository.interface';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('SaveTurnoTrabajadorIndividualUseCase', () => {
  let useCase: SaveTurnoTrabajadorIndividualUseCase;
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
        SaveTurnoTrabajadorIndividualUseCase,
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
      ],
    }).compile();

    useCase = module.get<SaveTurnoTrabajadorIndividualUseCase>(SaveTurnoTrabajadorIndividualUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería crear nuevos turnos para un día específico', async () => {
      const idTrabajador = 1;
      const dia = DateTime.fromISO('2024-01-01');

      const turnosBBDD = [];

      const turnos = [
        {
          id: 'tmp-new-1',
          inicio: DateTime.fromISO('2024-01-01T08:00:00'),
          final: DateTime.fromISO('2024-01-01T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
        {
          id: 'tmp-new-2',
          inicio: DateTime.fromISO('2024-01-01T17:00:00'),
          final: DateTime.fromISO('2024-01-01T21:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador
        .mockResolvedValueOnce(turnosBBDD as any)
        .mockResolvedValueOnce([
          {
            id: 'new-1',
            inicio: new Date('2024-01-01T08:00:00'),
            final: new Date('2024-01-01T16:00:00'),
            tiendaId: 1,
            idTrabajador: 1,
            borrable: true,
          },
          {
            id: 'new-2',
            inicio: new Date('2024-01-01T17:00:00'),
            final: new Date('2024-01-01T21:00:00'),
            tiendaId: 1,
            idTrabajador: 1,
            borrable: true,
          },
        ] as any);

      const result = await useCase.execute(idTrabajador, dia, turnos);

      expect(mockTurnoRepository.getTurnosPorTrabajador).toHaveBeenCalledWith(
        idTrabajador,
        dia.startOf('week')
      );
      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            idTrabajador: 1,
            tiendaId: 1,
          }),
        ])
      );
      expect(result).toHaveLength(2);
    });

    it('debería actualizar turnos existentes', async () => {
      const idTrabajador = 1;
      const dia = DateTime.fromISO('2024-01-01');

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

      const turnos = [
        {
          id: 'existing-1',
          inicio: DateTime.fromISO('2024-01-01T09:00:00'),
          final: DateTime.fromISO('2024-01-01T17:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador
        .mockResolvedValueOnce(turnosBBDD as any)
        .mockResolvedValueOnce([
          {
            ...turnosBBDD[0],
            inicio: new Date('2024-01-01T09:00:00'),
            final: new Date('2024-01-01T17:00:00'),
          },
        ] as any);

      await useCase.execute(idTrabajador, dia, turnos);

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
    });

    it('debería eliminar turnos que ya no están en la lista', async () => {
      const idTrabajador = 1;
      const dia = DateTime.fromISO('2024-01-01');

      const turnosBBDD = [
        {
          id: 'existing-1',
          inicio: new Date('2024-01-01T08:00:00'),
          final: new Date('2024-01-01T16:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
        {
          id: 'existing-2',
          inicio: new Date('2024-01-01T17:00:00'),
          final: new Date('2024-01-01T21:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
      ];

      const turnos = [
        {
          id: 'existing-1',
          inicio: DateTime.fromISO('2024-01-01T08:00:00'),
          final: DateTime.fromISO('2024-01-01T16:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador
        .mockResolvedValueOnce(turnosBBDD as any)
        .mockResolvedValueOnce([turnosBBDD[0]] as any);

      await useCase.execute(idTrabajador, dia, turnos);

      expect(mockTurnoRepository.deleteTurno).toHaveBeenCalledWith('existing-2');
    });

    it('debería manejar múltiples turnos en un día (crear, actualizar y eliminar)', async () => {
      const idTrabajador = 1;
      const dia = DateTime.fromISO('2024-01-01');

      const turnosBBDD = [
        {
          id: 'existing-1',
          inicio: new Date('2024-01-01T08:00:00'),
          final: new Date('2024-01-01T12:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
        {
          id: 'existing-2',
          inicio: new Date('2024-01-01T14:00:00'),
          final: new Date('2024-01-01T18:00:00'),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
        },
      ];

      const turnos = [
        // Actualizar existing-1
        {
          id: 'existing-1',
          inicio: DateTime.fromISO('2024-01-01T09:00:00'),
          final: DateTime.fromISO('2024-01-01T13:00:00'),
          tiendaId: 1,
          borrable: true,
        },
        // Agregar nuevo turno
        {
          id: 'tmp-new-1',
          inicio: DateTime.fromISO('2024-01-01T15:00:00'),
          final: DateTime.fromISO('2024-01-01T19:00:00'),
          tiendaId: 2,
          borrable: true,
        },
        // existing-2 no está en la lista, debería eliminarse
      ];

      mockTurnoRepository.getTurnosPorTrabajador
        .mockResolvedValueOnce(turnosBBDD as any)
        .mockResolvedValueOnce([
          {
            id: 'existing-1',
            inicio: new Date('2024-01-01T09:00:00'),
            final: new Date('2024-01-01T13:00:00'),
            tiendaId: 1,
            idTrabajador: 1,
            borrable: true,
          },
          {
            id: 'new-1',
            inicio: new Date('2024-01-01T15:00:00'),
            final: new Date('2024-01-01T19:00:00'),
            tiendaId: 2,
            idTrabajador: 1,
            borrable: true,
          },
        ] as any);

      const result = await useCase.execute(idTrabajador, dia, turnos);

      // Verificar que se eliminó el turno existing-2
      expect(mockTurnoRepository.deleteTurno).toHaveBeenCalledWith('existing-2');

      // Verificar que se actualizó el turno existing-1
      expect(mockTurnoRepository.updateManyTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'existing-1',
            idTrabajador: 1,
          }),
        ])
      );

      // Verificar que se creó el nuevo turno
      expect(mockTurnoRepository.createTurnos).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            idTrabajador: 1,
            tiendaId: 2,
          }),
        ])
      );

      expect(result).toHaveLength(2);
    });

    it('debería ignorar turnos vacíos (00:00 - 00:00)', async () => {
      const idTrabajador = 1;
      const dia = DateTime.fromISO('2024-01-01');

      const turnos = [
        {
          id: 'tmp-new-1',
          inicio: DateTime.fromISO('2024-01-01T00:00:00'),
          final: DateTime.fromISO('2024-01-01T00:00:00'),
          tiendaId: 1,
          borrable: true,
        },
      ];

      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      await useCase.execute(idTrabajador, dia, turnos);

      expect(mockTurnoRepository.createTurnos).not.toHaveBeenCalled();
      expect(mockTurnoRepository.updateManyTurnos).not.toHaveBeenCalled();
    });
  });
});
