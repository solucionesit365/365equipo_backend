import { Test, TestingModule } from '@nestjs/testing';
import { TurnoRepository } from './turno.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('TurnoRepository', () => {
  let repository: TurnoRepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      turno: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurnoRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TurnoRepository>(TurnoRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('createTurno', () => {
    it('debería crear un turno exitosamente', async () => {
      const turnoData = {
        inicio: new Date(),
        final: new Date(),
        borrable: true,
        trabajador: { connect: { id: 1 } },
        tienda: { connect: { id: 1 } },
      };

      const expectedResult = { id: '1', ...turnoData };
      mockPrismaService.turno.create.mockResolvedValue(expectedResult);

      const result = await repository.createTurno(turnoData);

      expect(mockPrismaService.turno.create).toHaveBeenCalledWith({
        data: turnoData,
      });
      expect(result).toBe(expectedResult);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const turnoData = {
        inicio: new Date(),
        final: new Date(),
        borrable: true,
        trabajador: { connect: { id: 1 } },
        tienda: { connect: { id: 1 } },
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.turno.create.mockRejectedValue(new Error('DB Error'));

      await expect(repository.createTurno(turnoData)).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('createTurnos', () => {
    it('debería crear múltiples turnos exitosamente', async () => {
      const turnosData = [
        {
          inicio: new Date(),
          final: new Date(),
          idTrabajador: 1,
          tiendaId: 1,
          borrable: true,
        },
        {
          inicio: new Date(),
          final: new Date(),
          idTrabajador: 2,
          tiendaId: 1,
          borrable: true,
        },
      ];

      const expectedResult = { count: 2 };
      mockPrismaService.turno.createMany.mockResolvedValue(expectedResult);

      const result = await repository.createTurnos(turnosData);

      expect(mockPrismaService.turno.createMany).toHaveBeenCalledWith({
        data: turnosData,
      });
      expect(result).toBe(expectedResult);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.turno.createMany.mockRejectedValue(new Error('DB Error'));

      await expect(repository.createTurnos([])).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('getTurnosPorTrabajador', () => {
    it('debería obtener turnos para un trabajador en una semana', async () => {
      const idTrabajador = 1;
      const fecha = DateTime.fromISO('2024-01-15');
      const inicio = fecha.startOf('week');
      const final = fecha.endOf('week');

      const expectedTurnos = [
        {
          id: '1',
          inicio: new Date(),
          final: new Date(),
          idTrabajador,
          trabajador: {
            id: idTrabajador,
            contratos: [],
          },
        },
      ];

      mockPrismaService.turno.findMany.mockResolvedValue(expectedTurnos);

      const result = await repository.getTurnosPorTrabajador(idTrabajador, fecha);

      expect(mockPrismaService.turno.findMany).toHaveBeenCalledWith({
        where: {
          idTrabajador,
          inicio: {
            gte: inicio.toJSDate(),
            lte: final.toJSDate(),
          },
        },
        include: {
          trabajador: {
            include: expect.objectContaining({
              contratos: expect.any(Object),
            }),
          },
        },
      });
      expect(result).toBe(expectedTurnos);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.turno.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.getTurnosPorTrabajador(1, DateTime.now())
      ).rejects.toThrow(InternalServerErrorException);
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('getTurnosPorTienda', () => {
    it('debería obtener turnos para una tienda en una semana', async () => {
      const idTienda = 1;
      const fecha = DateTime.fromISO('2024-01-15');

      const expectedTurnos = [
        {
          id: '1',
          inicio: new Date(),
          final: new Date(),
          tiendaId: idTienda,
          trabajador: {
            id: 1,
            contratos: [],
          },
        },
      ];

      mockPrismaService.turno.findMany.mockResolvedValue(expectedTurnos);

      const result = await repository.getTurnosPorTienda(idTienda, fecha);

      expect(mockPrismaService.turno.findMany).toHaveBeenCalledWith({
        where: {
          tiendaId: idTienda,
          inicio: {
            gte: fecha.startOf('week').toJSDate(),
            lte: fecha.endOf('week').toJSDate(),
          },
        },
        include: {
          trabajador: {
            include: expect.objectContaining({
              contratos: expect.any(Object),
            }),
          },
        },
      });
      expect(result).toBe(expectedTurnos);
    });
  });

  describe('getTurnosPorEquipo', () => {
    it('debería obtener turnos para un equipo por responsable', async () => {
      const idResponsableEquipo = 10;
      const fecha = DateTime.fromISO('2024-01-15');

      const expectedTurnos = [
        {
          id: '1',
          inicio: new Date(),
          final: new Date(),
          trabajador: {
            id: 1,
            idResponsable: idResponsableEquipo,
            contratos: [],
          },
        },
      ];

      mockPrismaService.turno.findMany.mockResolvedValue(expectedTurnos);

      const result = await repository.getTurnosPorEquipo(idResponsableEquipo, fecha);

      expect(mockPrismaService.turno.findMany).toHaveBeenCalledWith({
        where: {
          trabajador: {
            idResponsable: idResponsableEquipo,
          },
          inicio: {
            gte: fecha.startOf('week').toJSDate(),
            lte: fecha.endOf('week').toJSDate(),
          },
        },
        include: {
          trabajador: {
            include: expect.objectContaining({
              contratos: expect.any(Object),
            }),
          },
        },
      });
      expect(result).toBe(expectedTurnos);
    });
  });

  describe('deleteTurno', () => {
    it('debería eliminar un turno exitosamente', async () => {
      const idTurno = 'turno-1';
      const deletedTurno = { id: idTurno };

      mockPrismaService.turno.delete.mockResolvedValue(deletedTurno);

      const result = await repository.deleteTurno(idTurno);

      expect(mockPrismaService.turno.delete).toHaveBeenCalledWith({
        where: {
          id: idTurno,
        },
      });
      expect(result).toBe(deletedTurno);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.turno.delete.mockRejectedValue(new Error('DB Error'));

      await expect(repository.deleteTurno('1')).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('updateManyTurnos', () => {
    it('debería actualizar múltiples turnos en una transacción', async () => {
      const turnos = [
        {
          id: '1',
          inicio: new Date(),
          final: new Date(),
          tiendaId: 1,
          idTrabajador: 1,
          borrable: true,
          bolsaHorasInicial: 0,
        },
        {
          id: '2',
          inicio: new Date(),
          final: new Date(),
          tiendaId: 1,
          idTrabajador: 2,
          borrable: true,
          bolsaHorasInicial: 0,
        },
      ];

      const expectedResult = turnos;
      mockPrismaService.$transaction.mockResolvedValue(expectedResult);

      const result = await repository.updateManyTurnos(turnos as any);

      expect(mockPrismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Array)
      );
      expect(result).toBe(expectedResult);
    });
  });

  describe('getTurnoDelDia', () => {
    it('debería obtener turno para un día específico', async () => {
      const idTrabajador = 1;
      const inicio = DateTime.fromISO('2024-01-15T00:00:00');
      const final = DateTime.fromISO('2024-01-15T23:59:59');

      const expectedTurno = {
        id: '1',
        inicio: new Date('2024-01-15T08:00:00'),
        final: new Date('2024-01-15T16:00:00'),
        idTrabajador,
      };

      mockPrismaService.turno.findFirst.mockResolvedValue(expectedTurno);

      const result = await repository.getTurnoDelDia(idTrabajador, inicio, final);

      expect(mockPrismaService.turno.findFirst).toHaveBeenCalledWith({
        where: {
          idTrabajador,
          inicio: {
            gte: inicio.toJSDate(),
          },
          final: {
            lt: final.toJSDate(),
          },
        },
      });
      expect(result).toBe(expectedTurno);
    });

    it('debería retornar null cuando no se encuentra turno', async () => {
      mockPrismaService.turno.findFirst.mockResolvedValue(null);

      const result = await repository.getTurnoDelDia(
        1,
        DateTime.now(),
        DateTime.now()
      );

      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.turno.findFirst.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.getTurnoDelDia(1, DateTime.now(), DateTime.now())
      ).rejects.toThrow(InternalServerErrorException);
      
      consoleLogSpy.mockRestore();
    });
  });
});