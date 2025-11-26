import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from './role.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockPrismaService: any;
  let mockReflector: any;

  const createMockExecutionContext = (user: any = null): ExecutionContext => {
    const mockRequest = {
      user,
    };

    const mockHandler = jest.fn();

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => mockHandler,
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    mockPrismaService = {
      trabajador: {
        findUnique: jest.fn(),
      },
    };

    mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when user has required role', async () => {
      const context = createMockExecutionContext({ uid: 'test-uid' });

      mockReflector.get.mockReturnValue(['Admin', 'Manager']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'test-uid',
        roles: [{ id: 1, name: 'Admin' }],
        permisos: [],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.trabajador.findUnique).toHaveBeenCalledWith({
        where: { idApp: 'test-uid' },
        include: { roles: true, permisos: true },
      });
    });

    it('should return true when user is Super_Admin regardless of required roles', async () => {
      const context = createMockExecutionContext({ uid: 'admin-uid' });

      mockReflector.get.mockReturnValue(['SpecificRole']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'admin-uid',
        roles: [{ id: 1, name: 'Super_Admin' }],
        permisos: [],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user does not have required role', async () => {
      const context = createMockExecutionContext({ uid: 'user-uid' });

      mockReflector.get.mockReturnValue(['Admin']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'user-uid',
        roles: [{ id: 2, name: 'User' }],
        permisos: [],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No estás autorizado/a');
    });

    it('should throw UnauthorizedException when user has no roles', async () => {
      const context = createMockExecutionContext({ uid: 'user-uid' });

      mockReflector.get.mockReturnValue(['Admin']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'user-uid',
        roles: [],
        permisos: [],
      });

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found in database', async () => {
      const context = createMockExecutionContext({ uid: 'unknown-uid' });

      mockReflector.get.mockReturnValue(['Admin']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when database query fails', async () => {
      const context = createMockExecutionContext({ uid: 'test-uid' });

      mockReflector.get.mockReturnValue(['Admin']);
      mockPrismaService.trabajador.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should check for multiple roles correctly', async () => {
      const context = createMockExecutionContext({ uid: 'test-uid' });

      mockReflector.get.mockReturnValue(['Admin', 'Manager', 'Editor']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'test-uid',
        roles: [{ id: 2, name: 'Manager' }],
        permisos: [],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple required roles', async () => {
      const context = createMockExecutionContext({ uid: 'test-uid' });

      mockReflector.get.mockReturnValue(['Admin', 'Manager']);
      mockPrismaService.trabajador.findUnique.mockResolvedValue({
        id: 1,
        idApp: 'test-uid',
        roles: [
          { id: 1, name: 'User' },
          { id: 2, name: 'Manager' },
        ],
        permisos: [],
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
