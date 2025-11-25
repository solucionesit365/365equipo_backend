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
  let emailService: jest.Mocked<EmailService>;
  let trabajadorService: jest.Mocked<TrabajadorService>;

  beforeEach(async () => {
    const mockDatabase = {
      nuevaSolicitudVacaciones: jest.fn(),
      getSolicitudes: jest.fn(),
      getSolicitudesTrabajadorSqlId: jest.fn(),
      getsolicitudesSubordinados: jest.fn(),
      getSolicitudesById: jest.fn(),
      getVacacionesByTiendas: jest.fn(),
      getVacacionesByEstado: jest.fn(),
      borrarSolicitud: jest.fn(),
      updateSolicitudVacacionesEstado: jest.fn(),
      actualizarIdAppResponsable: jest.fn(),
      haySolicitudesParaBeneficiario: jest.fn(),
      getSolicitudesMultiplesTrabajadores: jest.fn(),
    };

    const mockEmailService = {
      enviarEmail: jest.fn(),
    };

    const mockTrabajadorService = {
      getTrabajadorById: jest.fn(),
      getTrabajadores: jest.fn(),
      getTrabajadorBySqlId: jest.fn(),
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
    emailService = module.get(EmailService);
    trabajadorService = module.get(TrabajadorService);
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

    it('debe manejar error cuando falla la inserción', async () => {
      const mockSolicitud = {
        idBeneficiario: 1,
        fechaInicio: new Date('2024-07-01'),
        fechaFin: new Date('2024-07-15'),
      };

      contratoService.getHorasContratoByIdNew.mockResolvedValue(40);
      database.nuevaSolicitudVacaciones.mockResolvedValue(null as any);

      const result = await service.nuevaSolicitudVacaciones(mockSolicitud as any);

      expect(result).toBeUndefined();
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

  describe('getSolicitudesTrabajadorSqlId', () => {
    it('debe retornar solicitudes de un trabajador por idSql', async () => {
      const mockSolicitudes = [{ id: '1', idBeneficiario: 1 }];

      database.getSolicitudesTrabajadorSqlId.mockResolvedValue(mockSolicitudes as any);

      const result = await service.getSolicitudesTrabajadorSqlId(1, 2024);

      expect(result).toEqual(mockSolicitudes);
      expect(database.getSolicitudesTrabajadorSqlId).toHaveBeenCalledWith(1, 2024);
    });
  });

  describe('getsolicitudesSubordinados', () => {
    it('debe retornar solicitudes de subordinados', async () => {
      const mockSolicitudes = [{ id: '1' }, { id: '2' }];

      database.getsolicitudesSubordinados.mockResolvedValue(mockSolicitudes as any);

      const result = await service.getsolicitudesSubordinados('uid-responsable', 2024);

      expect(result).toEqual(mockSolicitudes);
      expect(database.getsolicitudesSubordinados).toHaveBeenCalledWith('uid-responsable', 2024);
    });
  });

  describe('getSolicitudesById', () => {
    it('debe retornar una solicitud por _id', async () => {
      const mockSolicitud = { _id: 'abc123', idBeneficiario: 1 };

      database.getSolicitudesById.mockResolvedValue(mockSolicitud as any);

      const result = await service.getSolicitudesById('abc123');

      expect(result).toEqual(mockSolicitud);
      expect(database.getSolicitudesById).toHaveBeenCalledWith('abc123');
    });
  });

  describe('getVacacionesByTiendas', () => {
    it('debe retornar vacaciones por nombre de tienda', async () => {
      const mockVacaciones = [{ id: '1', tienda: 'Tienda Central' }];

      database.getVacacionesByTiendas.mockResolvedValue(mockVacaciones as any);

      const result = await service.getVacacionesByTiendas('Tienda Central');

      expect(result).toEqual(mockVacaciones);
      expect(database.getVacacionesByTiendas).toHaveBeenCalledWith('Tienda Central');
    });
  });

  describe('getVacacionesByEstado', () => {
    it('debe retornar vacaciones por estado', async () => {
      const mockVacaciones = [{ id: '1', estado: 'APROBADA' }];

      database.getVacacionesByEstado.mockResolvedValue(mockVacaciones as any);

      const result = await service.getVacacionesByEstado('APROBADA');

      expect(result).toEqual(mockVacaciones);
      expect(database.getVacacionesByEstado).toHaveBeenCalledWith('APROBADA');
    });
  });

  describe('borrarSolicitud', () => {
    it('debe borrar una solicitud existente', async () => {
      const mockVacaciones = {
        _id: 'abc123',
        fechaInicio: '1/7/2024',
        fechaFinal: '15/7/2024',
      };

      database.getSolicitudesById.mockResolvedValue(mockVacaciones as any);
      database.borrarSolicitud.mockResolvedValue(true as any);

      const result = await service.borrarSolicitud('abc123');

      expect(result).toBe(true);
      expect(database.getSolicitudesById).toHaveBeenCalledWith('abc123');
      expect(database.borrarSolicitud).toHaveBeenCalledWith('abc123');
    });

    it('debe lanzar error cuando la solicitud no existe', async () => {
      database.getSolicitudesById.mockResolvedValue(null as any);

      await expect(service.borrarSolicitud('nonexistent')).rejects.toThrow(
        'Vacaciones no encontrada',
      );
    });
  });

  describe('enviarAlEmail', () => {
    it('debe enviar email con los datos de vacaciones', async () => {
      const mockVacaciones = {
        idBeneficiario: 1,
        fechaInicio: '01/07/2024',
        fechaFinal: '15/07/2024',
        fechaIncorporacion: '16/07/2024',
        fechaCreacion: '01/06/2024',
        observaciones: 'Test',
        totalDias: 10,
        estado: 'PENDIENTE',
      };

      const mockTrabajador = {
        id: 1,
        emails: 'test@example.com',
        nombreApellidos: 'Test User',
      };

      trabajadorService.getTrabajadorBySqlId.mockResolvedValue(mockTrabajador as any);

      const result = await service.enviarAlEmail(mockVacaciones);

      expect(result).toEqual({ ok: true });
      expect(trabajadorService.getTrabajadorBySqlId).toHaveBeenCalledWith(1);
      expect(emailService.enviarEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringContaining('Solicitud de Vacaciones'),
        'Confirmación de Solicitud de Vacaciones',
      );
    });
  });

  describe('ponerEnCuadrante', () => {
    it('debe retornar ok cuando hay vacaciones', async () => {
      const mockVacaciones = { id: '1' };

      const result = await service.ponerEnCuadrante(mockVacaciones);

      expect(result).toEqual({ ok: true });
    });

    it('debe retornar undefined cuando no hay vacaciones', async () => {
      const result = await service.ponerEnCuadrante(null);

      expect(result).toBeUndefined();
    });
  });

  describe('updateSolicitudVacacionesEstado', () => {
    it('debe actualizar el estado de una solicitud', async () => {
      const mockSolicitud = {
        _id: 'abc123',
        estado: 'APROBADA',
      };

      database.updateSolicitudVacacionesEstado.mockResolvedValue(true as any);
      database.getSolicitudesById.mockResolvedValue(mockSolicitud as any);

      const result = await service.updateSolicitudVacacionesEstado(mockSolicitud as any);

      expect(result).toBe(true);
      expect(database.updateSolicitudVacacionesEstado).toHaveBeenCalledWith(mockSolicitud);
    });

    it('debe lanzar error cuando falla la actualización', async () => {
      const mockSolicitud = {
        _id: 'abc123',
        estado: 'RECHAZADA',
      };

      database.updateSolicitudVacacionesEstado.mockResolvedValue(null as any);

      await expect(service.updateSolicitudVacacionesEstado(mockSolicitud as any)).rejects.toThrow(
        'No ha sido posible modificar el estado de la solicitud',
      );
    });
  });

  describe('actualizarIdAppResponsable', () => {
    it('debe actualizar el idAppResponsable', async () => {
      database.actualizarIdAppResponsable.mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await service.actualizarIdAppResponsable(1, 'uid-responsable');

      expect(result).toEqual({ modifiedCount: 1 });
      expect(database.actualizarIdAppResponsable).toHaveBeenCalledWith(1, 'uid-responsable');
    });
  });

  describe('haySolicitudesParaBeneficiario', () => {
    it('debe retornar true cuando hay solicitudes', async () => {
      database.haySolicitudesParaBeneficiario.mockResolvedValue(true as any);

      const result = await service.haySolicitudesParaBeneficiario(1);

      expect(result).toBe(true);
      expect(database.haySolicitudesParaBeneficiario).toHaveBeenCalledWith(1);
    });

    it('debe retornar false cuando no hay solicitudes', async () => {
      database.haySolicitudesParaBeneficiario.mockResolvedValue(false as any);

      const result = await service.haySolicitudesParaBeneficiario(999);

      expect(result).toBe(false);
    });
  });

  describe('getSolicitudesMultiplesTrabajadores', () => {
    it('debe retornar solicitudes de múltiples trabajadores', async () => {
      const mockSolicitudes = [
        { id: '1', idBeneficiario: 1 },
        { id: '2', idBeneficiario: 2 },
        { id: '3', idBeneficiario: 3 },
      ];

      database.getSolicitudesMultiplesTrabajadores.mockResolvedValue(mockSolicitudes as any);

      const result = await service.getSolicitudesMultiplesTrabajadores([1, 2, 3], 2024);

      expect(result).toEqual(mockSolicitudes);
      expect(database.getSolicitudesMultiplesTrabajadores).toHaveBeenCalledWith([1, 2, 3], 2024);
    });

    it('debe retornar array vacío cuando no hay solicitudes', async () => {
      database.getSolicitudesMultiplesTrabajadores.mockResolvedValue([] as any);

      const result = await service.getSolicitudesMultiplesTrabajadores([999], 2024);

      expect(result).toEqual([]);
    });
  });
});
