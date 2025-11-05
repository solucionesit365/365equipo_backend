import { Test, TestingModule } from "@nestjs/testing";
import { TiendaAteneaRepository } from "./TiendaAtenea.repository";
import { MongoService } from "../../mongo/mongo.service";
import { InternalServerErrorException } from "@nestjs/common";
import { Tiendas2 } from "../tiendas.dto";
import { InsertOneResult, ObjectId, DeleteResult } from "mongodb";

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

  describe("createTienda", () => {
    it("debe crear una tienda exitosamente", async () => {
      const mockTienda = {
        id: 1,
        idExterno: 100,
        name: "Tienda Test",
        address: "Calle Test 123",
        city: "Barcelona",
        latitude: 41.3851,
        longitude: 2.1734,
        municipalityCode: 8019,
        phone: "912345678",
        postalCode: "08001",
        province: "Barcelona",
        type: "Propia",
      };

      const mockInsertResult: InsertOneResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue(mockInsertResult),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await repository.createTienda(mockTienda);

      expect(result).toEqual(mockInsertResult);
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockTienda);
    });

    it("debe lanzar InternalServerErrorException si falla la inserción", async () => {
      const mockTienda = {
        id: 1,
        idExterno: 100,
        name: "Tienda Test",
        address: "Calle Test 123",
        city: "Barcelona",
        latitude: 41.3851,
        longitude: 2.1734,
        municipalityCode: 8019,
        phone: "912345678",
        postalCode: "08001",
        province: "Barcelona",
        type: "Propia",
      };

      const mockCollection = {
        insertOne: jest.fn().mockRejectedValue(new Error("Insert error")),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      await expect(repository.createTienda(mockTienda)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("update", () => {
    it("debe actualizar una tienda exitosamente", async () => {
      const mockId = new ObjectId();
      const mockPayload = {
        name: "Tienda Updated",
        address: "Calle Nueva 456",
      };

      const mockCollection = {
        updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      await repository.update(mockId, mockPayload);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: mockId },
        { $set: mockPayload },
      );
    });

    it("debe lanzar InternalServerErrorException si falla la actualización", async () => {
      const mockId = new ObjectId();
      const mockPayload = {
        name: "Tienda Updated",
      };

      const mockCollection = {
        updateOne: jest.fn().mockRejectedValue(new Error("Update error")),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      await expect(repository.update(mockId, mockPayload)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("delete", () => {
    it("debe eliminar una tienda exitosamente", async () => {
      const mockId = new ObjectId();
      const mockDeleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue(mockDeleteResult),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await repository.delete(mockId);

      expect(result).toEqual(mockDeleteResult);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: mockId });
    });

    it("debe retornar deletedCount 0 si no encuentra la tienda", async () => {
      const mockId = new ObjectId();
      const mockDeleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 0,
      };

      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue(mockDeleteResult),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await repository.delete(mockId);

      expect(result.deletedCount).toBe(0);
    });

    it("debe lanzar InternalServerErrorException si falla la eliminación", async () => {
      const mockId = new ObjectId();

      const mockCollection = {
        deleteOne: jest.fn().mockRejectedValue(new Error("Delete error")),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mongoService.getConexion.mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      await expect(repository.delete(mockId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
