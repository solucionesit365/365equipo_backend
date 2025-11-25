import { Test, TestingModule } from '@nestjs/testing';
import { DistribucionMensajesClass } from './distribucion-mensajes.class';
import { DistribucionMensajesDatabase } from './distribucion-mensajes.mongodb';

describe('DistribucionMensajesClass', () => {
  let service: DistribucionMensajesClass;
  let mockDatabase: any;

  beforeEach(async () => {
    mockDatabase = {
      insertarMensajeDB: jest.fn(),
      getAllMensajeDB: jest.fn(),
      getOneMessage: jest.fn(),
      updateOneMensajes: jest.fn(),
      updateMensajeforDate: jest.fn(),
      deleteMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistribucionMensajesClass,
        {
          provide: DistribucionMensajesDatabase,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<DistribucionMensajesClass>(DistribucionMensajesClass);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertarMensaje', () => {
    it('debe insertar un mensaje y retornar true', async () => {
      const mensaje = {
        titulo: 'Mensaje de prueba',
        contenido: 'Contenido del mensaje',
        activo: true,
      };

      mockDatabase.insertarMensajeDB.mockResolvedValue({ insertedId: '123' });

      const result = await service.insertarMensaje(mensaje as any);

      expect(result).toBe(true);
      expect(mockDatabase.insertarMensajeDB).toHaveBeenCalledWith(mensaje);
    });

    it('debe retornar undefined si falla la inserción', async () => {
      const mensaje = { titulo: 'Mensaje' };

      mockDatabase.insertarMensajeDB.mockResolvedValue(null);

      const result = await service.insertarMensaje(mensaje as any);

      expect(result).toBeUndefined();
    });
  });

  describe('getAllMensajes', () => {
    it('debe retornar todos los mensajes', async () => {
      const mockMensajes = [
        { _id: '1', titulo: 'Mensaje 1', activo: true },
        { _id: '2', titulo: 'Mensaje 2', activo: false },
      ];

      mockDatabase.getAllMensajeDB.mockResolvedValue(mockMensajes);

      const result = await service.getAllMensajes();

      expect(result).toEqual(mockMensajes);
      expect(mockDatabase.getAllMensajeDB).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay mensajes', async () => {
      mockDatabase.getAllMensajeDB.mockResolvedValue([]);

      const result = await service.getAllMensajes();

      expect(result).toEqual([]);
    });
  });

  describe('getOneMessage', () => {
    it('debe retornar un mensaje activo', async () => {
      const mockMensaje = { _id: '1', titulo: 'Mensaje', activo: true };

      mockDatabase.getOneMessage.mockResolvedValue(mockMensaje);

      const result = await service.getOneMessage();

      expect(result).toEqual(mockMensaje);
    });

    it('debe retornar null si no hay mensaje activo', async () => {
      mockDatabase.getOneMessage.mockResolvedValue(null);

      const result = await service.getOneMessage();

      expect(result).toBeNull();
    });
  });

  describe('updateOneMensajes', () => {
    it('debe actualizar el estado de un mensaje', async () => {
      mockDatabase.updateOneMensajes.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateOneMensajes('123', true);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.updateOneMensajes).toHaveBeenCalledWith('123', true);
    });

    it('debe desactivar un mensaje', async () => {
      mockDatabase.updateOneMensajes.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.updateOneMensajes('123', false);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.updateOneMensajes).toHaveBeenCalledWith('123', false);
    });
  });

  describe('updateMensajeforDate', () => {
    it('debe actualizar mensajes por rango de fechas', async () => {
      const inicio = new Date('2024-01-01');
      const final = new Date('2024-12-31');

      mockDatabase.updateMensajeforDate.mockResolvedValue({ modifiedCount: 5 });

      const result = await service.updateMensajeforDate(inicio, final);

      expect(result).toEqual({ modifiedCount: 5 });
      expect(mockDatabase.updateMensajeforDate).toHaveBeenCalledWith(inicio, final);
    });
  });

  describe('deleteMessage', () => {
    it('debe eliminar un mensaje por id', async () => {
      mockDatabase.deleteMessage.mockResolvedValue({ deletedCount: 1 });

      const result = await service.deleteMessage('123');

      expect(result).toEqual({ deletedCount: 1 });
      expect(mockDatabase.deleteMessage).toHaveBeenCalledWith('123');
    });

    it('debe retornar deletedCount 0 si no existe el mensaje', async () => {
      mockDatabase.deleteMessage.mockResolvedValue({ deletedCount: 0 });

      const result = await service.deleteMessage('999');

      expect(result).toEqual({ deletedCount: 0 });
    });
  });
});
