import { Test, TestingModule } from '@nestjs/testing';
import { NotasInformativasClass } from './notas-informativas.class';
import { NotasInformativasDatabes } from './notas-informativas.mongodb';

describe('NotasInformativasClass', () => {
  let service: NotasInformativasClass;
  let mockDatabase: any;

  beforeEach(async () => {
    mockDatabase = {
      nuevaNotaInformativa: jest.fn(),
      getNotasInformativas: jest.fn(),
      getAllNotasInformativas: jest.fn(),
      getNotasInformativasById: jest.fn(),
      borrarNotasInformativas: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotasInformativasClass,
        {
          provide: NotasInformativasDatabes,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<NotasInformativasClass>(NotasInformativasClass);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('nuevaNotaInformativa', () => {
    it('debe crear una nota informativa y retornar true', async () => {
      const nota = {
        titulo: 'Nueva nota',
        contenido: 'Contenido de la nota',
        idTienda: 100,
      };

      mockDatabase.nuevaNotaInformativa.mockResolvedValue({ insertedId: '123' });

      const result = await service.nuevaNotaInformativa(nota as any);

      expect(result).toBe(true);
      expect(mockDatabase.nuevaNotaInformativa).toHaveBeenCalledWith(nota);
    });

    it('debe lanzar error si falla la inserción', async () => {
      const nota = { titulo: 'Nota' };

      mockDatabase.nuevaNotaInformativa.mockResolvedValue(null);

      await expect(service.nuevaNotaInformativa(nota as any)).rejects.toThrow(
        'No se ha podido insertar la nota informativa',
      );
    });
  });

  describe('getNotasInformativas', () => {
    it('debe retornar notas informativas', async () => {
      const mockNotas = [
        { _id: '1', titulo: 'Nota 1' },
        { _id: '2', titulo: 'Nota 2' },
      ];

      mockDatabase.getNotasInformativas.mockResolvedValue(mockNotas);

      const result = await service.getNotasInformativas();

      expect(result).toEqual(mockNotas);
      expect(mockDatabase.getNotasInformativas).toHaveBeenCalledWith(undefined);
    });

    it('debe filtrar por idTienda', async () => {
      const mockNotas = [{ _id: '1', titulo: 'Nota 1', idTienda: 100 }];

      mockDatabase.getNotasInformativas.mockResolvedValue(mockNotas);

      const result = await service.getNotasInformativas(100);

      expect(result).toEqual(mockNotas);
      expect(mockDatabase.getNotasInformativas).toHaveBeenCalledWith(100);
    });

    it('debe retornar null si no hay notas', async () => {
      mockDatabase.getNotasInformativas.mockResolvedValue([]);

      const result = await service.getNotasInformativas();

      expect(result).toBeNull();
    });
  });

  describe('getAllNotasInformativas', () => {
    it('debe retornar todas las notas informativas', async () => {
      const mockNotas = [
        { _id: '1', titulo: 'Nota 1' },
        { _id: '2', titulo: 'Nota 2' },
      ];

      mockDatabase.getAllNotasInformativas.mockResolvedValue(mockNotas);

      const result = await service.getAllNotasInformativas();

      expect(result).toEqual(mockNotas);
      expect(mockDatabase.getAllNotasInformativas).toHaveBeenCalled();
    });
  });

  describe('getNotasInformativasById', () => {
    it('debe retornar una nota por id', async () => {
      const mockNota = { _id: '123', titulo: 'Nota Test' };

      mockDatabase.getNotasInformativasById.mockResolvedValue(mockNota);

      const result = await service.getNotasInformativasById('123');

      expect(result).toEqual(mockNota);
      expect(mockDatabase.getNotasInformativasById).toHaveBeenCalledWith('123');
    });

    it('debe retornar null si no existe la nota', async () => {
      mockDatabase.getNotasInformativasById.mockResolvedValue(null);

      const result = await service.getNotasInformativasById('999');

      expect(result).toBeNull();
    });
  });

  describe('borrarNotasInformativas', () => {
    it('debe borrar una nota informativa', async () => {
      const nota = { _id: '123', titulo: 'Nota a borrar' };

      mockDatabase.borrarNotasInformativas.mockResolvedValue({ deletedCount: 1 });

      const result = await service.borrarNotasInformativas(nota as any);

      expect(result).toEqual({ deletedCount: 1 });
      expect(mockDatabase.borrarNotasInformativas).toHaveBeenCalledWith(nota);
    });
  });
});
