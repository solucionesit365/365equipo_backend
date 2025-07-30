import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTrabajadorUseCase } from './UpdateTrabajador.use-case';
import { ITrabajadorRepository } from '../repository/interfaces/ITrabajador.repository';
import { IUpdateTrabajadorDto } from './interfaces/IUpdateTrabajador.use-case';
import 'reflect-metadata';

describe('UpdateTrabajadorUseCase', () => {
  let useCase: UpdateTrabajadorUseCase;
  let mockTrabajadorRepository: jest.Mocked<ITrabajadorRepository>;

  beforeEach(async () => {
    mockTrabajadorRepository = {
      create: jest.fn(),
      readByPerceptorAndEmpresa: jest.fn(),
      readByDni: jest.fn(),
      readOne: jest.fn(),
      readAll: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTrabajadorUseCase,
        {
          provide: ITrabajadorRepository,
          useValue: mockTrabajadorRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTrabajadorUseCase>(UpdateTrabajadorUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería actualizar un solo trabajador', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
        nombreApellidos: 'Juan Pérez Updated',
        emails: 'juan.updated@example.com',
        direccion: 'Nueva Calle 456',
      };

      const updatedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez Updated',
        emails: 'juan.updated@example.com',
        direccion: 'Nueva Calle 456',
        dni: '12345678A',
        ciudad: 'Madrid',
        // otros campos...
      };

      mockTrabajadorRepository.updateOne.mockResolvedValue(updatedTrabajador as any);

      const result = await useCase.execute([updateDto]);

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(
        1,
        {
          nombreApellidos: 'Juan Pérez Updated',
          emails: 'juan.updated@example.com',
          direccion: 'Nueva Calle 456',
        }
      );

      expect(result).toEqual([updatedTrabajador]);
    });

    it('debería actualizar múltiples trabajadores', async () => {
      const updateDtos: IUpdateTrabajadorDto[] = [
        {
          id: 1,
          nombreApellidos: 'Juan Pérez Updated',
          displayName: 'Juan Updated',
        },
        {
          id: 2,
          emails: 'maria.new@example.com',
          telefonos: '600999888',
        },
      ];

      const updatedTrabajador1 = {
        id: 1,
        nombreApellidos: 'Juan Pérez Updated',
        displayName: 'Juan Updated',
      };

      const updatedTrabajador2 = {
        id: 2,
        emails: 'maria.new@example.com',
        telefonos: '600999888',
      };

      mockTrabajadorRepository.updateOne
        .mockResolvedValueOnce(updatedTrabajador1 as any)
        .mockResolvedValueOnce(updatedTrabajador2 as any);

      const result = await useCase.execute(updateDtos);

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledTimes(2);
      
      expect(mockTrabajadorRepository.updateOne).toHaveBeenNthCalledWith(
        1,
        1,
        {
          nombreApellidos: 'Juan Pérez Updated',
          displayName: 'Juan Updated',
        }
      );

      expect(mockTrabajadorRepository.updateOne).toHaveBeenNthCalledWith(
        2,
        2,
        {
          emails: 'maria.new@example.com',
          telefonos: '600999888',
        }
      );

      expect(result).toEqual([updatedTrabajador1, updatedTrabajador2]);
    });

    it('debería manejar datos de actualización vacíos', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
      };

      const existingTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
        emails: 'juan@example.com',
      };

      mockTrabajadorRepository.updateOne.mockResolvedValue(existingTrabajador as any);

      const result = await useCase.execute([updateDto]);

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(1, {});
      expect(result).toEqual([existingTrabajador]);
    });

    it('debería manejar actualización de todos los campos opcionales', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
        nombreApellidos: 'Nuevo Nombre',
        displayName: 'Nuevo Display',
        emails: 'nuevo@email.com',
        dni: '87654321B',
        direccion: 'Nueva Dirección',
        ciudad: 'Nueva Ciudad',
        telefonos: '600111222',
        fechaNacimiento: new Date('1985-05-15'),
        nacionalidad: 'Nueva Nacionalidad',
        nSeguridadSocial: '98765432109',
        codigoPostal: '28002',
      };

      const updatedTrabajador = { ...updateDto };

      mockTrabajadorRepository.updateOne.mockResolvedValue(updatedTrabajador as any);

      const result = await useCase.execute([updateDto]);

      const { id, ...expectedUpdateData } = updateDto;

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(
        id,
        expectedUpdateData
      );

      expect(result).toEqual([updatedTrabajador]);
    });

    it('debería manejar array vacío', async () => {
      const result = await useCase.execute([]);

      expect(mockTrabajadorRepository.updateOne).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debería actualizar trabajadores secuencialmente', async () => {
      const updateDtos: IUpdateTrabajadorDto[] = [
        { id: 1, nombreApellidos: 'Primero' },
        { id: 2, nombreApellidos: 'Segundo' },
        { id: 3, nombreApellidos: 'Tercero' },
      ];

      const callOrder: number[] = [];

      mockTrabajadorRepository.updateOne.mockImplementation(async (id) => {
        callOrder.push(id);
        return { id, nombreApellidos: `Trabajador ${id}` } as any;
      });

      await useCase.execute(updateDtos);

      expect(callOrder).toEqual([1, 2, 3]);
      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledTimes(3);
    });
  });

  describe('executeOne', () => {
    it('debería actualizar un solo trabajador', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
        nombreApellidos: 'Juan Pérez Updated',
        emails: 'juan.updated@example.com',
        direccion: 'Nueva Calle 456',
      };

      const updatedTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez Updated',
        emails: 'juan.updated@example.com',
        direccion: 'Nueva Calle 456',
        dni: '12345678A',
        ciudad: 'Madrid',
      };

      mockTrabajadorRepository.updateOne.mockResolvedValue(updatedTrabajador as any);

      const result = await useCase.executeOne(updateDto);

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(
        1,
        {
          nombreApellidos: 'Juan Pérez Updated',
          emails: 'juan.updated@example.com',
          direccion: 'Nueva Calle 456',
        }
      );

      expect(result).toEqual(updatedTrabajador);
    });

    it('debería manejar datos de actualización vacíos', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
      };

      const existingTrabajador = {
        id: 1,
        nombreApellidos: 'Juan Pérez',
        emails: 'juan@example.com',
      };

      mockTrabajadorRepository.updateOne.mockResolvedValue(existingTrabajador as any);

      const result = await useCase.executeOne(updateDto);

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(1, {});
      expect(result).toEqual(existingTrabajador);
    });

    it('debería manejar actualización de todos los campos opcionales', async () => {
      const updateDto: IUpdateTrabajadorDto = {
        id: 1,
        nombreApellidos: 'Nuevo Nombre',
        displayName: 'Nuevo Display',
        emails: 'nuevo@email.com',
        dni: '87654321B',
        direccion: 'Nueva Dirección',
        ciudad: 'Nueva Ciudad',
        telefonos: '600111222',
        fechaNacimiento: new Date('1985-05-15'),
        nacionalidad: 'Nueva Nacionalidad',
        nSeguridadSocial: '98765432109',
        codigoPostal: '28002',
      };

      const updatedTrabajador = { ...updateDto };

      mockTrabajadorRepository.updateOne.mockResolvedValue(updatedTrabajador as any);

      const result = await useCase.executeOne(updateDto);

      const { id, ...expectedUpdateData } = updateDto;

      expect(mockTrabajadorRepository.updateOne).toHaveBeenCalledWith(
        id,
        expectedUpdateData
      );

      expect(result).toEqual(updatedTrabajador);
    });
  });
});