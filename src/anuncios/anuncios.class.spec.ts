import { Test, TestingModule } from '@nestjs/testing';
import { AnunciosService } from './anuncios.class';
import { AnunciosDatabaseService } from './anuncios.mongodb';
import { DateTime } from 'luxon';

describe('AnunciosService', () => {
  let service: AnunciosService;
  let mockAnunciosDatabase: any;

  beforeEach(async () => {
    mockAnunciosDatabase = {
      getAnuncios: jest.fn(),
      addAnuncio: jest.fn(),
      updateAnuncio: jest.fn(),
      deleteAnuncio: jest.fn(),
      getAnuncioById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnunciosService,
        {
          provide: AnunciosDatabaseService,
          useValue: mockAnunciosDatabase,
        },
      ],
    }).compile();

    service = module.get<AnunciosService>(AnunciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAnuncios', () => {
    it('debe retornar anuncios cuando existen', async () => {
      const mockAnuncios = [
        { _id: '1', titulo: 'Anuncio 1' },
        { _id: '2', titulo: 'Anuncio 2' },
      ];

      mockAnunciosDatabase.getAnuncios.mockResolvedValue(mockAnuncios);

      const result = await service.getAnuncios();

      expect(result).toEqual(mockAnuncios);
      expect(mockAnunciosDatabase.getAnuncios).toHaveBeenCalledWith(undefined);
    });

    it('debe retornar anuncios filtrados por idTienda', async () => {
      const mockAnuncios = [{ _id: '1', titulo: 'Anuncio 1', idTienda: 100 }];

      mockAnunciosDatabase.getAnuncios.mockResolvedValue(mockAnuncios);

      const result = await service.getAnuncios(100);

      expect(result).toEqual(mockAnuncios);
      expect(mockAnunciosDatabase.getAnuncios).toHaveBeenCalledWith(100);
    });

    it('debe retornar null cuando no hay anuncios', async () => {
      mockAnunciosDatabase.getAnuncios.mockResolvedValue([]);

      const result = await service.getAnuncios();

      expect(result).toBeNull();
    });
  });

  describe('addAnuncio', () => {
    it('debe agregar un anuncio sin fecha de caducidad', async () => {
      const anuncio = {
        titulo: 'Nuevo Anuncio',
        descripcion: 'Descripcion',
        caducidad: '',
      };

      mockAnunciosDatabase.addAnuncio.mockResolvedValue({ insertedId: '123' });

      const result = await service.addAnuncio(anuncio as any);

      expect(result).toEqual({ insertedId: '123' });
      expect(mockAnunciosDatabase.addAnuncio).toHaveBeenCalledWith(anuncio);
    });

    it('debe convertir fecha de caducidad string a Date', async () => {
      const anuncio = {
        titulo: 'Nuevo Anuncio',
        descripcion: 'Descripcion',
        caducidad: '25/12/2024',
      };

      mockAnunciosDatabase.addAnuncio.mockResolvedValue({ insertedId: '123' });

      await service.addAnuncio(anuncio as any);

      expect(mockAnunciosDatabase.addAnuncio).toHaveBeenCalled();
      const calledAnuncio = mockAnunciosDatabase.addAnuncio.mock.calls[0][0];
      expect(calledAnuncio.caducidad).toBeInstanceOf(Date);
    });
  });

  describe('updateAnuncio', () => {
    it('debe actualizar un anuncio con fecha ISO', async () => {
      const anuncio = {
        _id: '123',
        titulo: 'Anuncio Actualizado',
        caducidad: '2024-12-25',
      };

      mockAnunciosDatabase.updateAnuncio.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateAnuncio(anuncio as any);

      expect(result).toEqual({ modifiedCount: 1 });
      const calledAnuncio = mockAnunciosDatabase.updateAnuncio.mock.calls[0][0];
      expect(calledAnuncio.caducidad).toBeInstanceOf(Date);
    });

    it('debe actualizar un anuncio con fecha formato dd/MM/yyyy', async () => {
      const anuncio = {
        _id: '123',
        titulo: 'Anuncio Actualizado',
        caducidad: '25/12/2024',
      };

      mockAnunciosDatabase.updateAnuncio.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateAnuncio(anuncio as any);

      expect(result).toEqual({ modifiedCount: 1 });
      const calledAnuncio = mockAnunciosDatabase.updateAnuncio.mock.calls[0][0];
      expect(calledAnuncio.caducidad).toBeInstanceOf(Date);
    });

    it('debe lanzar error con formato de fecha inválido', async () => {
      const anuncio = {
        _id: '123',
        titulo: 'Anuncio',
        caducidad: 'fecha-invalida',
      };

      await expect(service.updateAnuncio(anuncio as any)).rejects.toThrow(
        'Formato de fecha inválido',
      );
    });

    it('debe lanzar error si caducidad no es Date ni string válido', async () => {
      const anuncio = {
        _id: '123',
        titulo: 'Anuncio',
        caducidad: '   ',
      };

      await expect(service.updateAnuncio(anuncio as any)).rejects.toThrow('Fecha inválida');
    });

    it('debe aceptar caducidad ya como Date', async () => {
      const anuncio = {
        _id: '123',
        titulo: 'Anuncio',
        caducidad: new Date('2024-12-25'),
      };

      mockAnunciosDatabase.updateAnuncio.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateAnuncio(anuncio as any);

      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('deleteAnuncio', () => {
    it('debe eliminar un anuncio por id', async () => {
      mockAnunciosDatabase.deleteAnuncio.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteAnuncio('123');

      expect(result).toEqual({ deletedCount: 1 });
      expect(mockAnunciosDatabase.deleteAnuncio).toHaveBeenCalledWith('123');
    });
  });

  describe('getAnuncioById', () => {
    it('debe obtener un anuncio por id', async () => {
      const mockAnuncio = { _id: '123', titulo: 'Anuncio Test' };

      mockAnunciosDatabase.getAnuncioById.mockResolvedValue(mockAnuncio);

      const result = await service.getAnuncioById('123');

      expect(result).toEqual(mockAnuncio);
      expect(mockAnunciosDatabase.getAnuncioById).toHaveBeenCalledWith('123');
    });

    it('debe retornar null si no existe el anuncio', async () => {
      mockAnunciosDatabase.getAnuncioById.mockResolvedValue(null);

      const result = await service.getAnuncioById('999');

      expect(result).toBeNull();
    });
  });
});
