import { Test, TestingModule } from "@nestjs/testing";
import { MongoService } from "../mongo/mongo.service";
import { PerfilHardwareDatabase } from "./perfil-hardware.mongodb";
import { PerfilHardware } from "./perfil-hardware.interface";
import { ObjectId } from "mongodb";
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
  describe("newPerfilHardware", () => {
    it("should successfully insert a new perfilHardware and return the insertedId", async () => {
      const mockPerfilHardware: PerfilHardware = {
        perfilHardware: "Test Profile",
        tipoOrdenador: "Laptop",
        procesador: "Intel i7",
        memoria: "16GB",
        HHD: "512GB SSD",
        pantalla: "15.6 inch",
        teclado: "US",
        pantallaTactil: "Yes",
        SO: "Windows 10",
        mouse: "Wireless",
        mail: "test@example.com",
        monitorOficina: "24 inch",
        huellaTactil: "Yes",
        auricular: "Bluetooth",
        funda: "Neoprene",
        modeloPropuesto: "Test Model",
        detallesExtras: "Test details",
      };

      const mockInsertedId = new ObjectId();
      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          insertedId: mockInsertedId,
        }),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await perfilHardwareDatabase.newPerfilHardware(
        mockPerfilHardware,
      );

      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockPerfilHardware);
      expect(result).toEqual(mockInsertedId);
    });

    //fallo al insertar
    it("should return null when insertion fails or is not acknowledged", async () => {
      const mockPerfilHardware: PerfilHardware = {
        perfilHardware: "Test Profile",
        tipoOrdenador: "Laptop",
        procesador: "Intel i7",
        memoria: "16GB",
        HHD: "512GB SSD",
        pantalla: "15.6 inch",
        teclado: "US",
        pantallaTactil: "Yes",
        SO: "Windows 10",
        mouse: "Wireless",
        mail: "test@example.com",
        monitorOficina: "24 inch",
        huellaTactil: "Yes",
        auricular: "Bluetooth",
        funda: "Neoprene",
        modeloPropuesto: "Test Model",
        detallesExtras: "Test details",
      };

      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({ acknowledged: false }),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await perfilHardwareDatabase.newPerfilHardware(
        mockPerfilHardware,
      );

      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockPerfilHardware);
      expect(result).toBeNull();
    });

    //falllo coneccion database

    it("should handle and throw an error when database connection fails during insertion", async () => {
      const mockPerfilHardware: PerfilHardware = {
        perfilHardware: "Test Profile",
        tipoOrdenador: "Laptop",
        procesador: "Intel i7",
        memoria: "16GB",
        HHD: "512GB SSD",
        pantalla: "15.6 inch",
        teclado: "US",
        pantallaTactil: "Yes",
        SO: "Windows 10",
        mouse: "Wireless",
        mail: "test@example.com",
        monitorOficina: "24 inch",
        huellaTactil: "Yes",
        auricular: "Bluetooth",
        funda: "Neoprene",
        modeloPropuesto: "Test Model",
        detallesExtras: "Test details",
      };

      const mockError = new Error("Database connection failed");
      jest.spyOn(mongoService, "getConexion").mockRejectedValue(mockError);

      await expect(
        perfilHardwareDatabase.newPerfilHardware(mockPerfilHardware),
      ).rejects.toThrow("Database connection failed");

      expect(mongoService.getConexion).toHaveBeenCalled();
    });

    //caracteres especiales
    it("should successfully insert a perfilHardware with special characters in fields", async () => {
      const mockPerfilHardware: PerfilHardware = {
        perfilHardware: "Test Profile with @#$%^&*",
        tipoOrdenador: "Laptop (Special)",
        procesador: "Intel i7 - 10th Gen!",
        memoria: "16GB DDR4",
        HHD: "1TB SSD + 2TB HDD",
        pantalla: '15.6" 4K OLED',
        teclado: "US/ES (Bilingual)",
        pantallaTactil: "Yes/Sí",
        SO: "Windows 10 Pro & Linux",
        mouse: "Wireless/Bluetooth Combo",
        mail: "test.user+special@example.com",
        monitorOficina: '27" Curved (2560x1440)',
        huellaTactil: "Yes - Enhanced",
        auricular: "Noise-Cancelling (ANC)",
        funda: "Leather & Kevlar",
        modeloPropuesto: "XPS 15 (2023)",
        detallesExtras: "Custom RGB lighting, 100% sRGB",
      };

      const mockInsertedId = new ObjectId();
      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          insertedId: mockInsertedId,
        }),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);

      const result = await perfilHardwareDatabase.newPerfilHardware(
        mockPerfilHardware,
      );

      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockPerfilHardware);
      expect(result).toEqual(mockInsertedId);
    });
  });
  describe("deletePerfil", () => {
    it("should successfully delete a profile and return true when the profile exists", async () => {
      const mockPerfilHardware: PerfilHardware = {
        _id: new ObjectId(),
        perfilHardware: "Test Profile",
        tipoOrdenador: "Laptop",
        procesador: "Intel i7",
        memoria: "16GB",
        HHD: "512GB SSD",
        pantalla: "15.6 inch",
        teclado: "US",
        pantallaTactil: "Yes",
        SO: "Windows 10",
        mouse: "Wireless",
        mail: "test@example.com",
        monitorOficina: "24 inch",
        huellaTactil: "Yes",
        auricular: "Bluetooth",
        funda: "Neoprene",
        modeloPropuesto: "Test Model",
        detallesExtras: "Test details",
      };
    
      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          deletedCount: 1,
        }),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);
    
      const result = await perfilHardwareDatabase.deletePerfil(mockPerfilHardware);
    
      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: mockPerfilHardware._id,
      });
      expect(result).toBe(true);
    });

    //el archivo no existe
    it("should return false when trying to delete a non-existent profile", async () => {
      const mockPerfilHardware: PerfilHardware = {
        _id: new ObjectId(),
        perfilHardware: "Non-existent Profile",
        tipoOrdenador: "Desktop",
        procesador: "AMD Ryzen 9",
        memoria: "32GB",
        HHD: "1TB NVMe SSD",
        pantalla: "27 inch",
        teclado: "ES",
        pantallaTactil: "No",
        SO: "Windows 11",
        mouse: "Gaming",
        mail: "nonexistent@example.com",
        monitorOficina: "32 inch",
        huellaTactil: "No",
        auricular: "7.1 Surround",
        funda: "None",
        modeloPropuesto: "Custom Build",
        detallesExtras: "High-end gaming setup",
      };
    
      const mockCollection = {
        deleteOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          deletedCount: 0,
        }),
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      jest.spyOn(mongoService, "getConexion").mockResolvedValue({
        db: jest.fn().mockReturnValue(mockDb),
      } as any);
    
      const result = await perfilHardwareDatabase.deletePerfil(mockPerfilHardware);
    
      expect(mongoService.getConexion).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith("perfilesHardware");
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: mockPerfilHardware._id,
      });
      expect(result).toBe(false);
    });
  })
  
  //borrar uno y no mas
  it("should handle and throw an error when database connection fails during deletion", async () => {
    const mockPerfilHardware: PerfilHardware = {
      _id: new ObjectId(),
      perfilHardware: "Test Profile",
      tipoOrdenador: "Laptop",
      procesador: "Intel i7",
      memoria: "16GB",
      HHD: "512GB SSD",
      pantalla: "15.6 inch",
      teclado: "US",
      pantallaTactil: "Yes",
      SO: "Windows 10",
      mouse: "Wireless",
      mail: "test@example.com",
      monitorOficina: "24 inch",
      huellaTactil: "Yes",
      auricular: "Bluetooth",
      funda: "Neoprene",
      modeloPropuesto: "Test Model",
      detallesExtras: "Test details",
    };
  
    const mockError = new Error("Database connection failed");
    jest.spyOn(mongoService, "getConexion").mockRejectedValue(mockError);
  
    await expect(perfilHardwareDatabase.deletePerfil(mockPerfilHardware)).rejects.toThrow("Database connection failed");
  
    expect(mongoService.getConexion).toHaveBeenCalled();
  });
});
