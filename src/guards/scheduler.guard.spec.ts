import { SchedulerGuard } from './scheduler.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('SchedulerGuard', () => {
  let guard: SchedulerGuard;
  const originalEnv = process.env;

  const createMockExecutionContext = (headers: Record<string, string> = {}): ExecutionContext => {
    const mockRequest = {
      headers,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    guard = new SchedulerGuard();
    process.env = { ...originalEnv, SINCRO_TOKEN: 'valid-secret-token' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header is provided', () => {
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'No se proporcionó el token de autorización',
      );
    });

    it('should throw UnauthorizedException when token does not match', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer wrong-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'No tienes permiso para completar esta acción',
      );
    });

    it('should return true when token matches SINCRO_TOKEN', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer valid-secret-token',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should be case sensitive for token comparison', () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer VALID-SECRET-TOKEN',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should require Bearer prefix in authorization header', () => {
      const context = createMockExecutionContext({
        authorization: 'valid-secret-token',
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
