import { Test, TestingModule } from '@nestjs/testing';
import { EncargosService } from './encargos.service';
import { EncargosDatabase } from './encargos.mongodb';
import { DateTime } from 'luxon';

describe('EncargosService', () => {
  let service: EncargosService;
  let mockDatabase: any;

  beforeEach(async () => {
    mockDatabase = {
      newEncargo: jest.fn(),
      getEncargos: jest.fn(),
      updateEncargo: jest.fn(),
      getAllEncargos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncargosService,
        {
          provide: EncargosDatabase,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<EncargosService>(EncargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('newEncargo', () => {
    it('debe crear un encargo con fecha string', async () => {
      const encargo = {
        titulo: 'Nuevo encargo',
        idTienda: 100,
        fechaEntrega: '25/12/2024',
      };

      mockDatabase.newEncargo.mockResolvedValue({ insertedId: '123' });

      const result = await service.newEncargo(encargo as any);

      expect(result).toEqual({ insertedId: '123' });
      expect(mockDatabase.newEncargo).toHaveBeenCalled();
      const calledEncargo = mockDatabase.newEncargo.mock.calls[0][0];
      expect(calledEncargo.fechaEntrega).toBeInstanceOf(Date);
    });

    it('debe crear un encargo con fecha ya como Date', async () => {
      const fechaDate = new Date('2024-12-25');
      const encargo = {
        titulo: 'Encargo',
        idTienda: 100,
        fechaEntrega: fechaDate,
      };

      mockDatabase.newEncargo.mockResolvedValue({ insertedId: '456' });

      const result = await service.newEncargo(encargo as any);

      expect(result).toEqual({ insertedId: '456' });
    });
  });

  describe('getEncargos', () => {
    it('debe retornar encargos por idTienda', async () => {
      const mockEncargos = [
        { _id: '1', titulo: 'Encargo 1', idTienda: 100 },
        { _id: '2', titulo: 'Encargo 2', idTienda: 100 },
      ];

      mockDatabase.getEncargos.mockResolvedValue(mockEncargos);

      const result = await service.getEncargos(100);

      expect(result).toEqual(mockEncargos);
      expect(mockDatabase.getEncargos).toHaveBeenCalledWith(100);
    });

    it('debe retornar error si no hay idTienda', async () => {
      const result = await service.getEncargos(0);

      expect(result).toEqual({ ok: false, data: 'No hay tienda' });
      expect(mockDatabase.getEncargos).not.toHaveBeenCalled();
    });

    it('debe retornar error si idTienda es null', async () => {
      const result = await service.getEncargos(null);

      expect(result).toEqual({ ok: false, data: 'No hay tienda' });
    });
  });

  describe('updateEncargo', () => {
    it('debe actualizar un encargo', async () => {
      const encargo = {
        _id: '123',
        titulo: 'Encargo actualizado',
        idTienda: 100,
      };

      mockDatabase.updateEncargo.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateEncargo(encargo as any);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.updateEncargo).toHaveBeenCalledWith(encargo);
    });

    it('debe retornar error si no hay encargo', async () => {
      const result = await service.updateEncargo(null);

      expect(result).toEqual({ ok: false, data: 'No hay tienda' });
      expect(mockDatabase.updateEncargo).not.toHaveBeenCalled();
    });
  });

  describe('getAllEncargos', () => {
    it('debe retornar todos los encargos', async () => {
      const mockEncargos = [
        { _id: '1', titulo: 'Encargo 1' },
        { _id: '2', titulo: 'Encargo 2' },
      ];

      mockDatabase.getAllEncargos.mockResolvedValue(mockEncargos);

      const result = await service.getAllEncargos();

      expect(result).toEqual(mockEncargos);
      expect(mockDatabase.getAllEncargos).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay encargos', async () => {
      mockDatabase.getAllEncargos.mockResolvedValue([]);

      const result = await service.getAllEncargos();

      expect(result).toEqual([]);
    });
  });
});
