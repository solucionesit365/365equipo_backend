import { Test, TestingModule } from '@nestjs/testing';
import { GetVentasMultiTiendaUseCase } from './GetVentasMultiTienda.use-case';
import { AxiosBcHitService } from '../../../axios/axios-bc.hit.service';
import { DateTime } from 'luxon';
import { InternalServerErrorException } from '@nestjs/common';

describe('GetVentasMultiTiendaUseCase', () => {
  let useCase: GetVentasMultiTiendaUseCase;
  let axiosService: jest.Mocked<AxiosBcHitService>;

  beforeEach(async () => {
    const mockAxiosService = {
      getAxios: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetVentasMultiTiendaUseCase,
          useFactory: () => new GetVentasMultiTiendaUseCase(mockAxiosService as any),
        },
      ],
    }).compile();

    useCase = module.get<GetVentasMultiTiendaUseCase>(GetVentasMultiTiendaUseCase);
    axiosService = mockAxiosService as any;
  });

  describe('execute', () => {
    it('debe retornar ventas de múltiples tiendas', async () => {
      const mockData = {
        value: [
          { lloc: ' Tienda1 ', tmst: '2024-01-01T10:00:00Z', impo: 100 },
          { lloc: ' Tienda2 ', tmst: '2024-01-02T10:00:00Z', impo: 200 },
          { lloc: ' Tienda3 ', tmst: '2024-01-03T10:00:00Z', impo: 300 },
        ],
      };

      const mockAxios = {
        get: jest.fn().mockResolvedValue({ data: mockData }),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      const result = await useCase.execute(['tienda1', 'tienda2']);

      expect(result).toHaveLength(2);
      expect(result[0].lloc).toBe('tienda2');
      expect(result[1].lloc).toBe('tienda1');
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

      const result = await useCase.execute(['tienda1'], filtroFecha);

      expect(result).toHaveLength(2);
    });

    it('debe lanzar InternalServerErrorException en caso de error', async () => {
      const mockAxios = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      axiosService.getAxios.mockReturnValue(mockAxios as any);

      await expect(useCase.execute(['tienda1'])).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
