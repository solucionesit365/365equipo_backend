import { Test, TestingModule } from "@nestjs/testing";
import { TiendaAteneaRepository } from "./TiendaAtenea.repository";
import { MongoService } from "../../mongo/mongo.service";
import { InternalServerErrorException } from "@nestjs/common";
import { Tiendas2 } from "../tiendas.dto";

describe("TiendaAteneaRepository", () => {
  let repository: TiendaAteneaRepository;
  let mongoService: jest.Mocked<MongoService>;

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
    const mockCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockTiendas),
      }),
    };

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    const mockMongoService = {
      getConexion: jest.fn().mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiendaAteneaRepository,
        {
          provide: MongoService,
          useValue: mockMongoService,
        },
      ],
    }).compile();

    repository = module.get<TiendaAteneaRepository>(TiendaAteneaRepository);
    mongoService = module.get(MongoService) as jest.Mocked<MongoService>;
  });

  describe("getTiendasAtenea", () => {
    it("debe retornar todas las tiendas de MongoDB", async () => {
      const result = await repository.getTiendasAtenea();

      expect(result).toEqual(mockTiendas);
      expect(mongoService.getConexion).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await repository.getTiendasAtenea();

      expect(result).toEqual([]);
      expect(mongoService.getConexion).toHaveBeenCalled();
    });

    it("debe lanzar InternalServerErrorException si hay un error en MongoDB", async () => {
      mongoService.getConexion.mockRejectedValue(
        new Error("MongoDB connection error"),
      );

      await expect(repository.getTiendasAtenea()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("debe lanzar InternalServerErrorException si falla la consulta", async () => {
      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error("Query error")),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      await expect(repository.getTiendasAtenea()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
