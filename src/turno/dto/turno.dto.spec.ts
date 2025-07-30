import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';
import {
  GetTurnosEquipoCoordinadora,
  GetSemanaIndividual,
  DeleteTurnoDto,
  ObjetoTurnoDto,
  SaveTurnosTrabajadorSemanalDto,
  CopiarTurnosPorSemanaDto,
} from './turno.dto';

describe('DTOs de Turno', () => {
  describe('GetTurnosEquipoCoordinadora', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(GetTurnosEquipoCoordinadora, {
        idTienda: 1,
        fecha: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar sin idTienda', async () => {
      const dto = plainToInstance(GetTurnosEquipoCoordinadora, {
        fecha: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('idTienda');
    });

    it('debería fallar sin fecha', async () => {
      const dto = plainToInstance(GetTurnosEquipoCoordinadora, {
        idTienda: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('fecha');
    });

    it('debería transformar string a número para idTienda', async () => {
      const dto = plainToInstance(GetTurnosEquipoCoordinadora, {
        idTienda: '1',
        fecha: '2024-01-15',
      });

      expect(dto.idTienda).toBe(1);
      expect(typeof dto.idTienda).toBe('number');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('GetSemanaIndividual', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(GetSemanaIndividual, {
        idTrabajador: 1,
        fecha: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar sin idTrabajador', async () => {
      const dto = plainToInstance(GetSemanaIndividual, {
        fecha: '2024-01-15',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debería transformar string a número para idTrabajador', async () => {
      const dto = plainToInstance(GetSemanaIndividual, {
        idTrabajador: '5',
        fecha: '2024-01-15',
      });

      expect(dto.idTrabajador).toBe(5);
      expect(typeof dto.idTrabajador).toBe('number');
    });
  });

  describe('DeleteTurnoDto', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(DeleteTurnoDto, {
        idTurno: 'turno-123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar sin idTurno', async () => {
      const dto = plainToInstance(DeleteTurnoDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('idTurno');
    });
  });

  describe('ObjetoTurnoDto', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(ObjetoTurnoDto, {
        id: 'turno-1',
        inicioISO: '2024-01-15T08:00:00',
        finalISO: '2024-01-15T16:00:00',
        tiendaId: 1,
        borrable: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar con tipos inválidos', async () => {
      const dto = plainToInstance(ObjetoTurnoDto, {
        id: 123, // debe ser string
        inicioISO: '2024-01-15T08:00:00',
        finalISO: '2024-01-15T16:00:00',
        tiendaId: '1', // debe ser number
        borrable: 'true', // debe ser boolean
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SaveTurnosTrabajadorSemanalDto', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(SaveTurnosTrabajadorSemanalDto, {
        idTrabajador: 1,
        inicioSemanaISO: '2024-01-15',
        arrayTurnos: [
          {
            id: 'turno-1',
            inicioISO: '2024-01-15T08:00:00',
            finalISO: '2024-01-15T16:00:00',
            tiendaId: 1,
            borrable: true,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería validar ObjetoTurnoDto anidado', async () => {
      const dto = plainToInstance(SaveTurnosTrabajadorSemanalDto, {
        idTrabajador: 1,
        inicioSemanaISO: '2024-01-15',
        arrayTurnos: [
          {
            id: 'turno-1',
            inicioISO: '2024-01-15T08:00:00',
            finalISO: '2024-01-15T16:00:00',
            tiendaId: 'invalid', // debe ser number
            borrable: true,
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('debería fallar con arrayTurnos inválido', async () => {
      const dto = plainToInstance(SaveTurnosTrabajadorSemanalDto, {
        idTrabajador: 1,
        inicioSemanaISO: '2024-01-15',
        arrayTurnos: 'not-an-array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CopiarTurnosPorSemanaDto', () => {
    it('debería validar con datos correctos', async () => {
      const dto = plainToInstance(CopiarTurnosPorSemanaDto, {
        idTienda: 1,
        diaSemanaOrigen: '2024-01-01',
        diaSemanaDestino: '2024-01-08',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debería fallar sin campos requeridos', async () => {
      const dto = plainToInstance(CopiarTurnosPorSemanaDto, {
        idTienda: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const errorProperties = errors.map(e => e.property);
      expect(errorProperties).toContain('diaSemanaOrigen');
      expect(errorProperties).toContain('diaSemanaDestino');
    });

    it('debería transformar string a número para idTienda', async () => {
      const dto = plainToInstance(CopiarTurnosPorSemanaDto, {
        idTienda: '1',
        diaSemanaOrigen: '2024-01-01',
        diaSemanaDestino: '2024-01-08',
      });

      expect(dto.idTienda).toBe(1);
      expect(typeof dto.idTienda).toBe('number');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});