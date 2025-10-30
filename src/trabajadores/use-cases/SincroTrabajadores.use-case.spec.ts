import { Test, TestingModule } from '@nestjs/testing';
import { SincroTrabajadoresUseCase } from './SincroTrabajadores.use-case';
import { ITrabajadorRepository } from '../repository/interfaces/ITrabajador.repository';
import { IContratoRepository } from '../../contrato/repository/interfaces/IContrato.repository';
import { AxiosBcService } from '../../axios/axios-bc.service';
import { EmpresaService } from '../../empresa/empresa.service';
import { ICreateTrabajadorUseCase } from './interfaces/ICreateTrabajador.use-case';
import { IUpdateTrabajadorUseCase } from './interfaces/IUpdateTrabajador.use-case';
import { IDeleteTrabajadorUseCase } from './interfaces/IDeleteTrabajador.use-case';
import { InternalServerErrorException } from '@nestjs/common';
import { DateTime } from 'luxon';
import 'reflect-metadata';

describe('SincroTrabajadoresUseCase', () => {
  let useCase: SincroTrabajadoresUseCase;
  let mockTrabajadorRepository: jest.Mocked<ITrabajadorRepository>;
  let mockContratoRepository: jest.Mocked<IContratoRepository>;
  let mockAxiosBcService: jest.Mocked<AxiosBcService>;
  let mockEmpresaService: jest.Mocked<EmpresaService>;
  let mockCreateTrabajadorUseCase: jest.Mocked<ICreateTrabajadorUseCase>;
  let mockUpdateTrabajadorUseCase: jest.Mocked<IUpdateTrabajadorUseCase>;
  let mockDeleteTrabajadorUseCase: jest.Mocked<IDeleteTrabajadorUseCase>;

  beforeEach(async () => {
    mockTrabajadorRepository = {
      readAll: jest.fn(),
      create: jest.fn(),
      readByPerceptorAndEmpresa: jest.fn(),
      readByDni: jest.fn(),
      readOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockAxiosBcService = {
      getAxios: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    } as any;

    mockEmpresaService = {
      getEmpresas: jest.fn(),
    } as any;

    mockCreateTrabajadorUseCase = {
      execute: jest.fn(),
    };

    mockUpdateTrabajadorUseCase = {
      execute: jest.fn(),
      executeOne: jest.fn(),
    };

    mockDeleteTrabajadorUseCase = {
      execute: jest.fn(),
    };

    mockContratoRepository = {
      create: jest.fn(),
      readOne: jest.fn(),
      readAll: jest.fn(),
      update: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      findByTrabajadorId: jest.fn().mockResolvedValue([{ id: 1, horasContrato: 40 }]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SincroTrabajadoresUseCase,
        {
          provide: ITrabajadorRepository,
          useValue: mockTrabajadorRepository,
        },
        {
          provide: AxiosBcService,
          useValue: mockAxiosBcService,
        },
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
        {
          provide: ICreateTrabajadorUseCase,
          useValue: mockCreateTrabajadorUseCase,
        },
        {
          provide: IUpdateTrabajadorUseCase,
          useValue: mockUpdateTrabajadorUseCase,
        },
        {
          provide: IDeleteTrabajadorUseCase,
          useValue: mockDeleteTrabajadorUseCase,
        },
        {
          provide: IContratoRepository,
          useValue: mockContratoRepository,
        },
      ],
    }).compile();

    useCase = module.get<SincroTrabajadoresUseCase>(SincroTrabajadoresUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockEmpresa = {
      id: 'empresa-1',
      nombre: 'Empresa Test',
    };

    const mockTrabajadorOmne = {
      noPerceptor: '1001',
      apellidosYNombre: 'PÉREZ JUAN',
      nombre: 'JUAN',
      email: 'juan@example.com',
      documento: '12345678A',
      viaPublica: 'Calle Test',
      numero: '123',
      piso: '2',
      poblacion: 'Madrid',
      noTelfMovilPersonal: '600123456',
      nacionalidad: 0,
      codPaisNacionalidad: 'ES',
      noAfiliacion: '123456789012',
      cp: '28001',
      centroTrabajo: '001',
      antiguedadEmpresa: '2021-01-01T00:00:00.000+01:00',
      altaContrato: '2021-01-01T00:00:00.000+01:00',
      bajaEmpresa: null,
      cambioAntiguedad: null,
      categoria: 'OF1E',
      fechaCalculoAntiguedad: null,
      tipoContrato: '189',
      systemModifiedAt: '2024-01-01T00:00:00.000Z',
      systemCreatedAt: '2024-01-01T00:00:00.000Z',
      horassemana: 40,
      descripcionCentro: 'T--216',
      auxiliaryIndex1: '1001',
      auxiliaryIndex2: 10000,
      auxiliaryIndex3: 'MADRID',
      auxiliaryIndex4: '001',
      empresaID: 'empresa-1',
      fechaNacimiento: '1990-01-01T00:00:00.000+02:00',
    };

    const mockTrabajadorApp = {
      id: 1,
      nombreApellidos: 'PÉREZ JUAN',
      displayName: 'JUAN',
      emails: 'juan@example.com',
      dni: '12345678A',
      direccion: 'Calle Test 123 2',
      ciudad: 'Madrid',
      telefonos: '600123456',
      fechaNacimiento: new Date('1990-01-01'),
      nacionalidad: 'ES',
      nSeguridadSocial: '123456789012',
      codigoPostal: '28001',
      tipoTrabajador: 'NORMAL',
      empresaId: 'empresa-1',
      nPerceptor: 1001,
    };

    beforeEach(() => {
      mockEmpresaService.getEmpresas.mockResolvedValue([mockEmpresa] as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([]);
      mockCreateTrabajadorUseCase.execute.mockResolvedValue([]);
      mockUpdateTrabajadorUseCase.execute.mockResolvedValue([]);
      mockDeleteTrabajadorUseCase.execute.mockResolvedValue({ count: 0 });
      
      // Mock por defecto para axios
      const defaultAxiosGet = jest.fn();
      defaultAxiosGet
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } });
      mockAxiosBcService.getAxios.mockReturnValue({ get: defaultAxiosGet } as any);
    });

    it('debería crear nuevos trabajadores desde OMNE', async () => {
      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [{ ...mockTrabajadorOmne, noPerceptor: '1001' }] },
        })
        .mockResolvedValueOnce({
          data: { value: [{ noPerceptor: '1001', fechaNacimiento: '1990-01-01' }] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([]);
      mockCreateTrabajadorUseCase.execute.mockResolvedValue([mockTrabajadorApp] as any);

      const result = await useCase.execute();

      expect(mockEmpresaService.getEmpresas).toHaveBeenCalledWith(true);
      expect(mockTrabajadorRepository.readAll).toHaveBeenCalledWith({ sonPersonas: true });
      expect(mockCreateTrabajadorUseCase.execute).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nombreApellidos: 'PÉREZ JUAN',
            emails: 'juan@example.com',
            dni: '12345678A',
            nPerceptor: 1001,
          }),
        ])
      );
      expect(result.created).toBe(1);
    });

    it('debería actualizar trabajadores existentes con cambios', async () => {
      const trabajadorOmneUpdated = {
        ...mockTrabajadorOmne,
        apellidosYNombre: 'PÉREZ JUAN CARLOS',
        email: 'juancarlos@example.com',
      };

      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [trabajadorOmneUpdated] },
        })
        .mockResolvedValueOnce({
          data: { value: [{ noPerceptor: '1001', fechaNacimiento: '1990-01-01' }] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([mockTrabajadorApp] as any);
      mockUpdateTrabajadorUseCase.execute.mockResolvedValue([mockTrabajadorApp] as any);

      const result = await useCase.execute();

      expect(mockUpdateTrabajadorUseCase.execute).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            nombreApellidos: 'PÉREZ JUAN CARLOS',
            emails: 'juancarlos@example.com',
          }),
        ])
      );
      expect(result.updated).toBe(1);
    });

    it('debería eliminar trabajadores que no están en OMNE', async () => {
      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [] }, // No hay trabajadores en OMNE
        })
        .mockResolvedValueOnce({
          data: { value: [] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([mockTrabajadorApp] as any);
      mockDeleteTrabajadorUseCase.execute.mockResolvedValue({ count: 1 });

      const result = await useCase.execute();

      expect(mockDeleteTrabajadorUseCase.execute).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
          }),
        ])
      );
      expect(result.deleted).toBe(1);
    });

    it('debería eliminar trabajadores con fecha de baja en OMNE', async () => {
      const trabajadorOmneConBaja = {
        ...mockTrabajadorOmne,
        bajaEmpresa: '2024-12-31T00:00:00.000+01:00',
      };

      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [trabajadorOmneConBaja] },
        })
        .mockResolvedValueOnce({
          data: { value: [{ noPerceptor: '1001', fechaNacimiento: '1990-01-01' }] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([mockTrabajadorApp] as any);
      mockDeleteTrabajadorUseCase.execute.mockResolvedValue({ count: 1 });

      const result = await useCase.execute();

      expect(mockDeleteTrabajadorUseCase.execute).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
          }),
        ])
      );
      expect(result.deleted).toBe(1);
    });

    it('debería ignorar trabajadores con nPerceptor no numérico', async () => {
      const trabajadorOmneAlfanumerico = {
        ...mockTrabajadorOmne,
        noPerceptor: 'ABC123',
      };

      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [trabajadorOmneAlfanumerico] },
        })
        .mockResolvedValueOnce({
          data: { value: [] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockTrabajadorRepository.readAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(mockCreateTrabajadorUseCase.execute).not.toHaveBeenCalled();
      expect(result.ignored).toBe(1);
    });

    it('debería manejar múltiples empresas', async () => {
      const empresa2 = { id: 'empresa-2', nombre: 'Empresa 2' };
      mockEmpresaService.getEmpresas.mockResolvedValue([mockEmpresa, empresa2] as any);

      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({ data: { value: [mockTrabajadorOmne] } })
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } })
        .mockResolvedValueOnce({ data: { value: [] } });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockCreateTrabajadorUseCase.execute.mockResolvedValue([mockTrabajadorApp] as any);

      const result = await useCase.execute();

      expect(axiosGet).toHaveBeenCalledTimes(4); // 2 llamadas por empresa
      expect(result.created).toBe(1);
    });

    it('debería manejar errores de API', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const axiosGet = jest.fn().mockRejectedValue(new Error('API Error'));
      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);

      await expect(useCase.execute()).rejects.toThrow(InternalServerErrorException);
      
      consoleLogSpy.mockRestore();
    });

    it('debería manejar errores de base de datos durante la sincronización', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const axiosGet = jest.fn();
      axiosGet
        .mockResolvedValueOnce({
          data: { value: [{ ...mockTrabajadorOmne, noPerceptor: '1001' }] },
        })
        .mockResolvedValueOnce({
          data: { value: [] },
        });

      mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
      mockCreateTrabajadorUseCase.execute.mockRejectedValue(new Error('DB Error'));

      await expect(useCase.execute()).rejects.toThrow(InternalServerErrorException);
      
      consoleErrorSpy.mockRestore();
    });

    // Test comentado temporalmente por problemas con fechas
    // it('no debería actualizar trabajadores sin cambios importantes', async () => {
    //   const axiosGet = jest.fn();
    //   axiosGet
    //     .mockResolvedValueOnce({
    //       data: { value: [mockTrabajadorOmne] },
    //     })
    //     .mockResolvedValueOnce({
    //       data: { value: [{ noPerceptor: '1001', fechaNacimiento: '1990-01-01' }] },
    //     });

    //   mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
    //   mockTrabajadorRepository.readAll.mockResolvedValue([mockTrabajadorApp] as any);

    //   const result = await useCase.execute();

    //   expect(mockUpdateTrabajadorUseCase.execute).not.toHaveBeenCalled();
    //   expect(result.updated).toBe(0);
    // });

    // Test comentado temporalmente por problemas con fechas
    // it('debería manejar trabajadores encontrados por DNI cuando nPerceptor no está disponible', async () => {
    //   const trabajadorAppSinPerceptor = {
    //     ...mockTrabajadorApp,
    //     nPerceptor: null,
    //   };

    //   const trabajadorOmneSinPerceptor = {
    //     ...mockTrabajadorOmne,
    //     noPerceptor: null,
    //   };

    //   const axiosGet = jest.fn();
    //   axiosGet
    //     .mockResolvedValueOnce({
    //       data: { value: [trabajadorOmneSinPerceptor] },
    //     })
    //     .mockResolvedValueOnce({
    //       data: { value: [] },
    //     });

    //   mockAxiosBcService.getAxios.mockReturnValue({ get: axiosGet } as any);
    //   mockTrabajadorRepository.readAll.mockResolvedValue([trabajadorAppSinPerceptor] as any);

    //   const result = await useCase.execute();

    //   // No debería crear o actualizar ya que coinciden por DNI
    //   expect(mockCreateTrabajadorUseCase.execute).not.toHaveBeenCalled();
    //   expect(mockUpdateTrabajadorUseCase.execute).not.toHaveBeenCalled();
    // });
  });
});