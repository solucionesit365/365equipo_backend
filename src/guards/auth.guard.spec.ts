import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockFirebaseService: any;
  let mockPrismaService: any;

  const createMockExecutionContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const mockRequest = {
      headers,
      user: null,
      sqlUser: null,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    mockFirebaseService = {
      verifyToken: jest.fn(),
      auth: {
        getUser: jest.fn(),
      },
    };

    mockPrismaService = {
      trabajador: {
        findFirstOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header is provided', async () => {
      const context = createMockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'No se proporcionó el token de autorización',
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer invalid-token',
      });

      mockFirebaseService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No estás autorizado/a');
    });

    it('should throw UnauthorizedException when user is not found in database', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      mockFirebaseService.verifyToken.mockResolvedValue({ uid: 'test-uid' });
      mockFirebaseService.auth.getUser.mockResolvedValue({ uid: 'test-uid' });
      mockPrismaService.trabajador.findFirstOrThrow.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should return true and set user data when authentication succeeds', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer valid-token' },
        user: null,
        sqlUser: null,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const mockUserInfo = { uid: 'test-uid' };
      const mockUserRecord = { uid: 'test-uid', email: 'test@example.com' };
      const mockTrabajador = {
        id: 1,
        idApp: 'test-uid',
        nombreApellidos: 'Test User',
        roles: [{ id: 1, name: 'User' }],
        permisos: [],
      };

      mockFirebaseService.verifyToken.mockResolvedValue(mockUserInfo);
      mockFirebaseService.auth.getUser.mockResolvedValue(mockUserRecord);
      mockPrismaService.trabajador.findFirstOrThrow.mockResolvedValue(mockTrabajador);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockRequest.user).toEqual(mockUserRecord);
      expect(mockRequest.sqlUser).toEqual(mockTrabajador);
      expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockFirebaseService.auth.getUser).toHaveBeenCalledWith('test-uid');
      expect(mockPrismaService.trabajador.findFirstOrThrow).toHaveBeenCalledWith({
        where: { idApp: 'test-uid' },
        include: { roles: true, permisos: true },
      });
    });

    it('should correctly strip Bearer prefix from token', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer my-secret-token-123' },
        user: null,
        sqlUser: null,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockFirebaseService.verifyToken.mockResolvedValue({ uid: 'test-uid' });
      mockFirebaseService.auth.getUser.mockResolvedValue({ uid: 'test-uid' });
      mockPrismaService.trabajador.findFirstOrThrow.mockResolvedValue({
        id: 1,
        roles: [],
        permisos: [],
      });

      await guard.canActivate(context);

      expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('my-secret-token-123');
    });

    it('should handle token without Bearer prefix', async () => {
      const mockRequest = {
        headers: { authorization: 'direct-token' },
        user: null,
        sqlUser: null,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      mockFirebaseService.verifyToken.mockResolvedValue({ uid: 'test-uid' });
      mockFirebaseService.auth.getUser.mockResolvedValue({ uid: 'test-uid' });
      mockPrismaService.trabajador.findFirstOrThrow.mockResolvedValue({
        id: 1,
        roles: [],
        permisos: [],
      });

      await guard.canActivate(context);

      expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('direct-token');
    });
  });
});
