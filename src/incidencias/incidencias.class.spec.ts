import { Test, TestingModule } from '@nestjs/testing';
import { Incidencia } from './incidencias.class';
import { IncidenciasDatabase } from './incidencias.mongodb';
import axios from 'axios';

jest.mock('axios');

describe('Incidencia', () => {
  let service: Incidencia;
  let database: jest.Mocked<IncidenciasDatabase>;

  beforeEach(async () => {
    const mockDatabase = {
      nuevaIncidencia: jest.fn(),
      nuevaIncidenciaInvitado: jest.fn(),
      getIncidencias: jest.fn(),
      getIncidenciasRrhh: jest.fn(),
      getIncidenciasByEstado: jest.fn(),
      updateIncidencia: jest.fn(),
      deleteIncidencia: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Incidencia,
        { provide: IncidenciasDatabase, useValue: mockDatabase },
      ],
    }).compile();

    service = module.get<Incidencia>(Incidencia);
    database = module.get(IncidenciasDatabase);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('nuevaIncidencia', () => {
    it('debe crear una incidencia correctamente', async () => {
      const mockIncidencia = {
        destinatario: 'tecnicos',
        descripcion: 'Problema con el sistema',
        prioridad: 'Alta',
        nombre: 'Juan Pérez',
        tienda: 'Tienda 1',
      };

      database.nuevaIncidencia.mockResolvedValue('incidencia123' as any);
      (axios.post as jest.Mock).mockResolvedValue({ data: 'ok' });

      const result = await service.nuevaIncidencia(mockIncidencia as any);

      expect(result).toBe(true);
      expect(database.nuevaIncidencia).toHaveBeenCalledWith(mockIncidencia);
      expect(axios.post).toHaveBeenCalled();
    });

    it('debe lanzar error si falla la inserción', async () => {
      const mockIncidencia = {
        descripcion: 'Test',
      };

      database.nuevaIncidencia.mockResolvedValue(null);

      await expect(service.nuevaIncidencia(mockIncidencia as any)).rejects.toThrow(
        'No se ha podido insertar la incidencia'
      );
    });
  });

  describe('nuevaIncidenciaInvitado', () => {
    it('debe crear una incidencia de invitado correctamente', async () => {
      const mockIncidencia = {
        destinatario: 'soporte@example.com',
        descripcion: 'Problema técnico',
        prioridad: 'Media',
        nombre: 'Invitado',
      };

      database.nuevaIncidenciaInvitado.mockResolvedValue('incidencia456' as any);
      (axios.post as jest.Mock).mockResolvedValue({ data: 'ok' });

      const result = await service.nuevaIncidenciaInvitado(mockIncidencia as any);

      expect(result).toBe(true);
      expect(database.nuevaIncidenciaInvitado).toHaveBeenCalledWith(mockIncidencia);
    });
  });

  describe('getIncidencias', () => {
    it('debe retornar todas las incidencias', async () => {
      const mockIncidencias = [
        { id: '1', descripcion: 'Incidencia 1' },
        { id: '2', descripcion: 'Incidencia 2' },
      ];

      database.getIncidencias.mockResolvedValue(mockIncidencias as any);

      const result = await service.getIncidencias();

      expect(result).toEqual(mockIncidencias);
    });
  });

  describe('getIncidenciasByEstado', () => {
    it('debe retornar incidencias por estado', async () => {
      const mockIncidencias = [{ id: '1', estado: 'Abierta' }];

      database.getIncidenciasByEstado.mockResolvedValue(mockIncidencias as any);

      const result = await service.getIncidenciasByEstado('Abierta');

      expect(result).toEqual(mockIncidencias);
      expect(database.getIncidenciasByEstado).toHaveBeenCalledWith('Abierta');
    });
  });
});
