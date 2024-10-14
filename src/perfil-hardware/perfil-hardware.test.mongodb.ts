import { Test, TestingModule } from "@nestjs/testing";
import { MongoService } from "../mongo/mongo.service";
import { PerfilHardwareDatabase } from "./perfil-hardware.mongodb";
import { PerfilHardware } from "./perfil-hardware.interface";

describe("PerfilHardwareDatabase", () => {
  let perfilHardwareDatabase: PerfilHardwareDatabase;
  let mongoService: MongoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilHardwareDatabase,
        {
          provide: MongoService,
          useValue: {
            getConexion: jest.fn(),
          },
        },
      ],
    }).compile();

    perfilHardwareDatabase = module.get<PerfilHardwareDatabase>(
      PerfilHardwareDatabase,
    );
    mongoService = module.get<MongoService>(MongoService);
  });

  describe("getPerfilesH", () => {
    it("should return an empty array when no profiles exist in the database", async () => {
      const mockCollection = {
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await perfilHardwareDatabase.getPerfilesH();

      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.toArray).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    //INSERT
    it("should return all profiles when multiple profiles exist in the database", async () => {
      const mockProfiles: PerfilHardware[] = [
        {
          perfilHardware: "Profile 1",
          tipoOrdenador: "Laptop",
          procesador: "Intel i5",
          memoria: "8GB",
          HHD: "256GB SSD",
          pantalla: "15.6 inch",
          teclado: "US",
          pantallaTactil: "No",
          SO: "Windows 10",
          mouse: "Wireless",
          mail: "user1@example.com",
          monitorOficina: "22 inch",
          huellaTactil: "Yes",
          auricular: "Wired",
          funda: "Leather",
          modeloPropuesto: "Model A",
          detallesExtras: "Extra details 1",
        },
        {
          perfilHardware: "Profile 2",
          tipoOrdenador: "Desktop",
          procesador: "AMD Ryzen 7",
          memoria: "16GB",
          HHD: "1TB HDD",
          pantalla: "27 inch",
          teclado: "ES",
          pantallaTactil: "Yes",
          SO: "Windows 11",
          mouse: "Wired",
          mail: "user2@example.com",
          monitorOficina: "24 inch",
          huellaTactil: "No",
          auricular: "Bluetooth",
          funda: "None",
          modeloPropuesto: "Model B",
          detallesExtras: "Extra details 2",
        },
      ];

      const mockCollection = {
        find: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockProfiles),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await perfilHardwareDatabase.getPerfilesH();

      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockCollection.toArray).toHaveBeenCalled();
      expect(result).toEqual(mockProfiles);
    });

    ///DB CONNECTION FAIL XD
    it("should throw an error when the database connection fails", async () => {
      const mockError = new Error("Database connection failed");
      jest.spyOn(mongoService, "getConexion").mockRejectedValue(mockError);

      await expect(perfilHardwareDatabase.getPerfilesH()).rejects.toThrow(
        "Database connection failed",
      );

      expect(mongoService.getConexion).toHaveBeenCalled();
    });
  });
});
