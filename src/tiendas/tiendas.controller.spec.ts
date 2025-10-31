import { Test, TestingModule } from "@nestjs/testing";
import { TiendasController } from "./tiendas.controller";
import { Tienda } from "./tiendas.class";
import { FirebaseService } from "../firebase/firebase.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { IGetTiendasAteneaUseCase } from "./GetTiendasAtenea/IGetTiendasAtenea.use-case";
import { AuthGuard } from "../guards/auth.guard";
import { Tiendas2 } from "./tiendas.dto";
import { Trabajador, Tienda as TTienda } from "@prisma/client";

describe("TiendasController", () => {
  let controller: TiendasController;
  let tiendasInstance: jest.Mocked<Tienda>;
  let trabajadorInstance: jest.Mocked<TrabajadorService>;
  let getTiendasAteneaUseCase: jest.Mocked<IGetTiendasAteneaUseCase>;

  const mockTiendaPrisma: TTienda = {
    id: 1,
    nombre: "Tienda Centro",
    direccion: "Calle Principal 123",
    idExterno: 101,
    coordinatorId: null,
    supervisorId: null,
    existsBC: true,
  };

  const mockTiendas2: Tiendas2 = {
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
  };

  const mockTrabajador: Trabajador = {
    id: 1,
    idApp: "100",
    nombreApellidos: "Juan Pérez",
    displayName: "Juan",
    emails: "juan@example.com",
    dni: "12345678A",
    direccion: "Calle Test 123",
    ciudad: "Madrid",
    telefonos: "600000000",
    fechaNacimiento: new Date(),
    nacionalidad: "España",
    nSeguridadSocial: "123456789012",
    codigoPostal: "28001",
    cuentaCorriente: "ES1234567890123456789012",
    tipoTrabajador: "EMPLEADO",
    idResponsable: null,
    idTienda: 1,
    llevaEquipo: false,
    tokenQR: null,
    displayFoto: null,
    excedencia: false,
    dispositivo: null,
    empresaId: "EMP001",
    esTienda: false,
    nPerceptor: null,
    workEmail: null,
  };

  beforeEach(async () => {
    const mockTiendasService = {
      getTiendas: jest.fn(),
      getTiendasResponsable: jest.fn(),
      getTiendaByIdExterno: jest.fn(),
      addTiendas2: jest.fn(),
      editTienda: jest.fn(),
      deleteTienda: jest.fn(),
    };

    const mockTrabajadorService = {
      getTrabajadorByAppId: jest.fn(),
    };

    const mockGetTiendasAteneaUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiendasController],
      providers: [
        {
          provide: FirebaseService,
          useValue: {},
        },
        {
          provide: Tienda,
          useValue: mockTiendasService,
        },
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
        {
          provide: IGetTiendasAteneaUseCase,
          useValue: mockGetTiendasAteneaUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TiendasController>(TiendasController);
    tiendasInstance = module.get(Tienda) as jest.Mocked<Tienda>;
    trabajadorInstance = module.get(
      TrabajadorService,
    ) as jest.Mocked<TrabajadorService>;
    getTiendasAteneaUseCase = module.get(
      IGetTiendasAteneaUseCase,
    ) as jest.Mocked<IGetTiendasAteneaUseCase>;
  });

  describe("getTiendas", () => {
    it("debe retornar todas las tiendas", async () => {
      const mockTiendas = [mockTiendaPrisma];
      tiendasInstance.getTiendas.mockResolvedValue(mockTiendas);

      const result = await controller.getTiendas();

      expect(result).toEqual(mockTiendas);
      expect(tiendasInstance.getTiendas).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      tiendasInstance.getTiendas.mockResolvedValue([]);

      const result = await controller.getTiendas();

      expect(result).toEqual([]);
    });

    it("debe propagar errores del servicio", async () => {
      tiendasInstance.getTiendas.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(controller.getTiendas()).rejects.toThrow("Database error");
    });
  });

  describe("getTiendasResponsable", () => {
    it("debe retornar tiendas del responsable", async () => {
      const mockTiendasResponsable = [
        { idTienda: 1, nombreTienda: "Tienda Centro" },
      ];
      trabajadorInstance.getTrabajadorByAppId.mockResolvedValue(
        mockTrabajador as any,
      );
      tiendasInstance.getTiendasResponsable.mockResolvedValue(
        mockTiendasResponsable,
      );

      const result = await controller.getTiendasResponsable({ idApp: "100" });

      expect(result).toEqual({
        ok: true,
        data: mockTiendasResponsable,
      });
      expect(trabajadorInstance.getTrabajadorByAppId).toHaveBeenCalledWith(
        "100",
      );
      expect(tiendasInstance.getTiendasResponsable).toHaveBeenCalledWith(
        mockTrabajador,
      );
    });

    it("debe manejar errores correctamente", async () => {
      trabajadorInstance.getTrabajadorByAppId.mockRejectedValue(
        new Error("Worker not found"),
      );

      const result = await controller.getTiendasResponsable({ idApp: "999" });

      expect(result).toEqual({
        ok: false,
        message: "Worker not found",
      });
    });
  });

  describe("getTiendas2", () => {
    it("debe retornar tiendas de Atenea", async () => {
      const mockTiendasAtenea = [mockTiendas2];
      getTiendasAteneaUseCase.execute.mockResolvedValue(mockTiendasAtenea);

      const result = await controller.getTiendas2();

      expect(result).toEqual(mockTiendasAtenea);
      expect(getTiendasAteneaUseCase.execute).toHaveBeenCalled();
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      getTiendasAteneaUseCase.execute.mockResolvedValue([]);

      const result = await controller.getTiendas2();

      expect(result).toEqual([]);
    });
  });

  describe("getTiendaById", () => {
    it("debe retornar una tienda por id", async () => {
      tiendasInstance.getTiendaByIdExterno.mockResolvedValue(mockTiendaPrisma);

      const result = await controller.getTiendaById({ id: 101 });

      expect(result).toEqual(mockTiendaPrisma);
      expect(tiendasInstance.getTiendaByIdExterno).toHaveBeenCalledWith(101);
    });

    it("debe retornar null si no encuentra la tienda", async () => {
      tiendasInstance.getTiendaByIdExterno.mockResolvedValue(null);

      const result = await controller.getTiendaById({ id: 999 });

      expect(result).toBeNull();
    });
  });

  describe("addTiendas2", () => {
    it("debe agregar tiendas correctamente", async () => {
      tiendasInstance.addTiendas2.mockResolvedValue(true);

      const result = await controller.addTiendas2(mockTiendas2);

      expect(result).toEqual({
        ok: true,
        message: "Tiendas insertadas correctamente",
      });
      expect(tiendasInstance.addTiendas2).toHaveBeenCalledWith(mockTiendas2);
    });

    it("debe retornar false si no se insertaron tiendas", async () => {
      tiendasInstance.addTiendas2.mockResolvedValue(false);

      const result = await controller.addTiendas2(mockTiendas2);

      expect(result).toEqual({
        ok: false,
        message: "No se insertaron tiendas",
      });
    });

    it("debe manejar errores al insertar", async () => {
      tiendasInstance.addTiendas2.mockRejectedValue(
        new Error("Insert error"),
      );

      const result = await controller.addTiendas2(mockTiendas2);

      expect(result).toEqual({
        ok: false,
        message: "Insert error",
      });
    });
  });

  describe("editTienda", () => {
    it("debe editar una tienda correctamente", async () => {
      tiendasInstance.editTienda.mockResolvedValue(true);

      const result = await controller.editTienda(mockTiendas2);

      expect(result).toEqual({
        ok: true,
        message: "Tienda editada correctamente",
      });
      expect(tiendasInstance.editTienda).toHaveBeenCalledWith(mockTiendas2);
    });

    it("debe retornar false si no se editó la tienda", async () => {
      tiendasInstance.editTienda.mockResolvedValue(false);

      const result = await controller.editTienda(mockTiendas2);

      expect(result).toEqual({
        ok: false,
        message: "No se editó la tienda",
      });
    });

    it("debe manejar errores al editar", async () => {
      tiendasInstance.editTienda.mockRejectedValue(new Error("Update error"));

      const result = await controller.editTienda(mockTiendas2);

      expect(result).toEqual({
        ok: false,
        message: "Update error",
      });
    });
  });

  describe("deleteTienda", () => {
    it("debe eliminar una tienda correctamente", async () => {
      tiendasInstance.deleteTienda.mockResolvedValue(true);

      const result = await controller.deleteTienda(1);

      expect(result).toEqual({
        ok: true,
        message: "Tienda eliminada correctamente",
      });
      expect(tiendasInstance.deleteTienda).toHaveBeenCalledWith(1);
    });

    it("debe retornar false si no se eliminó la tienda", async () => {
      tiendasInstance.deleteTienda.mockResolvedValue(false);

      const result = await controller.deleteTienda(1);

      expect(result).toEqual({
        ok: false,
        message: "No se eliminó la tienda",
      });
    });

    it("debe manejar errores al eliminar", async () => {
      tiendasInstance.deleteTienda.mockRejectedValue(
        new Error("Delete error"),
      );

      const result = await controller.deleteTienda(1);

      expect(result).toEqual({
        ok: false,
        message: "Delete error",
      });
    });
  });
});
