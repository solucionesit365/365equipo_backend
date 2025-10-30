import { Test, TestingModule } from '@nestjs/testing';
import { AnunciosDatabaseService } from './anuncios.mongodb';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

describe('AnunciosDatabaseService', () => {
  let service: AnunciosDatabaseService;
  let mongoService: jest.Mocked<MongoService>;

  const mockCollection = {
    find: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    findOne: jest.fn(),
    createIndex: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  const mockConnection = {
    db: jest.fn().mockReturnValue(mockDb),
  };

  beforeEach(async () => {
    const mockMongoService = {
      getConexion: jest.fn().mockResolvedValue(mockConnection),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnunciosDatabaseService,
        { provide: MongoService, useValue: mockMongoService },
      ],
    }).compile();

    service = module.get<AnunciosDatabaseService>(AnunciosDatabaseService);
    mongoService = module.get(MongoService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getAnuncios', () => {
    it('debe retornar anuncios filtrados por tienda', async () => {
      const mockAnuncios = [
        { _id: '1', titulo: 'Anuncio 1', tiendas: [1, -1] },
        { _id: '2', titulo: 'Anuncio 2', tiendas: [1] },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnuncios),
      });

      const result = await service.getAnuncios(1);

      expect(result).toEqual(mockAnuncios);
      expect(mockCollection.find).toHaveBeenCalledWith({ tiendas: { $in: [1, -1] } });
    });

    it('debe retornar todos los anuncios si no se especifica tienda', async () => {
      const mockAnuncios = [{ _id: '1', titulo: 'Anuncio 1' }];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockAnuncios),
      });

      const result = await service.getAnuncios(null);

      expect(result).toEqual(mockAnuncios);
      expect(mockCollection.find).toHaveBeenCalledWith({});
    });
  });

  describe('addAnuncio', () => {
    it('debe agregar un anuncio correctamente', async () => {
      const mockAnuncio = {
        titulo: 'Nuevo Anuncio',
        descripcion: 'Descripción',
        categoria: 'General',
        caducidad: new Date(),
      } as any;

      const mockInsertedId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: mockInsertedId,
      });

      const result = await service.addAnuncio(mockAnuncio);

      expect(result).toEqual(mockInsertedId);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockAnuncio);
    });

    it('debe retornar null si falla la inserción', async () => {
      const mockAnuncio = { titulo: 'Anuncio' } as any;

      mockCollection.insertOne.mockResolvedValue({
        acknowledged: false,
        insertedId: null,
      });

      const result = await service.addAnuncio(mockAnuncio);

      expect(result).toBeNull();
    });
  });

  describe('updateAnuncio', () => {
    it('debe actualizar un anuncio correctamente', async () => {
      const mockAnuncio = {
        _id: '507f1f77bcf86cd799439011',
        titulo: 'Anuncio Actualizado',
        descripcion: 'Nueva descripción',
        categoria: 'General',
        caducidad: '2024-12-31',
        fotoPath: '/path/to/photo',
      } as any;

      mockCollection.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      const result = await service.updateAnuncio(mockAnuncio);

      expect(result).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalled();
    });

    it('debe retornar false si falla la actualización', async () => {
      const mockAnuncio = {
        _id: '507f1f77bcf86cd799439011',
        titulo: 'Anuncio',
      } as any;

      mockCollection.updateOne.mockResolvedValue({
        acknowledged: false,
      });

      const result = await service.updateAnuncio(mockAnuncio);

      expect(result).toBe(false);
    });
  });

  describe('deleteAnuncio', () => {
    it('debe eliminar un anuncio correctamente', async () => {
      const mockId = '507f1f77bcf86cd799439011';

      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      const result = await service.deleteAnuncio(mockId);

      expect(result).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockId),
      });
    });

    it('debe retornar false si no se elimina nada', async () => {
      const mockId = '507f1f77bcf86cd799439011';

      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 0,
      });

      const result = await service.deleteAnuncio(mockId);

      expect(result).toBe(false);
    });
  });

  describe('getAnuncioById', () => {
    it('debe retornar un anuncio por ID', async () => {
      const mockId = '507f1f77bcf86cd799439011';
      const mockAnuncio = {
        _id: new ObjectId(mockId),
        titulo: 'Anuncio Test',
      };

      mockCollection.findOne.mockResolvedValue(mockAnuncio);

      const result = await service.getAnuncioById(mockId);

      expect(result).toEqual(mockAnuncio);
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockId),
      });
    });

    it('debe lanzar error si el anuncio no existe', async () => {
      const mockId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockResolvedValue(null);

      await expect(service.getAnuncioById(mockId)).rejects.toThrow(
        'Error al obtener el anuncio',
      );
    });
  });
});
