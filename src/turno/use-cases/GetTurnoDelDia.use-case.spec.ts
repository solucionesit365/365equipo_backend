import { Test, TestingModule } from '@nestjs/testing';
import { GetTurnoDelDiaUseCase } from './GetTurnoDelDia.use-case';
import { ITurnoRepository } from '../repository/interfaces/turno.repository.interface';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('GetTurnoDelDiaUseCase', () => {
  let useCase: GetTurnoDelDiaUseCase;
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
        GetTurnoDelDiaUseCase,
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTurnoDelDiaUseCase>(GetTurnoDelDiaUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería llamar al repositorio con parámetros correctos', async () => {
      const idTrabajador = 1;
      const fecha = DateTime.fromISO('2024-01-15T10:30:00');
      const fechaInicio = fecha.startOf('day');
      const fechaFinal = fecha.endOf('day');

      const expectedTurno = {
        id: 'turno-1',
        inicio: new Date('2024-01-15T08:00:00'),
        final: new Date('2024-01-15T16:00:00'),
        tiendaId: 1,
        idTrabajador: 1,
        borrable: true,
      };

      mockTurnoRepository.getTurnoDelDia.mockResolvedValue(expectedTurno as any);

      const result = await useCase.execute(idTrabajador, fecha);

      expect(mockTurnoRepository.getTurnoDelDia).toHaveBeenCalledWith(
        idTrabajador,
        fechaInicio,
        fechaFinal
      );

      expect(result).toBe(expectedTurno);
    });

    it('debería manejar cuando no se encuentra turno', async () => {
      const idTrabajador = 1;
      const fecha = DateTime.fromISO('2024-01-15T10:30:00');

      mockTurnoRepository.getTurnoDelDia.mockResolvedValue(null);

      const result = await useCase.execute(idTrabajador, fecha);

      expect(result).toBeNull();
    });

    it('debería funcionar con diferentes horas del mismo día', async () => {
      const idTrabajador = 1;
      const fechaMorning = DateTime.fromISO('2024-01-15T06:00:00');
      const fechaEvening = DateTime.fromISO('2024-01-15T23:30:00');

      const expectedTurno = {
        id: 'turno-1',
        inicio: new Date('2024-01-15T08:00:00'),
        final: new Date('2024-01-15T16:00:00'),
        tiendaId: 1,
        idTrabajador: 1,
        borrable: true,
      };

      mockTurnoRepository.getTurnoDelDia.mockResolvedValue(expectedTurno as any);

      await useCase.execute(idTrabajador, fechaMorning);
      expect(mockTurnoRepository.getTurnoDelDia).toHaveBeenCalledWith(
        idTrabajador,
        fechaMorning.startOf('day'),
        fechaMorning.endOf('day')
      );

      await useCase.execute(idTrabajador, fechaEvening);
      expect(mockTurnoRepository.getTurnoDelDia).toHaveBeenCalledWith(
        idTrabajador,
        fechaEvening.startOf('day'),
        fechaEvening.endOf('day')
      );

      // Ambos deberían tener el mismo inicio y fin de día
      expect(fechaMorning.startOf('day').toISO()).toBe(fechaEvening.startOf('day').toISO());
      expect(fechaMorning.endOf('day').toISO()).toBe(fechaEvening.endOf('day').toISO());
    });
  });
});