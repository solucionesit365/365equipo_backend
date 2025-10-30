import { validate } from 'class-validator';
import { CreateEmpresaDto, UpdateEmpresaDto, DeleteEmpresaDto } from './empresa.dto';

describe('Empresa DTOs', () => {
  describe('CreateEmpresaDto', () => {
    it('debe validar correctamente un DTO válido', async () => {
      const dto = new CreateEmpresaDto();
      dto.nombre = 'Empresa Test';
      dto.cif = 'A12345678';
      dto.idExterno = 123;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe validar correctamente sin idExterno (opcional)', async () => {
      const dto = new CreateEmpresaDto();
      dto.nombre = 'Empresa Test';
      dto.cif = 'A12345678';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar si falta nombre', async () => {
      const dto = new CreateEmpresaDto();
      dto.cif = 'A12345678';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nombre');
    });

    it('debe fallar si falta cif', async () => {
      const dto = new CreateEmpresaDto();
      dto.nombre = 'Empresa Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('cif');
    });
  });

  describe('UpdateEmpresaDto', () => {
    it('debe validar correctamente un DTO válido', async () => {
      const dto = new UpdateEmpresaDto();
      dto.id = '1';
      dto.nombre = 'Empresa Updated';
      dto.cif = 'B87654321';
      dto.idExterno = 456;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar si falta id', async () => {
      const dto = new UpdateEmpresaDto();
      dto.nombre = 'Empresa Updated';
      dto.cif = 'B87654321';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });
  });

  describe('DeleteEmpresaDto', () => {
    it('debe validar correctamente un DTO válido', async () => {
      const dto = new DeleteEmpresaDto();
      dto.id = '1';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('debe fallar si falta id', async () => {
      const dto = new DeleteEmpresaDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });

    it('debe fallar si id no es string', async () => {
      const dto = new DeleteEmpresaDto();
      (dto as any).id = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
