import { Test, TestingModule } from '@nestjs/testing';
import { ArchivoDigitalDatabase } from './archivo-digital.mongodb';
import { MongoService } from '../mongo/mongo.service';
import { ObjectId } from 'mongodb';

describe('ArchivoDigitalDatabase', () => {
  let service: ArchivoDigitalDatabase;
  let mongoService: jest.Mocked<MongoService>;

  const mockCollection = {
    insertOne: jest.fn(),
    find: jest.fn(),
    deleteOne: jest.fn(),
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
        ArchivoDigitalDatabase,
        { provide: MongoService, useValue: mockMongoService },
      ],
    }).compile();

    service = module.get<ArchivoDigitalDatabase>(ArchivoDigitalDatabase);
    mongoService = module.get(MongoService);

    jest.clearAllMocks();
  });

  describe('nuevoArchivo', () => {
    it('debe crear un archivo correctamente', async () => {
      const mockArchivo = {
        nombre: 'documento.pdf',
        tipo: 'contrato',
        propietario: 1,
        url: 'https://example.com/doc.pdf',
        creacion: new Date(),
      } as any;

      const mockInsertedId = new ObjectId();
      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: mockInsertedId,
      });

      const result = await service.nuevoArchivo(mockArchivo);

      expect(result).toEqual(mockInsertedId);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockArchivo);
    });

    it('debe lanzar error si falla la inserción', async () => {
      const mockArchivo = { nombre: 'documento.pdf' } as any;

      mockCollection.insertOne.mockResolvedValue({
        acknowledged: false,
      });

      await expect(service.nuevoArchivo(mockArchivo)).rejects.toThrow(
        'No se ha podido subir el archivo'
      );
    });
  });

  describe('getarchivos', () => {
    it('debe retornar todos los archivos', async () => {
      const mockArchivos = [
        { _id: '1', nombre: 'doc1.pdf' },
        { _id: '2', nombre: 'doc2.pdf' },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockArchivos),
      });

      const result = await service.getarchivos();

      expect(result).toEqual(mockArchivos);
      expect(mockCollection.find).toHaveBeenCalledWith({});
    });
  });

  describe('deleteArchivo', () => {
    it('debe eliminar un archivo correctamente', async () => {
      const mockId = '507f1f77bcf86cd799439011';

      mockCollection.deleteOne.mockResolvedValue({
        acknowledged: true,
        deletedCount: 1,
      });

      const result = await service.deleteArchivo(mockId);

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

      const result = await service.deleteArchivo(mockId);

      expect(result).toBe(false);
    });
  });

  describe('getArchivosByPropietario', () => {
    it('debe retornar archivos por propietario', async () => {
      const mockArchivos = [{ propietario: 5, nombre: 'doc1.pdf' }];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockArchivos),
      });

      const result = await service.getArchivosByPropietario(5);

      expect(result).toEqual(mockArchivos);
      expect(mockCollection.find).toHaveBeenCalledWith({ propietario: 5 });
    });
  });

  describe('getArchivosByTipo', () => {
    it('debe retornar archivos por tipo', async () => {
      const mockArchivos = [{ tipo: 'contrato', nombre: 'doc1.pdf' }];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockArchivos),
      });

      const result = await service.getArchivosByTipo('contrato');

      expect(result).toEqual(mockArchivos);
      expect(mockCollection.find).toHaveBeenCalledWith({ tipo: 'contrato' });
    });
  });

  describe('getArchivosByCreación', () => {
    it('debe retornar archivos por fecha de creación', async () => {
      const mockFecha = new Date('2024-01-01');
      const mockArchivos = [{ creacion: mockFecha, nombre: 'doc1.pdf' }];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockArchivos),
      });

      const result = await service.getArchivosByCreación(mockFecha);

      expect(result).toEqual(mockArchivos);
      expect(mockCollection.find).toHaveBeenCalledWith({ creacion: mockFecha });
    });
  });

  describe('getArchivosByPropietarioAndTipo', () => {
    it('debe retornar archivos por propietario y tipo', async () => {
      const mockArchivos = [{ propietario: 5, tipo: 'contrato', nombre: 'doc1.pdf' }];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockArchivos),
      });

      const result = await service.getArchivosByPropietarioAndTipo(5, 'contrato');

      expect(result).toEqual(mockArchivos);
      expect(mockCollection.find).toHaveBeenCalledWith({ propietario: 5, tipo: 'contrato' });
    });
  });
});
