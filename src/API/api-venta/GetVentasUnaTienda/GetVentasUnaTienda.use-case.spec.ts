import { Test, TestingModule } from '@nestjs/testing';
import { GetVentasUnaTiendaUseCase } from './GetVentasUnaTienda.use-case';
import { AxiosBcHitService } from '../../../axios/axios-bc.hit.service';
import { DateTime } from 'luxon';
import { InternalServerErrorException } from '@nestjs/common';

describe('GetVentasUnaTiendaUseCase', () => {
  let useCase: GetVentasUnaTiendaUseCase;
  let axiosService: jest.Mocked<AxiosBcHitService>;

  beforeEach(async () => {
    const mockAxiosService = {
      getAxios: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetVentasUnaTiendaUseCase,
          useFactory: () => new GetVentasUnaTiendaUseCase(mockAxiosService as any),
        },
      ],
    }).compile();

    useCase = module.get<GetVentasUnaTiendaUseCase>(GetVentasUnaTiendaUseCase);
    axiosService = mockAxiosService as any;
  });

  describe('execute', () => {
    it('debe retornar ventas de una tienda específica', async () => {
      const mockData = {
        value: [
          { lloc: ' Tienda1 ', tmst: '2024-01-01T10:00:00Z', impo: 100 },
          { lloc: ' Tienda2 ', tmst: '2024-01-02T10:00:00Z', impo: 200 },
          { lloc: ' Tienda1 ', tmst: '2024-01-03T10:00:00Z', impo: 300 },
        ],
      };

      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      const result = await useCase.execute('tienda1');

      expect(result).toHaveLength(2);
      expect(result.every(v => v.lloc === 'tienda1')).toBe(true);
    });

    it('debe filtrar por fechas cuando se proporciona filtro', async () => {
      const mockData = {
        value: [
          { lloc: ' Tienda1 ', tmst: '2024-01-01T10:00:00Z', impo: 100 },
          { lloc: ' Tienda1 ', tmst: '2024-01-15T10:00:00Z', impo: 200 },
          { lloc: ' Tienda1 ', tmst: '2024-02-01T10:00:00Z', impo: 300 },
        ],
      };

      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      const filtroFecha = {
        fechaInicio: DateTime.fromISO('2024-01-01'),
        fechaFinal: DateTime.fromISO('2024-01-31'),
      };

      const result = await useCase.execute('tienda1', filtroFecha);

      expect(result).toHaveLength(2);
    });

    it('debe ordenar ventas por fecha descendente', async () => {
      const mockData = {
        value: [
          { lloc: ' Tienda1 ', tmst: '2024-01-01T10:00:00Z', impo: 100 },
          { lloc: ' Tienda1 ', tmst: '2024-01-03T10:00:00Z', impo: 300 },
          { lloc: ' Tienda1 ', tmst: '2024-01-02T10:00:00Z', impo: 200 },
        ],
      };

      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      const result = await useCase.execute('tienda1');

      expect(result[0].tmst.toISODate()).toBe('2024-01-03');
      expect(result[1].tmst.toISODate()).toBe('2024-01-02');
      expect(result[2].tmst.toISODate()).toBe('2024-01-01');
    });

    it('debe lanzar InternalServerErrorException en caso de error', async () => {
      const mockAxios = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      await expect(useCase.execute('tienda1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
