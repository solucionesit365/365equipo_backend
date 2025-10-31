import { Test, TestingModule } from "@nestjs/testing";
import { Tienda } from "./tiendas.class";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { TiendaDatabaseService } from "./tiendas.database";
import { IGetTiendasAteneaUseCase } from "./GetTiendasAtenea/IGetTiendasAtenea.use-case";
import { InternalServerErrorException } from "@nestjs/common";
import { Tienda as TTienda, Trabajador } from "@prisma/client";
import { Tiendas2 } from "./tiendas.dto";

describe("Tienda", () => {
  let tienda: Tienda;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let tiendaDatabaseService: jest.Mocked<TiendaDatabaseService>;
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

  const mockTiendaPrisma2: TTienda = {
    id: 2,
    nombre: "T--Tienda Norte",
    direccion: "Avenida Norte 456",
    idExterno: 102,
    coordinatorId: null,
    supervisorId: null,
    existsBC: true,
  };

  const mockTiendaPrisma3: TTienda = {
    id: 3,
    nombre: "M--Tienda Sur",
    direccion: "Calle Sur 789",
    idExterno: 103,
    coordinatorId: null,
    supervisorId: null,
    existsBC: true,
  };

  const mockTiendas2: Tiendas2[] = [
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
  ];

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
    const mockTrabajadorService = {
      getSubordinadosConTienda: jest.fn(),
    };

    const mockTiendaDatabaseService = {
      getTiendas: jest.fn(),
      getTiendaById: jest.fn(),
      addTiendas2: jest.fn(),
      editTienda: jest.fn(),
      deleteTienda: jest.fn(),
    };

    const mockGetTiendasAteneaUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Tienda,
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
        {
          provide: TiendaDatabaseService,
          useValue: mockTiendaDatabaseService,
        },
        {
          provide: IGetTiendasAteneaUseCase,
          useValue: mockGetTiendasAteneaUseCase,
        },
      ],
    }).compile();

    tienda = module.get<Tienda>(Tienda);
    trabajadorService = module.get(
      TrabajadorService,
    ) as jest.Mocked<TrabajadorService>;
    tiendaDatabaseService = module.get(
      TiendaDatabaseService,
    ) as jest.Mocked<TiendaDatabaseService>;
    getTiendasAteneaUseCase = module.get(
      IGetTiendasAteneaUseCase,
    ) as jest.Mocked<IGetTiendasAteneaUseCase>;
  });

  describe("getTiendas", () => {
    it("debe retornar tiendas ordenadas", async () => {
      const mockTiendas = [mockTiendaPrisma, mockTiendaPrisma2];
      tiendaDatabaseService.getTiendas.mockResolvedValue(mockTiendas);

      const result = await tienda.getTiendas();

      expect(result).toBeDefined();
      expect(tiendaDatabaseService.getTiendas).toHaveBeenCalled();
    });

    it("debe ordenar tiendas con prefijo T-- primero", async () => {
      const mockTiendas = [
        mockTiendaPrisma,
        mockTiendaPrisma2,
        mockTiendaPrisma3,
      ];
      tiendaDatabaseService.getTiendas.mockResolvedValue(mockTiendas);

      const result = await tienda.getTiendas();

      expect(result[0].nombre).toContain("T--");
    });

    it("debe lanzar InternalServerErrorException si hay un error", async () => {
      tiendaDatabaseService.getTiendas.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(tienda.getTiendas()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      tiendaDatabaseService.getTiendas.mockResolvedValue([]);

      const result = await tienda.getTiendas();

      expect(result).toEqual([]);
    });
  });

  describe("getTiendaByIdExterno", () => {
    it("debe retornar una tienda por id externo", async () => {
      tiendaDatabaseService.getTiendaById.mockResolvedValue(mockTiendaPrisma);

      const result = await tienda.getTiendaByIdExterno(101);

      expect(result).toEqual(mockTiendaPrisma);
      expect(tiendaDatabaseService.getTiendaById).toHaveBeenCalledWith(101);
    });
  });

  describe("getTiendasResponsable", () => {
    it("debe retornar tiendas únicas de subordinados", async () => {
      const subordinados: any = [
        { ...mockTrabajador, idTienda: 1, nombreTienda: "Tienda Centro" },
        { ...mockTrabajador, idTienda: 2, nombreTienda: "Tienda Norte" },
        { ...mockTrabajador, idTienda: 1, nombreTienda: "Tienda Centro" }, // duplicado
      ];

      trabajadorService.getSubordinadosConTienda.mockResolvedValue(
        subordinados,
      );

      const result = await tienda.getTiendasResponsable(mockTrabajador);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        idTienda: 1,
        nombreTienda: "Tienda Centro",
      });
      expect(result[1]).toEqual({ idTienda: 2, nombreTienda: "Tienda Norte" });
    });

    it("debe retornar array vacío si no hay subordinados", async () => {
      trabajadorService.getSubordinadosConTienda.mockResolvedValue([]);

      const result = await tienda.getTiendasResponsable(mockTrabajador);

      expect(result).toEqual([]);
    });
  });

  describe("convertirTiendaToExterno", () => {
    it("debe convertir id interno a id externo", () => {
      const tiendas = [
        { id: 1, idExterno: 101 },
        { id: 2, idExterno: 102 },
      ];

      const result = tienda.convertirTiendaToExterno(1, tiendas);

      expect(result).toBe(101);
    });

    it("debe retornar null si no encuentra la tienda", () => {
      const tiendas = [
        { id: 1, idExterno: 101 },
        { id: 2, idExterno: 102 },
      ];

      const result = tienda.convertirTiendaToExterno(999, tiendas);

      expect(result).toBeNull();
    });

    it("debe retornar null para array vacío", () => {
      const result = tienda.convertirTiendaToExterno(1, []);

      expect(result).toBeNull();
    });
  });

  describe("getTiendas2", () => {
    it("debe retornar tiendas de Atenea ordenadas", async () => {
      const mockTiendasAtenea = [
        { ...mockTiendas2[0], name: "Z--Tienda" },
        { ...mockTiendas2[0], name: "T--Tienda Centro" },
      ];
      getTiendasAteneaUseCase.execute.mockResolvedValue(mockTiendasAtenea);

      const result = await tienda.getTiendas2();

      expect(result).toBeDefined();
      expect(result[0].name).toContain("T--");
      expect(getTiendasAteneaUseCase.execute).toHaveBeenCalled();
    });

    it("debe lanzar InternalServerErrorException si hay un error", async () => {
      getTiendasAteneaUseCase.execute.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(tienda.getTiendas2()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("debe retornar array vacío si no hay tiendas", async () => {
      getTiendasAteneaUseCase.execute.mockResolvedValue([]);

      const result = await tienda.getTiendas2();

      expect(result).toEqual([]);
    });
  });

  describe("addTiendas2", () => {
    it("debe agregar una tienda correctamente", async () => {
      tiendaDatabaseService.addTiendas2.mockResolvedValue(null);

      const result = await tienda.addTiendas2(mockTiendas2[0]);

      expect(result).toBe(true);
      expect(tiendaDatabaseService.addTiendas2).toHaveBeenCalledWith(
        mockTiendas2[0],
      );
    });

    it("debe manejar errores al agregar tiendas", async () => {
      tiendaDatabaseService.addTiendas2.mockRejectedValue(
        new Error("Insert error"),
      );

      const result = await tienda.addTiendas2(mockTiendas2[0]);

      expect(result).toBeUndefined();
    });
  });

  describe("editTienda", () => {
    it("debe editar una tienda correctamente", async () => {
      tiendaDatabaseService.editTienda.mockResolvedValue(true);

      const result = await tienda.editTienda(mockTiendas2[0]);

      expect(result).toBe(true);
      expect(tiendaDatabaseService.editTienda).toHaveBeenCalledWith(
        mockTiendas2[0],
      );
    });

    it("debe retornar false si falla la edición", async () => {
      tiendaDatabaseService.editTienda.mockRejectedValue(
        new Error("Update error"),
      );

      const result = await tienda.editTienda(mockTiendas2[0]);

      expect(result).toBe(false);
    });
  });

  describe("deleteTienda", () => {
    it("debe eliminar una tienda correctamente", async () => {
      tiendaDatabaseService.deleteTienda.mockResolvedValue(true);

      const result = await tienda.deleteTienda(1);

      expect(result).toBe(true);
      expect(tiendaDatabaseService.deleteTienda).toHaveBeenCalledWith(1);
    });

    it("debe retornar false si falla la eliminación", async () => {
      tiendaDatabaseService.deleteTienda.mockRejectedValue(
        new Error("Delete error"),
      );

      const result = await tienda.deleteTienda(1);

      expect(result).toBe(false);
    });
  });
});
