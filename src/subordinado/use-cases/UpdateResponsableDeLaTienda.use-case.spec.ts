import { Test, TestingModule } from '@nestjs/testing';
import { UpdateResponsableDeLaTiendaUseCase } from './UpdateResponsableDeLaTienda.use-case';
import { PrismaService } from '../../prisma/prisma.service';

describe('UpdateResponsableDeLaTiendaUseCase', () => {
  let useCase: UpdateResponsableDeLaTiendaUseCase;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      trabajador: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateResponsableDeLaTiendaUseCase,
          useFactory: () => new UpdateResponsableDeLaTiendaUseCase(mockPrismaService as any),
        },
      ],
    }).compile();

    useCase = module.get<UpdateResponsableDeLaTiendaUseCase>(UpdateResponsableDeLaTiendaUseCase);
    prisma = mockPrismaService as any;
  });

  describe('execute', () => {
    it('debe actualizar responsable de todos los trabajadores de la tienda', async () => {
      const idTienda = 5;
      const idCoordinadora = 10;

      (prisma.trabajador.updateMany as jest.Mock).mockResolvedValue({ count: 8 });

      const result = await useCase.execute(idTienda, idCoordinadora);

      expect(result).toEqual({
        trabajadoresActualizados: 8,
        idTienda: 5,
        idCoordinadora: 10,
      });

      expect(prisma.trabajador.updateMany).toHaveBeenCalledWith({
        where: {
          idTienda: 5,
          id: { not: 10 },
        },
        data: {
          idResponsable: 10,
        },
      });
    });

    it('debe lanzar error si falta idTienda', async () => {
      await expect(useCase.execute(null, 10)).rejects.toThrow(
        'ID de tienda y coordinadora son requeridos',
      );
    });

    it('debe lanzar error si falta idCoordinadora', async () => {
      await expect(useCase.execute(5, null)).rejects.toThrow(
        'ID de tienda y coordinadora son requeridos',
      );
    });
  });
});
