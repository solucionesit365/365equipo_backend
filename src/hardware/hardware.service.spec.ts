import { Test, TestingModule } from '@nestjs/testing';
import { HardwareService } from './hardware.service';
import { HardwareDatabase } from './hardware.mongodb';
import { InternalServerErrorException } from '@nestjs/common';

describe('HardwareService', () => {
  let service: HardwareService;
  let mockDatabase: any;

  beforeEach(async () => {
    mockDatabase = {
      newHardWare: jest.fn(),
      getHardware: jest.fn(),
      updateHardware: jest.fn(),
      updateHardwareAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HardwareService,
        {
          provide: HardwareDatabase,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<HardwareService>(HardwareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('newHardware', () => {
    it('debe crear nuevo hardware', async () => {
      const hardware = {
        nombre: 'PC-001',
        tipo: 'Ordenador',
        estado: 'activo',
      };

      mockDatabase.newHardWare.mockResolvedValue({ insertedId: '123' });

      const result = await service.newHardware(hardware as any);

      expect(result).toEqual({ ok: true, data: 'Dispositivo creado' });
      expect(mockDatabase.newHardWare).toHaveBeenCalledWith(hardware);
    });

    it('debe lanzar InternalServerErrorException si falla', async () => {
      const hardware = { nombre: 'PC-001' };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockDatabase.newHardWare.mockRejectedValue(new Error('DB Error'));

      await expect(service.newHardware(hardware as any)).rejects.toThrow(
        InternalServerErrorException,
      );
      consoleSpy.mockRestore();
    });
  });

  describe('getHardware', () => {
    it('debe retornar lista de hardware', async () => {
      const mockHardware = [
        { _id: '1', nombre: 'PC-001' },
        { _id: '2', nombre: 'PC-002' },
      ];

      mockDatabase.getHardware.mockResolvedValue(mockHardware);

      const result = await service.getHardware();

      expect(result).toEqual(mockHardware);
    });

    it('debe retornar array vacío si no hay hardware', async () => {
      mockDatabase.getHardware.mockResolvedValue([]);

      const result = await service.getHardware();

      expect(result).toEqual([]);
    });
  });

  describe('updateHardware', () => {
    it('debe actualizar hardware', async () => {
      const hardware = { _id: '123', nombre: 'PC-Updated' };

      mockDatabase.updateHardware.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateHardware(hardware as any);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.updateHardware).toHaveBeenCalledWith(hardware);
    });
  });

  describe('updateHardwareAll', () => {
    it('debe actualizar todo el hardware', async () => {
      const hardware = { _id: '123', nombre: 'PC-All-Updated' };

      mockDatabase.updateHardwareAll.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateHardwareAll(hardware as any);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.updateHardwareAll).toHaveBeenCalledWith(hardware);
    });
  });
});
