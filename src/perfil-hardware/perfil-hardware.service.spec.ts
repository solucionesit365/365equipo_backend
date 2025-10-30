import { Test, TestingModule } from "@nestjs/testing";
import { PerfilHardwareService } from "./perfil-hardware.service";
import { PerfilHardwareDatabase } from "./perfil-hardware.mongodb";
import { PerfilHardware } from "./perfil-hardware.interface";

describe("PerfilHardwareService", () => {
  let service: PerfilHardwareService;
  let perfilHardwareDatabase: jest.Mocked<PerfilHardwareDatabase>;

  beforeEach(async () => {
    const mockPerfilHardwareDatabase = {
      newPerfilHardware: jest.fn(),
      getPerfilesH: jest.fn(),
      deletePerfil: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilHardwareService,
        {
          provide: PerfilHardwareDatabase,
          useValue: mockPerfilHardwareDatabase,
        },
      ],
    }).compile();

    service = module.get<PerfilHardwareService>(PerfilHardwareService);
    perfilHardwareDatabase = module.get(PerfilHardwareDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("newPerfilHardware", () => {
    it("debe crear un nuevo perfil de hardware correctamente", async () => {
      const mockPerfil: PerfilHardware = {
        perfilHardware: "Perfil Test",
        tipoOrdenador: "Portátil",
        procesador: "Intel i5",
        memoria: "8GB",
        HHD: "256GB SSD",
        pantalla: "14 pulgadas",
        teclado: "Español",
        pantallaTactil: "No",
        SO: "Windows 11",
        mouse: "Inalámbrico",
        mail: "test@example.com",
        monitorOficina: "No",
        huellaTactil: "Sí",
        auricular: "No",
        funda: "Sí",
        modeloPropuesto: "Dell Latitude",
        detallesExtras: "Ninguno",
      } as PerfilHardware;

      perfilHardwareDatabase.newPerfilHardware.mockResolvedValue(undefined);

      const result = await service.newPerfilHardware(mockPerfil);

      expect(perfilHardwareDatabase.newPerfilHardware).toHaveBeenCalledWith(
        mockPerfil,
      );
      expect(perfilHardwareDatabase.newPerfilHardware).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        ok: true,
        data: "Perfil de Hardware creado",
      });
    });

    it("debe manejar perfiles con diferentes propiedades", async () => {
      const mockPerfil: PerfilHardware = {
        perfilHardware: "Perfil Avanzado",
        tipoOrdenador: "Desktop",
        procesador: "Intel i7",
        memoria: "16GB",
        HHD: "512GB SSD",
        pantalla: "24 pulgadas",
        teclado: "Mecánico",
        pantallaTactil: "Sí",
        SO: "Windows 11 Pro",
        mouse: "Gaming",
        mail: "advanced@example.com",
        monitorOficina: "Sí",
        huellaTactil: "Sí",
        auricular: "Sí",
        funda: "No",
        modeloPropuesto: "HP EliteDesk",
        detallesExtras: "Configuración avanzada",
      } as PerfilHardware;

      perfilHardwareDatabase.newPerfilHardware.mockResolvedValue(undefined);

      const result = await service.newPerfilHardware(mockPerfil);

      expect(perfilHardwareDatabase.newPerfilHardware).toHaveBeenCalledWith(
        mockPerfil,
      );
      expect(result.ok).toBe(true);
    });
  });

  describe("getPerfiles", () => {
    it("debe obtener todos los perfiles de hardware", async () => {
      const mockPerfiles: Partial<PerfilHardware>[] = [
        {
          perfilHardware: "Perfil 1",
          procesador: "Intel i5",
        },
        {
          perfilHardware: "Perfil 2",
          procesador: "Intel i7",
        },
      ];

      perfilHardwareDatabase.getPerfilesH.mockResolvedValue(mockPerfiles as any);

      const result = await service.getPerfiles();

      expect(perfilHardwareDatabase.getPerfilesH).toHaveBeenCalled();
      expect(perfilHardwareDatabase.getPerfilesH).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPerfiles);
    });

    it("debe retornar un array vacío si no hay perfiles", async () => {
      perfilHardwareDatabase.getPerfilesH.mockResolvedValue([]);

      const result = await service.getPerfiles();

      expect(perfilHardwareDatabase.getPerfilesH).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("deletePerfil", () => {
    it("debe eliminar un perfil de hardware correctamente", async () => {
      const mockPerfil: Partial<PerfilHardware> = {
        perfilHardware: "Perfil a eliminar",
        procesador: "Intel i5",
      };

      const mockDeleteResult = { deletedCount: 1 };
      perfilHardwareDatabase.deletePerfil.mockResolvedValue(
        mockDeleteResult as any,
      );

      const result = await service.deletePerfil(mockPerfil as PerfilHardware);

      expect(perfilHardwareDatabase.deletePerfil).toHaveBeenCalledWith(
        mockPerfil,
      );
      expect(perfilHardwareDatabase.deletePerfil).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeleteResult);
    });

    it("debe manejar la eliminación de un perfil inexistente", async () => {
      const mockPerfil: Partial<PerfilHardware> = {
        perfilHardware: "Perfil inexistente",
        procesador: "Intel i3",
      };

      const mockDeleteResult = { deletedCount: 0 };
      perfilHardwareDatabase.deletePerfil.mockResolvedValue(
        mockDeleteResult as any,
      );

      const result = await service.deletePerfil(mockPerfil as PerfilHardware);

      expect(perfilHardwareDatabase.deletePerfil).toHaveBeenCalledWith(
        mockPerfil,
      );
      expect(result).toEqual(mockDeleteResult);
    });
  });
});
