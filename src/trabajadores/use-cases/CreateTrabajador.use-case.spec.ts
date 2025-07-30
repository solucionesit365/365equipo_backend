import { Test, TestingModule } from '@nestjs/testing';
import { CreateTrabajadorUseCase } from './CreateTrabajador.use-case';
import { ITrabajadorRepository } from '../repository/interfaces/ITrabajador.repository';
import { ICreateContratoUseCase } from '../../contrato/use-cases/interfaces/ICreateContrato.use-case';
import { ICreateTrabajadorDto } from './interfaces/ICreateTrabajador.use-case';
import 'reflect-metadata';

describe('CreateTrabajadorUseCase', () => {
  let useCase: CreateTrabajadorUseCase;
  let mockTrabajadorRepository: jest.Mocked<ITrabajadorRepository>;
  let mockCreateContratoUseCase: jest.Mocked<ICreateContratoUseCase>;

  beforeEach(async () => {
    mockTrabajadorRepository = {
      create: jest.fn(),
      readByPerceptorAndEmpresa: jest.fn(),
      readByDni: jest.fn(),
      readOne: jest.fn(),
      readAll: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockCreateContratoUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTrabajadorUseCase,
        {
          provide: ITrabajadorRepository,
          useValue: mockTrabajadorRepository,
        },
        {
          provide: ICreateContratoUseCase,
          useValue: mockCreateContratoUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CreateTrabajadorUseCase>(CreateTrabajadorUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockTrabajadorDto: ICreateTrabajadorDto = {
      nombreApellidos: 'Juan Pérez',
      displayName: 'Juan',
      emails: 'juan@example.com',
      dni: '12345678A',
      direccion: 'Calle Test 123',
      ciudad: 'Madrid',
      telefonos: '600123456',
      fechaNacimiento: new Date('1990-01-01'),
      nacionalidad: 'Española',
      nSeguridadSocial: '12345678901',
      codigoPostal: '28001',
      tipoTrabajador: 'FIJO',
      empresaId: 'empresa-1',
      nPerceptor: 1001,
      horasContrato: 40,
      inicioContrato: new Date('2024-01-01'),
      fechaAlta: new Date('2024-01-01'),
      fechaAntiguedad: new Date('2024-01-01'),
    };

    it('debería crear un nuevo trabajador y contrato', async () => {
      const createdTrabajador = {
        id: 1,
        ...mockTrabajadorDto,
      };

      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(null);
      mockTrabajadorRepository.readByDni.mockResolvedValue(null);
      mockTrabajadorRepository.create.mockResolvedValue(createdTrabajador as any);

      const result = await useCase.execute([mockTrabajadorDto]);

      expect(mockTrabajadorRepository.readByPerceptorAndEmpresa).toHaveBeenCalledWith(
        mockTrabajadorDto.nPerceptor,
        mockTrabajadorDto.empresaId
      );
      expect(mockTrabajadorRepository.readByDni).toHaveBeenCalledWith(mockTrabajadorDto.dni);
      
      expect(mockTrabajadorRepository.create).toHaveBeenCalledWith({
        nombreApellidos: mockTrabajadorDto.nombreApellidos,
        displayName: mockTrabajadorDto.displayName,
        emails: mockTrabajadorDto.emails,
        dni: mockTrabajadorDto.dni,
        direccion: mockTrabajadorDto.direccion,
        ciudad: mockTrabajadorDto.ciudad,
        telefonos: mockTrabajadorDto.telefonos,
        fechaNacimiento: mockTrabajadorDto.fechaNacimiento,
        nacionalidad: mockTrabajadorDto.nacionalidad,
        nSeguridadSocial: mockTrabajadorDto.nSeguridadSocial,
        codigoPostal: mockTrabajadorDto.codigoPostal,
        tipoTrabajador: mockTrabajadorDto.tipoTrabajador,
        llevaEquipo: false,
        excedencia: false,
        empresa: {
          connect: {
            id: mockTrabajadorDto.empresaId,
          },
        },
        nPerceptor: mockTrabajadorDto.nPerceptor,
      });

      expect(mockCreateContratoUseCase.execute).toHaveBeenCalledWith({
        horasContrato: mockTrabajadorDto.horasContrato,
        inicioContrato: mockTrabajadorDto.inicioContrato,
        finalContrato: mockTrabajadorDto.finalContrato,
        fechaAlta: mockTrabajadorDto.fechaAlta,
        fechaAntiguedad: mockTrabajadorDto.fechaAntiguedad,
        fechaBaja: undefined,
        idTrabajador: createdTrabajador.id,
      });

      expect(result).toEqual([createdTrabajador]);
    });

    it('debería omitir trabajador si ya existe por nPerceptor y empresa', async () => {
      const existingTrabajador = { id: 1, ...mockTrabajadorDto };
      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(existingTrabajador as any);

      const result = await useCase.execute([mockTrabajadorDto]);

      expect(mockTrabajadorRepository.readByPerceptorAndEmpresa).toHaveBeenCalled();
      expect(mockTrabajadorRepository.create).not.toHaveBeenCalled();
      expect(mockCreateContratoUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debería omitir trabajador si ya existe por DNI', async () => {
      const existingTrabajador = { id: 1, ...mockTrabajadorDto };
      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(null);
      mockTrabajadorRepository.readByDni.mockResolvedValue(existingTrabajador as any);

      const result = await useCase.execute([mockTrabajadorDto]);

      expect(mockTrabajadorRepository.readByDni).toHaveBeenCalledWith(mockTrabajadorDto.dni);
      expect(mockTrabajadorRepository.create).not.toHaveBeenCalled();
      expect(mockCreateContratoUseCase.execute).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('debería crear trabajador sin nPerceptor', async () => {
      const trabajadorWithoutPerceptor = { ...mockTrabajadorDto, nPerceptor: undefined };
      const createdTrabajador = { id: 1, ...trabajadorWithoutPerceptor };

      mockTrabajadorRepository.readByDni.mockResolvedValue(null);
      mockTrabajadorRepository.create.mockResolvedValue(createdTrabajador as any);

      const result = await useCase.execute([trabajadorWithoutPerceptor]);

      expect(mockTrabajadorRepository.readByPerceptorAndEmpresa).not.toHaveBeenCalled();
      expect(mockTrabajadorRepository.readByDni).toHaveBeenCalledWith(trabajadorWithoutPerceptor.dni);
      expect(mockTrabajadorRepository.create).toHaveBeenCalled();
      expect(result).toEqual([createdTrabajador]);
    });

    it('debería crear trabajador sin DNI', async () => {
      const trabajadorWithoutDni = { ...mockTrabajadorDto, dni: '' };
      const createdTrabajador = { id: 1, ...trabajadorWithoutDni };

      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(null);
      mockTrabajadorRepository.create.mockResolvedValue(createdTrabajador as any);

      const result = await useCase.execute([trabajadorWithoutDni]);

      expect(mockTrabajadorRepository.readByPerceptorAndEmpresa).toHaveBeenCalled();
      expect(mockTrabajadorRepository.readByDni).not.toHaveBeenCalled();
      expect(mockTrabajadorRepository.create).toHaveBeenCalled();
      expect(result).toEqual([createdTrabajador]);
    });

    it('debería crear múltiples trabajadores', async () => {
      const trabajador1 = { ...mockTrabajadorDto, dni: '11111111A', nPerceptor: 1001 };
      const trabajador2 = { ...mockTrabajadorDto, dni: '22222222B', nPerceptor: 1002 };
      
      const createdTrabajador1 = { id: 1, ...trabajador1 };
      const createdTrabajador2 = { id: 2, ...trabajador2 };

      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(null);
      mockTrabajadorRepository.readByDni.mockResolvedValue(null);
      mockTrabajadorRepository.create
        .mockResolvedValueOnce(createdTrabajador1 as any)
        .mockResolvedValueOnce(createdTrabajador2 as any);

      const result = await useCase.execute([trabajador1, trabajador2]);

      expect(mockTrabajadorRepository.create).toHaveBeenCalledTimes(2);
      expect(mockCreateContratoUseCase.execute).toHaveBeenCalledTimes(2);
      expect(result).toEqual([createdTrabajador1, createdTrabajador2]);
    });

    it('debería usar nombreApellidos como displayName si displayName no se proporciona', async () => {
      const trabajadorWithoutDisplayName = { ...mockTrabajadorDto, displayName: undefined };
      const createdTrabajador = { id: 1, ...trabajadorWithoutDisplayName };

      mockTrabajadorRepository.readByPerceptorAndEmpresa.mockResolvedValue(null);
      mockTrabajadorRepository.readByDni.mockResolvedValue(null);
      mockTrabajadorRepository.create.mockResolvedValue(createdTrabajador as any);

      await useCase.execute([trabajadorWithoutDisplayName]);

      expect(mockTrabajadorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: trabajadorWithoutDisplayName.nombreApellidos,
        })
      );
    });
  });
});