import { Test, TestingModule } from '@nestjs/testing';
import { PermisosService } from './permisos.class';
import { FirebaseService } from '../firebase/firebase.service';

describe('PermisosService', () => {
  let service: PermisosService;
  let mockFirebaseService: any;

  beforeEach(async () => {
    mockFirebaseService = {
      auth: {
        setCustomUserClaims: jest.fn(),
      },
      getUserByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermisosService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<PermisosService>(PermisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pasoPermitidoByClaims', () => {
    it('debe retornar true si tiene SUPER_ADMIN', () => {
      const arrayPermisos = ['SUPER_ADMIN'];
      const cualquieraDe = ['RRHH_ADMIN'];

      const result = service.pasoPermitidoByClaims(arrayPermisos, cualquieraDe);

      expect(result).toBe(true);
    });

    it('debe retornar true si tiene permiso específico', () => {
      const arrayPermisos = ['RRHH_ADMIN', 'OTRO'];
      const cualquieraDe = ['RRHH_ADMIN'];

      const result = service.pasoPermitidoByClaims(arrayPermisos, cualquieraDe);

      expect(result).toBe(true);
    });

    it('debe retornar false si no tiene ningún permiso requerido', () => {
      const arrayPermisos = ['OTRO_PERMISO'];
      const cualquieraDe = ['RRHH_ADMIN', 'SUPER_ADMIN'];

      const result = service.pasoPermitidoByClaims(arrayPermisos, cualquieraDe);

      expect(result).toBe(false);
    });

    it('debe retornar false si arrayPermisos es null', () => {
      const result = service.pasoPermitidoByClaims(null, ['RRHH_ADMIN']);

      expect(result).toBe(false);
    });

    it('debe retornar false si arrayPermisos es undefined', () => {
      const result = service.pasoPermitidoByClaims(undefined, ['RRHH_ADMIN']);

      expect(result).toBe(false);
    });

    it('debe retornar false si arrayPermisos está vacío', () => {
      const result = service.pasoPermitidoByClaims([], ['RRHH_ADMIN']);

      expect(result).toBe(false);
    });
  });

  describe('setCustomClaims', () => {
    it('debe establecer claims cuando tiene permiso SUPER_ADMIN', async () => {
      const claimsGestor = { arrayPermisos: ['SUPER_ADMIN'] };
      const uidUsuarioDestino = 'user-123';
      const payload = ['PERMISO1', 'PERMISO2'];

      mockFirebaseService.auth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await service.setCustomClaims(claimsGestor, uidUsuarioDestino, payload);

      expect(result).toBe(true);
      expect(mockFirebaseService.auth.setCustomUserClaims).toHaveBeenCalledWith(
        uidUsuarioDestino,
        { arrayPermisos: payload },
      );
    });

    it('debe establecer claims cuando tiene permiso RRHH_ADMIN', async () => {
      const claimsGestor = { arrayPermisos: ['RRHH_ADMIN'] };
      const uidUsuarioDestino = 'user-123';
      const payload = ['PERMISO1'];

      mockFirebaseService.auth.setCustomUserClaims.mockResolvedValue(undefined);

      const result = await service.setCustomClaims(claimsGestor, uidUsuarioDestino, payload);

      expect(result).toBe(true);
    });

    it('debe convertir payload con string vacío a array vacío', async () => {
      const claimsGestor = { arrayPermisos: ['SUPER_ADMIN'] };
      const uidUsuarioDestino = 'user-123';
      const payload = [''];

      mockFirebaseService.auth.setCustomUserClaims.mockResolvedValue(undefined);

      await service.setCustomClaims(claimsGestor, uidUsuarioDestino, payload);

      expect(mockFirebaseService.auth.setCustomUserClaims).toHaveBeenCalledWith(
        uidUsuarioDestino,
        { arrayPermisos: [] },
      );
    });

    it('debe lanzar error si no tiene permiso', async () => {
      const claimsGestor = { arrayPermisos: ['OTRO_PERMISO'] };
      const uidUsuarioDestino = 'user-123';
      const payload = ['PERMISO1'];

      await expect(
        service.setCustomClaims(claimsGestor, uidUsuarioDestino, payload),
      ).rejects.toThrow('No tienes permiso para realizar esta acción');
    });

    it('debe lanzar error si claimsGestor es null', async () => {
      await expect(service.setCustomClaims(null, 'user-123', ['PERMISO1'])).rejects.toThrow(
        'No tienes permiso para realizar esta acción',
      );
    });
  });

  describe('getCustomClaims', () => {
    it('debe obtener claims cuando tiene permiso SUPER_ADMIN', async () => {
      const claimsGestor = { arrayPermisos: ['SUPER_ADMIN'] };
      const uidModificado = 'user-123';
      const mockClaims = { arrayPermisos: ['PERMISO1', 'PERMISO2'] };

      mockFirebaseService.getUserByUid.mockResolvedValue({ customClaims: mockClaims });

      const result = await service.getCustomClaims(claimsGestor, uidModificado);

      expect(result).toEqual(mockClaims);
      expect(mockFirebaseService.getUserByUid).toHaveBeenCalledWith(uidModificado);
    });

    it('debe obtener claims cuando tiene permiso RRHH_ADMIN', async () => {
      const claimsGestor = { arrayPermisos: ['RRHH_ADMIN'] };
      const uidModificado = 'user-123';
      const mockClaims = { arrayPermisos: ['PERMISO1'] };

      mockFirebaseService.getUserByUid.mockResolvedValue({ customClaims: mockClaims });

      const result = await service.getCustomClaims(claimsGestor, uidModificado);

      expect(result).toEqual(mockClaims);
    });

    it('debe lanzar error si no tiene permiso', async () => {
      const claimsGestor = { arrayPermisos: ['OTRO_PERMISO'] };
      const uidModificado = 'user-123';

      await expect(service.getCustomClaims(claimsGestor, uidModificado)).rejects.toThrow(
        'No tienes permiso para realizar esta acción',
      );
    });

    it('debe lanzar error si claimsGestor es null', async () => {
      await expect(service.getCustomClaims(null, 'user-123')).rejects.toThrow(
        'No tienes permiso para realizar esta acción',
      );
    });
  });
});
