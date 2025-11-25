import { Test, TestingModule } from '@nestjs/testing';
import { Admin } from './admin.class';
import { FirebaseService } from '../firebase/firebase.service';

describe('Admin', () => {
  let service: Admin;
  let mockFirebaseService: any;

  beforeEach(async () => {
    mockFirebaseService = {
      getUidByEmail: jest.fn(),
      generateCustomToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Admin,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
      ],
    }).compile();

    service = module.get<Admin>(Admin);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signInWithCustomToken', () => {
    it('debe generar un token personalizado para un email', async () => {
      const email = 'test@example.com';
      const uid = 'user-123';
      const customToken = 'custom-token-abc123';

      mockFirebaseService.getUidByEmail.mockResolvedValue(uid);
      mockFirebaseService.generateCustomToken.mockResolvedValue(customToken);

      const result = await service.signInWithCustomToken(email);

      expect(result).toBe(customToken);
      expect(mockFirebaseService.getUidByEmail).toHaveBeenCalledWith(email);
      expect(mockFirebaseService.generateCustomToken).toHaveBeenCalledWith(uid);
    });

    it('debe propagar error si el email no existe', async () => {
      const email = 'noexiste@example.com';

      mockFirebaseService.getUidByEmail.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.signInWithCustomToken(email)).rejects.toThrow(
        'User not found',
      );
    });

    it('debe propagar error si falla la generación del token', async () => {
      const email = 'test@example.com';
      const uid = 'user-123';

      mockFirebaseService.getUidByEmail.mockResolvedValue(uid);
      mockFirebaseService.generateCustomToken.mockRejectedValue(
        new Error('Token generation failed'),
      );

      await expect(service.signInWithCustomToken(email)).rejects.toThrow(
        'Token generation failed',
      );
    });
  });
});
