import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { PrismaService } from '../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      empresa: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEmpresa', () => {
    it('debe crear una empresa correctamente', async () => {
      const mockEmpresa = {
        id: '1',
        nombre: 'Test Empresa',
        cif: 'B12345678',
        autogestionada: true,
      };

      mockPrismaService.empresa.create.mockResolvedValue(mockEmpresa);

      const result = await service.createEmpresa({
        nombre: 'Test Empresa',
        cif: 'B12345678',
        idExterno: 123,
      });

      expect(result).toEqual(mockEmpresa);
      expect(mockPrismaService.empresa.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Test Empresa',
          cif: 'B12345678',
          autogestionada: true,
        },
      });
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      mockPrismaService.empresa.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createEmpresa({
          nombre: 'Test',
          cif: 'B12345678',
          idExterno: 123,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateEmpresa', () => {
    it('debe actualizar una empresa correctamente', async () => {
      const mockEmpresa = {
        id: '1',
        nombre: 'Empresa Actualizada',
        cif: 'B87654321',
        idExterno: 123,
      };

      mockPrismaService.empresa.update.mockResolvedValue(mockEmpresa);

      const result = await service.updateEmpresa({
        id: '1',
        nombre: 'Empresa Actualizada',
        cif: 'B87654321',
        idExterno: 123,
      });

      expect(result).toEqual(mockEmpresa);
      expect(mockPrismaService.empresa.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          nombre: 'Empresa Actualizada',
          cif: 'B87654321',
          idExterno: 123,
        },
      });
    });

    it('debe establecer idExterno como null cuando no se proporciona', async () => {
      const mockEmpresa = {
        id: '1',
        nombre: 'Empresa',
        cif: 'B12345678',
        idExterno: null,
      };

      mockPrismaService.empresa.update.mockResolvedValue(mockEmpresa);

      await service.updateEmpresa({
        id: '1',
        nombre: 'Empresa',
        cif: 'B12345678',
        idExterno: undefined,
      });

      expect(mockPrismaService.empresa.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          nombre: 'Empresa',
          cif: 'B12345678',
          idExterno: null,
        },
      });
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      mockPrismaService.empresa.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateEmpresa({
          id: '1',
          nombre: 'Test',
          cif: 'B12345678',
          idExterno: 123,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getEmpresas', () => {
    it('debe retornar todas las empresas cuando no hay filtro', async () => {
      const mockEmpresas = [
        { id: '1', nombre: 'Empresa 1' },
        { id: '2', nombre: 'Empresa 2' },
      ];

      mockPrismaService.empresa.findMany.mockResolvedValue(mockEmpresas);

      const result = await service.getEmpresas();

      expect(result).toEqual(mockEmpresas);
      expect(mockPrismaService.empresa.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it('debe filtrar por existsBC cuando onlyExistsBC es true', async () => {
      const mockEmpresas = [{ id: '1', nombre: 'Empresa BC', existsBC: true }];

      mockPrismaService.empresa.findMany.mockResolvedValue(mockEmpresas);

      const result = await service.getEmpresas(true);

      expect(result).toEqual(mockEmpresas);
      expect(mockPrismaService.empresa.findMany).toHaveBeenCalledWith({
        where: { existsBC: true },
      });
    });

    it('debe retornar todas cuando onlyExistsBC es false', async () => {
      const mockEmpresas = [
        { id: '1', nombre: 'Empresa 1' },
        { id: '2', nombre: 'Empresa 2' },
      ];

      mockPrismaService.empresa.findMany.mockResolvedValue(mockEmpresas);

      const result = await service.getEmpresas(false);

      expect(result).toEqual(mockEmpresas);
      expect(mockPrismaService.empresa.findMany).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe('deleteEmpresa', () => {
    it('debe eliminar una empresa correctamente', async () => {
      mockPrismaService.empresa.delete.mockResolvedValue({ id: '1' });

      await service.deleteEmpresa({ id: '1' });

      expect(mockPrismaService.empresa.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('debe lanzar InternalServerErrorException cuando hay error', async () => {
      mockPrismaService.empresa.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteEmpresa({ id: '999' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
