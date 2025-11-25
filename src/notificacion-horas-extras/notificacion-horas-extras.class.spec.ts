import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionHorasExtrasClass } from './notificacion-horas-extras.class';
import { NotificacionHorasExtrasMongoService } from './notificacion-horas-extras.mongodb';

describe('NotificacionHorasExtrasClass', () => {
  let service: NotificacionHorasExtrasClass;
  let mockMongoService: any;

  beforeEach(async () => {
    mockMongoService = {
      createNotificacionHorasExtras: jest.fn(),
      getAllNotificacionesHorasExtras: jest.fn(),
      getNotificacionHorasExtrasByIdSql: jest.fn(),
      updateNotificacionHorasExtrasRevision: jest.fn(),
      updateNotificacionHorasExtrasApagar: jest.fn(),
      deleteNotificacionHorasExtras: jest.fn(),
      updateNotificacionHorasExtras: jest.fn(),
      updateComentarioHorasExtras: jest.fn(),
      marcarComentariosComoLeidos: jest.fn(),
      buscarCoincidenciasHorasExtras: jest.fn(),
      getNotificacionHorasExtrasById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionHorasExtrasClass,
        {
          provide: NotificacionHorasExtrasMongoService,
          useValue: mockMongoService,
        },
      ],
    }).compile();

    service = module.get<NotificacionHorasExtrasClass>(NotificacionHorasExtrasClass);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotificacionHorasExtras', () => {
    it('debe crear una notificación de horas extras', async () => {
      const mockNotificacion = {
        idTrabajador: 1,
        horasExtras: [],
      };

      mockMongoService.createNotificacionHorasExtras.mockResolvedValue({
        insertedId: '123',
      });

      const result = await service.createNotificacionHorasExtras(mockNotificacion as any);

      expect(result).toEqual({ insertedId: '123' });
      expect(mockMongoService.createNotificacionHorasExtras).toHaveBeenCalledWith(
        mockNotificacion,
      );
    });
  });

  describe('getAllNotificacionesHorasExtras', () => {
    it('debe retornar todas las notificaciones', async () => {
      const mockNotificaciones = [{ id: '1' }, { id: '2' }];

      mockMongoService.getAllNotificacionesHorasExtras.mockResolvedValue(mockNotificaciones);

      const result = await service.getAllNotificacionesHorasExtras();

      expect(result).toEqual(mockNotificaciones);
      expect(mockMongoService.getAllNotificacionesHorasExtras).toHaveBeenCalled();
    });
  });

  describe('getNotificacionHorasExtrasByIdSql', () => {
    it('debe retornar notificaciones por idSql y tiendas', async () => {
      const mockNotificaciones = [{ id: '1', idSql: 1 }];

      mockMongoService.getNotificacionHorasExtrasByIdSql.mockResolvedValue(mockNotificaciones);

      const result = await service.getNotificacionHorasExtrasByIdSql(1, [100, 101]);

      expect(result).toEqual(mockNotificaciones);
      expect(mockMongoService.getNotificacionHorasExtrasByIdSql).toHaveBeenCalledWith(
        1,
        [100, 101],
      );
    });
  });

  describe('updateNotificacionHorasExtrasRevision', () => {
    it('debe actualizar la revisión de horas extras', async () => {
      mockMongoService.updateNotificacionHorasExtrasRevision.mockResolvedValue({
        modifiedCount: 1,
      });

      const result = await service.updateNotificacionHorasExtrasRevision(
        'notif-1',
        'hora-1',
        { revision: true },
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockMongoService.updateNotificacionHorasExtrasRevision).toHaveBeenCalledWith(
        'notif-1',
        'hora-1',
        { revision: true },
      );
    });
  });

  describe('updateNotificacionHorasExtrasApagar', () => {
    it('debe actualizar el estado de apagar de horas extras', async () => {
      mockMongoService.updateNotificacionHorasExtrasApagar.mockResolvedValue({
        modifiedCount: 1,
      });

      const result = await service.updateNotificacionHorasExtrasApagar(
        'notif-1',
        'hora-1',
        { apagar: 'aprobado' },
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockMongoService.updateNotificacionHorasExtrasApagar).toHaveBeenCalledWith(
        'notif-1',
        'hora-1',
        { apagar: 'aprobado' },
      );
    });
  });

  describe('deleteNotificacionHorasExtras', () => {
    it('debe eliminar una notificación de horas extras', async () => {
      mockMongoService.deleteNotificacionHorasExtras.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteNotificacionHorasExtras('hora-1');

      expect(result).toEqual({ deletedCount: 1 });
      expect(mockMongoService.deleteNotificacionHorasExtras).toHaveBeenCalledWith('hora-1');
    });
  });

  describe('updateNotificacionHorasExtras', () => {
    it('debe actualizar una notificación de horas extras', async () => {
      const mockData = { idTrabajador: 1 };

      mockMongoService.updateNotificacionHorasExtras.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateNotificacionHorasExtras(
        'notif-1',
        'hora-1',
        mockData as any,
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockMongoService.updateNotificacionHorasExtras).toHaveBeenCalledWith(
        'notif-1',
        'hora-1',
        mockData,
      );
    });
  });

  describe('updateComentarioHorasExtras', () => {
    it('debe actualizar comentarios de horas extras', async () => {
      const comentarios = [
        { nombre: 'User', fechaRespuesta: '2024-01-01', mensaje: 'Test' },
      ];

      mockMongoService.updateComentarioHorasExtras.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateComentarioHorasExtras(
        'notif-1',
        'hora-1',
        comentarios,
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockMongoService.updateComentarioHorasExtras).toHaveBeenCalledWith(
        'notif-1',
        'hora-1',
        comentarios,
      );
    });
  });

  describe('marcarComentariosComoLeidos', () => {
    it('debe marcar comentarios como leídos', async () => {
      mockMongoService.marcarComentariosComoLeidos.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.marcarComentariosComoLeidos(
        'notif-1',
        'hora-1',
        'user-1',
        '2024-01-01',
      );

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockMongoService.marcarComentariosComoLeidos).toHaveBeenCalledWith(
        'notif-1',
        'hora-1',
        'user-1',
        '2024-01-01',
      );
    });
  });

  describe('validarDuplicadosHorasExtras', () => {
    it('debe validar duplicados de horas extras', async () => {
      const horasExtras = [
        { tienda: 100, fecha: '2024-01-01', horaInicio: '09:00', horaFinal: '18:00' },
      ];

      mockMongoService.buscarCoincidenciasHorasExtras.mockResolvedValue([]);

      const result = await service.validarDuplicadosHorasExtras('12345678A', horasExtras);

      expect(result).toEqual([]);
      expect(mockMongoService.buscarCoincidenciasHorasExtras).toHaveBeenCalledWith(
        '12345678A',
        horasExtras,
      );
    });
  });

  describe('getNotificacionHorasExtrasById', () => {
    it('debe obtener una notificación por id', async () => {
      const mockNotificacion = { _id: 'notif-1', idTrabajador: 1 };

      mockMongoService.getNotificacionHorasExtrasById.mockResolvedValue(mockNotificacion);

      const result = await service.getNotificacionHorasExtrasById('notif-1');

      expect(result).toEqual(mockNotificacion);
      expect(mockMongoService.getNotificacionHorasExtrasById).toHaveBeenCalledWith('notif-1');
    });
  });
});
