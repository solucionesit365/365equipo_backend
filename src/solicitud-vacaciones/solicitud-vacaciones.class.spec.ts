import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudesVacacionesService } from './solicitud-vacaciones.class';
import { SolicitudVacacionesDatabase } from './solicitud-vacaciones.mongodb';
import { EmailService } from '../email/email.class';
import { TrabajadorService } from '../trabajadores/trabajadores.class';
import { Cuadrantes } from '../cuadrantes/cuadrantes.class';
import { ContratoService } from '../contrato/contrato.service';

describe('SolicitudesVacacionesService', () => {
  let service: SolicitudesVacacionesService;
  let database: jest.Mocked<SolicitudVacacionesDatabase>;
  let contratoService: jest.Mocked<ContratoService>;

  beforeEach(async () => {
    const mockDatabase = {
      nuevaSolicitudVacaciones: jest.fn(),
      getSolicitudes: jest.fn(),
      updateSolicitud: jest.fn(),
      deleteSolicitud: jest.fn(),
    };

    const mockEmailService = {
      enviarEmail: jest.fn(),
    };

    const mockTrabajadorService = {
      getTrabajadorById: jest.fn(),
      getTrabajadores: jest.fn(),
    };

    const mockContratoService = {
      getHorasContratoByIdNew: jest.fn(),
    };

    const mockCuadrantes = {
      getCuadrante: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolicitudesVacacionesService,
        { provide: SolicitudVacacionesDatabase, useValue: mockDatabase },
        { provide: EmailService, useValue: mockEmailService },
        { provide: TrabajadorService, useValue: mockTrabajadorService },
        { provide: ContratoService, useValue: mockContratoService },
        { provide: Cuadrantes, useValue: mockCuadrantes },
      ],
    }).compile();

    service = module.get<SolicitudesVacacionesService>(SolicitudesVacacionesService);
    database = module.get(SolicitudVacacionesDatabase);
    contratoService = module.get(ContratoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('nuevaSolicitudVacaciones', () => {
    it('debe crear una solicitud de vacaciones correctamente', async () => {
      const mockSolicitud = {
        idBeneficiario: 1,
        fechaInicio: new Date('2024-07-01'),
        fechaFin: new Date('2024-07-15'),
        diasSolicitados: 10,
        estado: 'Pendiente',
      };

      contratoService.getHorasContratoByIdNew.mockResolvedValue(40);
      database.nuevaSolicitudVacaciones.mockResolvedValue('solicitud123' as any);

      const result = await service.nuevaSolicitudVacaciones(mockSolicitud as any);

      expect(result).toBe(true);
      expect(contratoService.getHorasContratoByIdNew).toHaveBeenCalled();
      expect(database.nuevaSolicitudVacaciones).toHaveBeenCalled();
    });

    it('debe manejar idBeneficiario como objeto', async () => {
      const mockSolicitud = {
        idBeneficiario: { id: 5 },
        fechaInicio: new Date('2024-07-01'),
        fechaFin: new Date('2024-07-15'),
      };

      contratoService.getHorasContratoByIdNew.mockResolvedValue(40);
      database.nuevaSolicitudVacaciones.mockResolvedValue('solicitud456' as any);

      await service.nuevaSolicitudVacaciones(mockSolicitud as any);

      expect(contratoService.getHorasContratoByIdNew).toHaveBeenCalledWith(5, expect.anything());
    });
  });

  describe('getSolicitudes', () => {
    it('debe retornar solicitudes por año', async () => {
      const mockSolicitudes = [
        { id: '1', idBeneficiario: 1, fechaInicio: new Date('2024-07-01') },
        { id: '2', idBeneficiario: 2, fechaInicio: new Date('2024-08-01') },
      ];

      database.getSolicitudes.mockResolvedValue(mockSolicitudes as any);

      const result = await service.getSolicitudes(2024);

      expect(result).toEqual(mockSolicitudes);
      expect(database.getSolicitudes).toHaveBeenCalledWith(2024);
    });
  });
});
