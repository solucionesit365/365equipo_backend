import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriasService } from './auditorias.class';
import { AuditoriaDatabase } from './auditorias.mongodb';

describe('AuditoriasService', () => {
  let service: AuditoriasService;
  let mockDatabase: any;

  beforeEach(async () => {
    mockDatabase = {
      nuevaAuditoria: jest.fn(),
      getAuditorias: jest.fn(),
      getAuditoriasHabilitado: jest.fn(),
      updateHabilitarAuditoria: jest.fn(),
      updateDeshabilitarAuditoria: jest.fn(),
      respuestasAuditorias: jest.fn(),
      getRespuestasAuditorias: jest.fn(),
      getAuditoriasTienda: jest.fn(),
      getAuditoriasTiendas: jest.fn(),
      deleteAuditoria: jest.fn(),
      updateAuditoria: jest.fn(),
      updateAuditoriaRespuestas: jest.fn(),
      getAuditoriasById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriasService,
        {
          provide: AuditoriaDatabase,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<AuditoriasService>(AuditoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('nuevaAuditoria', () => {
    it('debe crear una auditoria y retornar true', async () => {
      const auditoria = {
        titulo: 'Nueva auditoría',
        preguntas: [],
        habilitado: true,
      };

      mockDatabase.nuevaAuditoria.mockResolvedValue({ insertedId: '123' });

      const result = await service.nuevaAuditoria(auditoria as any);

      expect(result).toBe(true);
      expect(mockDatabase.nuevaAuditoria).toHaveBeenCalledWith(auditoria);
    });

    it('debe lanzar error si falla la inserción', async () => {
      const auditoria = { titulo: 'Auditoria' };

      mockDatabase.nuevaAuditoria.mockResolvedValue(null);

      await expect(service.nuevaAuditoria(auditoria as any)).rejects.toThrow(
        'No se ha podido insertar la auditoria',
      );
    });
  });

  describe('getAuditorias', () => {
    it('debe retornar todas las auditorias', async () => {
      const mockAuditorias = [
        { _id: '1', titulo: 'Auditoria 1' },
        { _id: '2', titulo: 'Auditoria 2' },
      ];

      mockDatabase.getAuditorias.mockResolvedValue(mockAuditorias);

      const result = await service.getAuditorias();

      expect(result).toEqual(mockAuditorias);
    });
  });

  describe('getAuditoriasHabilitado', () => {
    it('debe retornar auditorias habilitadas', async () => {
      const mockAuditorias = [{ _id: '1', titulo: 'Auditoria', habilitado: true }];

      mockDatabase.getAuditoriasHabilitado.mockResolvedValue(mockAuditorias);

      const result = await service.getAuditoriasHabilitado(true);

      expect(result).toEqual(mockAuditorias);
      expect(mockDatabase.getAuditoriasHabilitado).toHaveBeenCalledWith(true);
    });

    it('debe retornar auditorias deshabilitadas', async () => {
      const mockAuditorias = [{ _id: '1', habilitado: false }];

      mockDatabase.getAuditoriasHabilitado.mockResolvedValue(mockAuditorias);

      const result = await service.getAuditoriasHabilitado(false);

      expect(result).toEqual(mockAuditorias);
      expect(mockDatabase.getAuditoriasHabilitado).toHaveBeenCalledWith(false);
    });
  });

  describe('updateHabilitarAuditoria', () => {
    it('debe habilitar una auditoria', async () => {
      const auditoria = { _id: '123', titulo: 'Auditoria' };

      mockDatabase.updateHabilitarAuditoria.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateHabilitarAuditoria(auditoria as any);

      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('updateDeshabilitarAuditoria', () => {
    it('debe deshabilitar una auditoria', async () => {
      const auditoria = { _id: '123', titulo: 'Auditoria' };

      mockDatabase.updateDeshabilitarAuditoria.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateDeshabilitarAuditoria(auditoria as any);

      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('respuestasAuditorias', () => {
    it('debe guardar respuesta y retornar true', async () => {
      const respuesta = {
        idAuditoria: '123',
        respuestas: [{ pregunta: 1, respuesta: 'Si' }],
      };

      mockDatabase.respuestasAuditorias.mockResolvedValue({ insertedId: 'abc' });

      const result = await service.respuestasAuditorias(respuesta as any);

      expect(result).toBe(true);
    });

    it('debe lanzar error si falla guardar respuesta', async () => {
      const respuesta = { idAuditoria: '123' };

      mockDatabase.respuestasAuditorias.mockResolvedValue(null);

      await expect(service.respuestasAuditorias(respuesta as any)).rejects.toThrow(
        'No se ha podido guardar la respuesta de la auditoria',
      );
    });
  });

  describe('getRespuestasAuditorias', () => {
    it('debe retornar respuestas de una auditoria', async () => {
      const mockRespuestas = [
        { _id: '1', idAuditoria: '123', respuestas: [] },
      ];

      mockDatabase.getRespuestasAuditorias.mockResolvedValue(mockRespuestas);

      const result = await service.getRespuestasAuditorias('123');

      expect(result).toEqual(mockRespuestas);
      expect(mockDatabase.getRespuestasAuditorias).toHaveBeenCalledWith('123');
    });
  });

  describe('getAuditoriasTienda', () => {
    it('debe retornar auditorias de una tienda habilitadas', async () => {
      const mockAuditorias = [{ _id: '1', idTienda: 100, habilitado: true }];

      mockDatabase.getAuditoriasTienda.mockResolvedValue(mockAuditorias);

      const result = await service.getAuditoriasTienda(100, true);

      expect(result).toEqual(mockAuditorias);
      expect(mockDatabase.getAuditoriasTienda).toHaveBeenCalledWith(100, true);
    });
  });

  describe('getAuditoriasTiendas', () => {
    it('debe retornar todas las auditorias de una tienda', async () => {
      const mockAuditorias = [
        { _id: '1', idTienda: 100 },
        { _id: '2', idTienda: 100 },
      ];

      mockDatabase.getAuditoriasTiendas.mockResolvedValue(mockAuditorias);

      const result = await service.getAuditoriasTiendas(100);

      expect(result).toEqual(mockAuditorias);
      expect(mockDatabase.getAuditoriasTiendas).toHaveBeenCalledWith(100);
    });
  });

  describe('deleteAuditoria', () => {
    it('debe eliminar una auditoria', async () => {
      const auditoria = { _id: '123' };

      mockDatabase.deleteAuditoria.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteAuditoria(auditoria as any);

      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('updateAuditoria', () => {
    it('debe actualizar una auditoria', async () => {
      const auditoria = { _id: '123', titulo: 'Actualizada' };

      mockDatabase.updateAuditoria.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateAuditoria(auditoria as any);

      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('updateAuditoriaRespuestas', () => {
    it('debe actualizar respuestas de auditoria', async () => {
      const respuesta = { _id: '123', respuestas: [] };

      mockDatabase.updateAuditoriaRespuestas.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateAuditoriaRespuestas(respuesta as any);

      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe('getAuditoriasById', () => {
    it('debe retornar auditoria por id', async () => {
      const auditoria = { _id: '123' };
      const mockAuditoria = { _id: '123', titulo: 'Test' };

      mockDatabase.getAuditoriasById.mockResolvedValue(mockAuditoria);

      const result = await service.getAuditoriasById(auditoria as any);

      expect(result).toEqual(mockAuditoria);
    });
  });
});
