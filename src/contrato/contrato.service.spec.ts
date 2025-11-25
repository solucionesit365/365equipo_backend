import { Test, TestingModule } from '@nestjs/testing';
import { ContratoService } from './contrato.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { DateTime } from 'luxon';

describe('ContratoService', () => {
  let service: ContratoService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      contrato2: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ContratoService>(ContratoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistoricoContratos', () => {
    it('debe retornar contratos cuando existen', async () => {
      const mockContratos = [
        { id: 1, horasContrato: 100, dni: '12345678A' },
        { id: 2, horasContrato: 75, dni: '12345678A' },
      ];

      mockPrismaService.contrato2.findMany.mockResolvedValue(mockContratos);

      const result = await service.getHistoricoContratos('12345678A');

      expect(result).toEqual(mockContratos);
      expect(mockPrismaService.contrato2.findMany).toHaveBeenCalledWith({
        where: {
          trabajador: {
            dni: '12345678A',
          },
        },
      });
    });

    it('debe retornar null cuando no hay contratos', async () => {
      mockPrismaService.contrato2.findMany.mockResolvedValue([]);

      const result = await service.getHistoricoContratos('99999999Z');

      expect(result).toBeNull();
    });
  });

  describe('descargarHistoriaContratos', () => {
    it('debe retornar 1', async () => {
      const result = await service.descargarHistoriaContratos();

      expect(result).toBe(1);
    });
  });

  describe('getHorasContratoById', () => {
    it('debe llamar a getHorasContrato con los parámetros correctos', async () => {
      const mockContrato = { horasContrato: 100 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15');
      const result = await service.getHorasContratoById(1, fecha);

      expect(result).toBe(40); // (100 * 40) / 100
      expect(mockPrismaService.contrato2.findFirst).toHaveBeenCalled();
    });
  });

  describe('getHorasContratoByIdNew', () => {
    it('debe llamar a getHorasContrato con los parámetros correctos', async () => {
      const mockContrato = { horasContrato: 50 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15');
      const result = await service.getHorasContratoByIdNew(1, fecha);

      expect(result).toBe(20); // (50 * 40) / 100
    });
  });

  describe('getHorasContrato', () => {
    it('debe retornar horas calculadas cuando existe contrato activo', async () => {
      const mockContrato = { horasContrato: 100 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15');
      const result = await service.getHorasContrato(1, fecha);

      expect(result).toBe(40); // (100 * 40) / 100
    });

    it('debe retornar horas parciales correctamente', async () => {
      const mockContrato = { horasContrato: 75 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15');
      const result = await service.getHorasContrato(1, fecha);

      expect(result).toBe(30); // (75 * 40) / 100
    });

    it('debe retornar null cuando no existe contrato', async () => {
      mockPrismaService.contrato2.findFirst.mockResolvedValue(null);

      const fecha = DateTime.fromISO('2024-01-15');
      const result = await service.getHorasContrato(999, fecha);

      expect(result).toBeNull();
    });

    it('debe usar fecha endOf day para la consulta', async () => {
      const mockContrato = { horasContrato: 100 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15T10:00:00');
      await service.getHorasContrato(1, fecha);

      const call = mockPrismaService.contrato2.findFirst.mock.calls[0][0];
      const fechaAlta = DateTime.fromJSDate(call.where.fechaAlta.lte);

      expect(fechaAlta.hour).toBe(23);
      expect(fechaAlta.minute).toBe(59);
    });
  });

  describe('getHorasContratoNew', () => {
    it('debe llamar a getHorasContrato', async () => {
      const mockContrato = { horasContrato: 100 };
      mockPrismaService.contrato2.findFirst.mockResolvedValue(mockContrato);

      const fecha = DateTime.fromISO('2024-01-15');
      await service.getHorasContratoNew(1, fecha);

      expect(mockPrismaService.contrato2.findFirst).toHaveBeenCalled();
    });
  });

  describe('getContratoByDni', () => {
    it('debe retornar contratos cuando existen', async () => {
      const mockContratos = [
        { id: 1, horasContrato: 100, dni: '12345678A' },
      ];

      mockPrismaService.contrato2.findMany.mockResolvedValue(mockContratos);

      const result = await service.getContratoByDni('12345678A');

      expect(result).toEqual(mockContratos);
      expect(mockPrismaService.contrato2.findMany).toHaveBeenCalledWith({
        where: {
          trabajador: {
            dni: '12345678A',
          },
        },
      });
    });

    it('debe retornar null cuando no hay contratos', async () => {
      mockPrismaService.contrato2.findMany.mockResolvedValue([]);

      const result = await service.getContratoByDni('99999999Z');

      expect(result).toBeNull();
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      mockPrismaService.contrato2.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.getContratoByDni('12345678A')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getContratoByDni('12345678A')).rejects.toThrow(
        'Error al obtener el contrato por DNI',
      );
    });
  });
});
