import { Test, TestingModule } from '@nestjs/testing';
import { TrabajadorRepository } from './Trabajador.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import 'reflect-metadata';

describe('TrabajadorRepository', () => {
  let repository: TrabajadorRepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      trabajador: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadorRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<TrabajadorRepository>(TrabajadorRepository);
  });

  it('debería estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un trabajador exitosamente', async () => {
      const newTrabajador = {
        nombreApellidos: 'Juan Pérez',
        displayName: 'Juan',
        emails: 'juan@example.com',
        dni: '12345678A',
        tipoTrabajador: 'NORMAL',
        llevaEquipo: false,
        empresa: { connect: { id: 'empresa-1' } },
      };

      const expectedResult = {
        id: 1,
        ...newTrabajador,
        empresaId: 'empresa-1',
      };

      mockPrismaService.trabajador.create.mockResolvedValue(expectedResult);

      const result = await repository.create(newTrabajador);

      expect(mockPrismaService.trabajador.create).toHaveBeenCalledWith({
        data: newTrabajador,
      });
      expect(result).toBe(expectedResult);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const newTrabajador = {
        nombreApellidos: 'Juan Pérez',
        emails: 'juan@example.com',
        dni: '12345678A',
        tipoTrabajador: 'NORMAL',
        llevaEquipo: false,
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.create.mockRejectedValue(new Error('DB Error'));

      await expect(repository.create(newTrabajador)).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('readOne', () => {
    it('debería leer un trabajador por id', async () => {
      const expectedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
        emails: 'juan@example.com',
      };

      mockPrismaService.trabajador.findUnique.mockResolvedValue(expectedTrabajador);

      const result = await repository.readOne(1);

      expect(mockPrismaService.trabajador.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(expectedTrabajador);
    });

    it('debería retornar null cuando no se encuentra el trabajador', async () => {
      mockPrismaService.trabajador.findUnique.mockResolvedValue(null);

      const result = await repository.readOne(999);

      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(repository.readOne(1)).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('readByDni', () => {
    it('debería encontrar trabajador por DNI', async () => {
      const expectedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
        dni: '12345678A',
      };

      mockPrismaService.trabajador.findUnique.mockResolvedValue(expectedTrabajador);

      const result = await repository.readByDni('12345678A');

      expect(mockPrismaService.trabajador.findUnique).toHaveBeenCalledWith({
        where: { dni: '12345678A' },
      });
      expect(result).toBe(expectedTrabajador);
    });

    it('debería retornar null cuando no se encuentra trabajador por DNI', async () => {
      mockPrismaService.trabajador.findUnique.mockResolvedValue(null);

      const result = await repository.readByDni('99999999Z');

      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(repository.readByDni('12345678A')).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('readByPerceptorAndEmpresa', () => {
    it('debería encontrar trabajador por nPerceptor y empresaId', async () => {
      const expectedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
        nPerceptor: 1001,
        empresaId: 'empresa-1',
      };

      mockPrismaService.trabajador.findFirst.mockResolvedValue(expectedTrabajador);

      const result = await repository.readByPerceptorAndEmpresa(1001, 'empresa-1');

      expect(mockPrismaService.trabajador.findFirst).toHaveBeenCalledWith({
        where: {
          nPerceptor: 1001,
          empresaId: 'empresa-1',
        },
      });
      expect(result).toBe(expectedTrabajador);
    });

    it('debería retornar null cuando no se encuentra trabajador', async () => {
      mockPrismaService.trabajador.findFirst.mockResolvedValue(null);

      const result = await repository.readByPerceptorAndEmpresa(9999, 'empresa-x');

      expect(result).toBeNull();
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.findFirst.mockRejectedValue(new Error('DB Error'));

      await expect(
        repository.readByPerceptorAndEmpresa(1001, 'empresa-1')
      ).rejects.toThrow(InternalServerErrorException);
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('readAll', () => {
    it('debería retornar todos los trabajadores sin filtros', async () => {
      const expectedTrabajadores = [
        { id: 1, nombreApellidos: 'Juan Pérez', esTienda: false },
        { id: 2, nombreApellidos: 'María García', esTienda: false },
        { id: 3, nombreApellidos: 'Tienda 1', esTienda: true },
      ];

      mockPrismaService.trabajador.findMany.mockResolvedValue(expectedTrabajadores);

      const result = await repository.readAll();

      expect(mockPrismaService.trabajador.findMany).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toBe(expectedTrabajadores);
    });

    it('debería filtrar solo personas cuando sonPersonas es true', async () => {
      const expectedPersonas = [
        { id: 1, nombreApellidos: 'Juan Pérez', esTienda: false },
        { id: 2, nombreApellidos: 'María García', esTienda: false },
      ];

      mockPrismaService.trabajador.findMany.mockResolvedValue(expectedPersonas);

      const result = await repository.readAll({ sonPersonas: true });

      expect(mockPrismaService.trabajador.findMany).toHaveBeenCalledWith({
        where: { esTienda: false },
      });
      expect(result).toBe(expectedPersonas);
    });

    it('debería filtrar solo tiendas cuando sonTiendas es true', async () => {
      const expectedTiendas = [
        { id: 3, nombreApellidos: 'Tienda 1', esTienda: true },
      ];

      mockPrismaService.trabajador.findMany.mockResolvedValue(expectedTiendas);

      const result = await repository.readAll({ sonTiendas: true });

      expect(mockPrismaService.trabajador.findMany).toHaveBeenCalledWith({
        where: { esTienda: true },
      });
      expect(result).toBe(expectedTiendas);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(repository.readAll()).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('updateOne', () => {
    it('debería actualizar un trabajador exitosamente', async () => {
      const updatePayload = {
        nombreApellidos: 'Juan Pérez Updated',
        emails: 'juan.updated@example.com',
      };

      const updatedTrabajador = {
        id: 1,
        ...updatePayload,
        dni: '12345678A',
      };

      mockPrismaService.trabajador.update.mockResolvedValue(updatedTrabajador);

      const result = await repository.updateOne(1, updatePayload);

      expect(mockPrismaService.trabajador.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updatePayload,
      });
      expect(result).toBe(updatedTrabajador);
    });

    it('debería lanzar InternalServerErrorException en caso de error', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrismaService.trabajador.update.mockRejectedValue(new Error('DB Error'));

      await expect(repository.updateOne(1, {})).rejects.toThrow(
        InternalServerErrorException
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('deleteOne', () => {
    it('debería eliminar un trabajador y retornar true', async () => {
      const deletedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
      };

      mockPrismaService.trabajador.delete.mockResolvedValue(deletedTrabajador);

      const result = await repository.deleteOne(1);

      expect(mockPrismaService.trabajador.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toBe(true);
    });

    it('debería retornar false cuando la eliminación retorna null', async () => {
      mockPrismaService.trabajador.delete.mockResolvedValue(null);

      const result = await repository.deleteOne(1);

      expect(result).toBe(false);
    });

    it('debería lanzar InternalServerErrorException con mensaje específico en caso de error', async () => {
      const error = {
        code: 'P2025',
        message: 'Record not found',
        meta: { cause: 'Record to delete does not exist.' },
      };
      mockPrismaService.trabajador.delete.mockRejectedValue(error);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(repository.deleteOne(1)).rejects.toThrow(
        new InternalServerErrorException('Error eliminando trabajador ID 1')
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error eliminando trabajador ID 1:',
        {
          code: 'P2025',
          message: 'Record not found',
          meta: { cause: 'Record to delete does not exist.' },
        }
      );

      consoleErrorSpy.mockRestore();
    });
  });
});