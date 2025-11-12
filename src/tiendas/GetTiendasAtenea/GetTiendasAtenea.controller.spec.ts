import { Test, TestingModule } from "@nestjs/testing";
import { GetTiendasAteneaController } from "./GetTiendasAtenea.controller";
import { IGetTiendasAteneaUseCase } from "./IGetTiendasAtenea.use-case";
import { Tiendas2 } from "../tiendas.dto";
import { AuthGuard } from "../../guards/auth.guard";
import { RoleGuard } from "../../guards/role.guard";
import { SchedulerGuard } from "../../guards/scheduler.guard";

describe("GetTiendasAteneaController", () => {
  let controller: GetTiendasAteneaController;
  let useCase: jest.Mocked<IGetTiendasAteneaUseCase>;

  const mockTiendas: Tiendas2[] = [
    {
      address: "Calle Principal 123",
      postalCode: "28001",
      city: "Madrid",
      province: "Madrid",
      municipalityCode: 28079,
      name: "Tienda Centro",
      latitude: 40.4168,
      longitude: -3.7038,
      type: "TIENDA",
      coordinatorId: 1,
      id: 1,
      idExterno: 101,
      phone: 912345678,
      existsBC: true,
    },
    {
      address: "Avenida Norte 456",
      postalCode: "28050",
      city: "Madrid",
      province: "Madrid",
      municipalityCode: 28079,
      name: "Tienda Norte",
      latitude: 40.45,
      longitude: -3.7,
      type: "TIENDA",
      coordinatorId: 2,
      id: 2,
      idExterno: 102,
      phone: 912345679,
      existsBC: false,
    },
  ];

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetTiendasAteneaController],
      providers: [
        {
          provide: IGetTiendasAteneaUseCase,
          useValue: mockUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(SchedulerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<GetTiendasAteneaController>(
      GetTiendasAteneaController,
    );
    useCase = module.get(
      IGetTiendasAteneaUseCase,
    ) as jest.Mocked<IGetTiendasAteneaUseCase>;
  });

  describe("handle", () => {
    it("debe retornar todas las tiendas de Atenea", async () => {
      useCase.execute.mockResolvedValue(mockTiendas);

      const result = await controller.handle();

      expect(result).toEqual(mockTiendas);
      expect(useCase.execute).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      useCase.execute.mockResolvedValue([]);

      const result = await controller.handle();

      expect(result).toEqual([]);
      expect(useCase.execute).toHaveBeenCalled();
    });

    it("debe propagar errores del use case", async () => {
      useCase.execute.mockRejectedValue(new Error("Database error"));

      await expect(controller.handle()).rejects.toThrow("Database error");
      expect(useCase.execute).toHaveBeenCalled();
    });
  });

  describe("handleForAtenea", () => {
    it("debe retornar todas las tiendas de Atenea", async () => {
      useCase.execute.mockResolvedValue(mockTiendas);

      const result = await controller.handleForAtenea();

      expect(result).toEqual(mockTiendas);
      expect(useCase.execute).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      useCase.execute.mockResolvedValue([]);

      const result = await controller.handleForAtenea();

      expect(result).toEqual([]);
      expect(useCase.execute).toHaveBeenCalled();
    });

    it("debe propagar errores del use case", async () => {
      useCase.execute.mockRejectedValue(new Error("Database error"));

      await expect(controller.handleForAtenea()).rejects.toThrow(
        "Database error",
      );
      expect(useCase.execute).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    it("debe retornar tiendas con toda la información de MongoDB", async () => {
      useCase.execute.mockResolvedValue(mockTiendas);

      const result = await controller.handle();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("postalCode");
      expect(result[0]).toHaveProperty("city");
      expect(result[0]).toHaveProperty("province");
      expect(result[0]).toHaveProperty("latitude");
      expect(result[0]).toHaveProperty("longitude");
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("coordinatorId");
      expect(result[0]).toHaveProperty("existsBC");
    });
  });
});
