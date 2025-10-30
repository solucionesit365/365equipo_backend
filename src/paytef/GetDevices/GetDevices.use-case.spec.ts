import { Test, TestingModule } from '@nestjs/testing';
import { GetDevicesUseCase } from './GetDevices.use-case';
import { InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('GetDevicesUseCase', () => {
  let useCase: GetDevicesUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetDevicesUseCase],
    }).compile();

    useCase = module.get<GetDevicesUseCase>(GetDevicesUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debe retornar dispositivos Paytef correctamente', async () => {
      const mockResponse = {
        data: {
          branches: [
            {
              addressLine1: 'Calle 1',
              name: 'Tienda 1',
              terminals: ['T1', 'T2'],
              devices: ['D1'],
              extraField: 'ignored',
            },
            {
              addressLine1: 'Calle 2',
              name: 'Tienda 2',
              terminals: ['T3'],
              devices: ['D2', 'D3'],
              extraField: 'ignored',
            },
          ],
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await useCase.execute();

      expect(result.branches).toHaveLength(2);
      expect(result.branches[0]).toEqual({
        addressLine1: 'Calle 1',
        name: 'Tienda 1',
        terminals: ['T1', 'T2'],
        devices: ['D1'],
      });
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.paytef.es/json/api/configurationConsultation',
        expect.objectContaining({
          authentication: expect.objectContaining({
            company: '4066',
          }),
        }),
      );
    });

    it('debe lanzar InternalServerErrorException en caso de error', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(useCase.execute()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
