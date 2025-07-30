import { Test, TestingModule } from '@nestjs/testing';
import { GetTurnosEquipoCoordinadoraUseCase } from './GetTurnosEquipoCoordinadora.use-case';
import { ICoordinadoraRepository } from '../../coordinadora/repository/interfaces/ICoordinadora.repository';
import { ITurnoRepository } from '../repository/interfaces/turno.repository.interface';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('GetTurnosEquipoCoordinadoraUseCase', () => {
  let useCase: GetTurnosEquipoCoordinadoraUseCase;
  let mockCoordinadoraRepository: jest.Mocked<ICoordinadoraRepository>;
  let mockTurnoRepository: jest.Mocked<ITurnoRepository>;

  beforeEach(async () => {
    mockCoordinadoraRepository = {
      getCoordinadoraPorTienda: jest.fn(),
      getSubordinadosCoordinadora: jest.fn(),
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
        GetTurnosEquipoCoordinadoraUseCase,
        {
          provide: ICoordinadoraRepository,
          useValue: mockCoordinadoraRepository,
        },
        {
          provide: ITurnoRepository,
          useValue: mockTurnoRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetTurnosEquipoCoordinadoraUseCase>(GetTurnosEquipoCoordinadoraUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería retornar turnos únicos del equipo, tienda y coordinadora', async () => {
      const idTienda = 1;
      const fecha = DateTime.fromISO('2024-01-01');

      const coordinadora = {
        id: 10,
        idTienda: 1,
        nombre: 'Coordinadora Test',
      };

      const turnosEquipo = [
        { id: 'turno-1', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 1, borrable: true },
        { id: 'turno-2', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 2, borrable: true },
      ];

      const turnosTienda = [
        { id: 'turno-2', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 2, borrable: true }, // duplicate
        { id: 'turno-3', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 3, borrable: true },
      ];

      const turnosCoordinadora = [
        { id: 'turno-4', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 10, borrable: true },
      ];

      mockCoordinadoraRepository.getCoordinadoraPorTienda.mockResolvedValue(coordinadora as any);
      mockTurnoRepository.getTurnosPorEquipo.mockResolvedValue(turnosEquipo as any);
      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue(turnosTienda as any);
      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue(turnosCoordinadora as any);

      const result = await useCase.execute(idTienda, fecha);

      expect(mockCoordinadoraRepository.getCoordinadoraPorTienda).toHaveBeenCalledWith(idTienda);
      expect(mockTurnoRepository.getTurnosPorEquipo).toHaveBeenCalledWith(coordinadora.id, fecha);
      expect(mockTurnoRepository.getTurnosPorTienda).toHaveBeenCalledWith(coordinadora.idTienda, fecha);
      expect(mockTurnoRepository.getTurnosPorTrabajador).toHaveBeenCalledWith(coordinadora.id, fecha);

      expect(result).toHaveLength(4); // Debe tener 4 turnos únicos
      expect(result.map(t => t.id)).toEqual(expect.arrayContaining(['turno-1', 'turno-2', 'turno-3', 'turno-4']));
    });

    it('debería manejar turnos vacíos', async () => {
      const idTienda = 1;
      const fecha = DateTime.fromISO('2024-01-01');

      const coordinadora = {
        id: 10,
        idTienda: 1,
        nombre: 'Coordinadora Test',
      };

      mockCoordinadoraRepository.getCoordinadoraPorTienda.mockResolvedValue(coordinadora as any);
      mockTurnoRepository.getTurnosPorEquipo.mockResolvedValue([]);
      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([]);
      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      const result = await useCase.execute(idTienda, fecha);

      expect(result).toHaveLength(0);
    });

    it('debería manejar todos los turnos duplicados', async () => {
      const idTienda = 1;
      const fecha = DateTime.fromISO('2024-01-01');

      const coordinadora = {
        id: 10,
        idTienda: 1,
        nombre: 'Coordinadora Test',
      };

      const sameTurno = { id: 'turno-1', inicio: new Date(), final: new Date(), tiendaId: 1, idTrabajador: 1, borrable: true };

      mockCoordinadoraRepository.getCoordinadoraPorTienda.mockResolvedValue(coordinadora as any);
      mockTurnoRepository.getTurnosPorEquipo.mockResolvedValue([sameTurno] as any);
      mockTurnoRepository.getTurnosPorTienda.mockResolvedValue([sameTurno] as any);
      mockTurnoRepository.getTurnosPorTrabajador.mockResolvedValue([sameTurno] as any);

      const result = await useCase.execute(idTienda, fecha);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('turno-1');
    });
  });
});