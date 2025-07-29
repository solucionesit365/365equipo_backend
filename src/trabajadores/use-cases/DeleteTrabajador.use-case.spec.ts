import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTrabajadorUseCase } from './DeleteTrabajador.use-case';
import { ITrabajadorRepository } from '../repository/interfaces/ITrabajador.repository';
import { IDeleteTrabajadorDto } from './interfaces/IDeleteTrabajador.use-case';
import 'reflect-metadata';

describe('DeleteTrabajadorUseCase', () => {
  let useCase: DeleteTrabajadorUseCase;
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
        DeleteTrabajadorUseCase,
        {
          provide: ITrabajadorRepository,
          useValue: mockTrabajadorRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteTrabajadorUseCase>(DeleteTrabajadorUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('debería eliminar un solo trabajador', async () => {
      const deleteDto: IDeleteTrabajadorDto = { id: 1 };

      mockTrabajadorRepository.deleteOne.mockResolvedValue(undefined);

      const result = await useCase.execute([deleteDto]);

      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 1 });
    });

    it('debería eliminar múltiples trabajadores', async () => {
      const deleteDtos: IDeleteTrabajadorDto[] = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ];

      mockTrabajadorRepository.deleteOne.mockResolvedValue(undefined);

      const result = await useCase.execute(deleteDtos);

      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledTimes(3);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenNthCalledWith(1, 1);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenNthCalledWith(2, 2);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenNthCalledWith(3, 3);
      expect(result).toEqual({ count: 3 });
    });

    it('debería manejar array vacío', async () => {
      const result = await useCase.execute([]);

      expect(mockTrabajadorRepository.deleteOne).not.toHaveBeenCalled();
      expect(result).toEqual({ count: 0 });
    });

    it('debería lanzar error si la eliminación falla', async () => {
      const deleteDtos: IDeleteTrabajadorDto[] = [
        { id: 1 },
        { id: 2 },
      ];

      mockTrabajadorRepository.deleteOne
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(useCase.execute(deleteDtos)).rejects.toThrow('Database error');

      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledTimes(2);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledWith(1);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledWith(2);
    });

    it('debería registrar error antes de lanzarlo', async () => {
      const deleteDto: IDeleteTrabajadorDto = { id: 1 };
      const error = new Error('Deletion failed');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockTrabajadorRepository.deleteOne.mockRejectedValue(error);

      await expect(useCase.execute([deleteDto])).rejects.toThrow(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error eliminando trabajador ID 1:',
        'Deletion failed'
      );

      consoleErrorSpy.mockRestore();
    });

    it('debería eliminar trabajadores secuencialmente', async () => {
      const deleteDtos: IDeleteTrabajadorDto[] = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ];

      const callOrder: number[] = [];

      mockTrabajadorRepository.deleteOne.mockImplementation(async (id) => {
        callOrder.push(id);
        return undefined;
      });

      await useCase.execute(deleteDtos);

      expect(callOrder).toEqual([1, 2, 3]);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledTimes(3);
    });

    it('debería detenerse en el primer error y lanzarlo', async () => {
      const deleteDtos: IDeleteTrabajadorDto[] = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ];

      mockTrabajadorRepository.deleteOne
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete error'))
        .mockResolvedValueOnce(undefined);

      await expect(useCase.execute(deleteDtos)).rejects.toThrow('Delete error');

      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledTimes(2);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledWith(1);
      expect(mockTrabajadorRepository.deleteOne).toHaveBeenCalledWith(2);
      expect(mockTrabajadorRepository.deleteOne).not.toHaveBeenCalledWith(3);
    });
  });
});