import { Test, TestingModule } from "@nestjs/testing";
import { FichajesValidadosService } from "./fichajes-validados.class";
import { FichajesValidadosDatabase } from "./fichajes-validados.mongodb";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { DateTime } from "luxon";
import { FichajeValidadoDto } from "./fichajes-validados.dto";

describe("FichajesValidadosService", () => {
  let service: FichajesValidadosService;
  let fichajesValidadosDatabase: any;
  let trabajadorService: any;

  beforeEach(async () => {
    const mockFichajesValidadosDatabase = {
      insertarFichajeValidado: jest.fn(),
      getFichajesValidados: jest.fn(),
      getParaCuadranteNew: jest.fn(),
      getPendientesEnvio: jest.fn(),
      insertFichajesValidadosRectificados: jest.fn(),
      updateFichajesValidados: jest.fn(),
      getFichajesPagar: jest.fn(),
      getAllFichajesPagar: jest.fn(),
      getAllIdResponsableFichajesPagar: jest.fn(),
      getSemanasFichajesPagar: jest.fn(),
      getAllFichajesValidados: jest.fn(),
      getParaCuadrante: jest.fn(),
      getTiendaDia: jest.fn(),
      getTiendaRango: jest.fn(),
      getValidadosSemanaResponsable: jest.fn(),
      getFichajesValidadosTiendaRango: jest.fn(),
      getFichajesValidadosTrabajadorTiendaRango: jest.fn(),
      getFichajesValidadosInforme: jest.fn(),
      getTodos: jest.fn(),
    };

    const mockTrabajadorService = {
      getResponsableTienda: jest.fn(),
      getSubordinadosById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FichajesValidadosService,
        {
          provide: FichajesValidadosDatabase,
          useValue: mockFichajesValidadosDatabase,
        },
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
      ],
    }).compile();

    service = module.get<FichajesValidadosService>(FichajesValidadosService);
    fichajesValidadosDatabase = module.get(FichajesValidadosDatabase);
    trabajadorService = module.get(TrabajadorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addFichajesValidados", () => {
    it("debe agregar un fichaje validado correctamente", async () => {
      const mockFichaje: FichajeValidadoDto = {
        idTrabajador: 1,
        fichajeEntrada: new Date(),
      } as FichajeValidadoDto;

      fichajesValidadosDatabase.insertarFichajeValidado.mockResolvedValue({
        insertedId: "123",
      } as any);

      const result = await service.addFichajesValidados(mockFichaje);

      expect(
        fichajesValidadosDatabase.insertarFichajeValidado,
      ).toHaveBeenCalledWith(mockFichaje);
      expect(result).toEqual({ insertedId: "123" });
    });
  });

  describe("getFichajesValidados", () => {
    it("debe obtener fichajes validados de un trabajador", async () => {
      const idTrabajador = 1;
      const mockFichajes = [
        { id: "1", idTrabajador: 1 },
        { id: "2", idTrabajador: 1 },
      ];

      fichajesValidadosDatabase.getFichajesValidados.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesValidados(idTrabajador);

      expect(
        fichajesValidadosDatabase.getFichajesValidados,
      ).toHaveBeenCalledWith(idTrabajador);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getFichajesValidadosRango", () => {
    it("debe obtener fichajes validados en un rango de fechas", async () => {
      const idTrabajador = 1;
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const fechaFinal = DateTime.fromISO("2024-01-07");
      const mockFichajes = [{ id: "1", idTrabajador: 1 }];

      fichajesValidadosDatabase.getParaCuadranteNew.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesValidadosRango(
        idTrabajador,
        fechaInicio,
        fechaFinal,
      );

      expect(
        fichajesValidadosDatabase.getParaCuadranteNew,
      ).toHaveBeenCalledWith(fechaInicio, fechaFinal, idTrabajador);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getPendientesEnvio", () => {
    it("debe obtener fichajes pendientes de envío", async () => {
      const mockPendientes = [
        { id: "1", enviado: false },
        { id: "2", enviado: false },
      ];

      fichajesValidadosDatabase.getPendientesEnvio.mockResolvedValue(
        mockPendientes,
      );

      const result = await service.getPendientesEnvio();

      expect(fichajesValidadosDatabase.getPendientesEnvio).toHaveBeenCalled();
      expect(result).toEqual(mockPendientes);
    });
  });

  describe("updateFichajesValidados", () => {
    it("debe actualizar un fichaje validado", async () => {
      const mockFichaje: FichajeValidadoDto = {
        _id: "123",
        idTrabajador: 1,
      } as FichajeValidadoDto;

      fichajesValidadosDatabase.updateFichajesValidados.mockResolvedValue({
        modifiedCount: 1,
      } as any);

      const result = await service.updateFichajesValidados(mockFichaje);

      expect(
        fichajesValidadosDatabase.updateFichajesValidados,
      ).toHaveBeenCalledWith(mockFichaje);
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe("getFichajesPagar", () => {
    it("debe obtener fichajes a pagar de un responsable", async () => {
      const idResponsable = 1;
      const aPagar = true;
      const fecha = DateTime.fromISO("2024-01-01");
      const mockFichajes = [{ id: "1", aPagar: true }];

      fichajesValidadosDatabase.getFichajesPagar.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesPagar(
        idResponsable,
        aPagar,
        fecha,
      );

      expect(fichajesValidadosDatabase.getFichajesPagar).toHaveBeenCalledWith(
        idResponsable,
        aPagar,
        fecha,
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getAllFichajesPagar", () => {
    it("debe obtener todos los fichajes a pagar", async () => {
      const aPagar = true;
      const mockFichajes = [
        { id: "1", aPagar: true },
        { id: "2", aPagar: true },
      ];

      fichajesValidadosDatabase.getAllFichajesPagar.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getAllFichajesPagar(aPagar);

      expect(
        fichajesValidadosDatabase.getAllFichajesPagar,
      ).toHaveBeenCalledWith(aPagar);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getNumeroSemana", () => {
    it("debe calcular el número del día de la semana correctamente", () => {
      const fecha = new Date("2024-01-01");

      const result = service.getNumeroSemana(fecha);

      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(7);
    });

    it("debe retornar 0 para lunes", () => {
      const lunes = new Date("2024-01-01");

      const result = service.getNumeroSemana(lunes);

      expect(result).toBe(0);
    });
  });

  describe("getFichajesValidadosTiendaRango", () => {
    it("debe obtener fichajes validados de una tienda en un rango", async () => {
      const idTienda = 1;
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const fechaFinal = DateTime.fromISO("2024-01-07");
      const mockFichajes = [{ id: "1", idTienda: 1 }];

      fichajesValidadosDatabase.getFichajesValidadosTiendaRango.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesValidadosTiendaRango(
        idTienda,
        fechaInicio,
        fechaFinal,
      );

      expect(
        fichajesValidadosDatabase.getFichajesValidadosTiendaRango,
      ).toHaveBeenCalledWith(idTienda, fechaInicio, fechaFinal);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getFichajesValidadosTrabajadorTiendaRango", () => {
    it("debe obtener fichajes validados de un trabajador en una tienda", async () => {
      const idTrabajador = 1;
      const idTienda = 1;
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const fechaFinal = DateTime.fromISO("2024-01-07");
      const mockFichajes = [{ id: "1", idTrabajador: 1, idTienda: 1 }];

      fichajesValidadosDatabase.getFichajesValidadosTrabajadorTiendaRango.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesValidadosTrabajadorTiendaRango(
        idTrabajador,
        idTienda,
        fechaInicio,
        fechaFinal,
      );

      expect(
        fichajesValidadosDatabase.getFichajesValidadosTrabajadorTiendaRango,
      ).toHaveBeenCalledWith(idTrabajador, idTienda, fechaInicio, fechaFinal);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getFichajesValidadosInforme", () => {
    it("debe obtener fichajes validados para informe", async () => {
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const fechaFinal = DateTime.fromISO("2024-01-07");
      const idTrabajador = 1;
      const mockFichajes = [{ id: "1", idTrabajador: 1 }];

      fichajesValidadosDatabase.getFichajesValidadosInforme.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getFichajesValidadosInforme(
        fechaInicio,
        fechaFinal,
        idTrabajador,
      );

      expect(
        fichajesValidadosDatabase.getFichajesValidadosInforme,
      ).toHaveBeenCalledWith(fechaInicio, fechaFinal, idTrabajador);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getTodos", () => {
    it("debe obtener todos los fichajes validados", async () => {
      const mockFichajes = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ];

      fichajesValidadosDatabase.getTodos.mockResolvedValue(mockFichajes);

      const result = await service.getTodos();

      expect(fichajesValidadosDatabase.getTodos).toHaveBeenCalled();
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getAllFichajesValidados", () => {
    it("debe obtener todos los fichajes validados por fecha", async () => {
      const fecha = new Date("2024-01-01");
      const mockFichajes = [{ id: "1", fecha: fecha }];

      fichajesValidadosDatabase.getAllFichajesValidados.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getAllFichajesValidados(fecha);

      expect(
        fichajesValidadosDatabase.getAllFichajesValidados,
      ).toHaveBeenCalledWith(DateTime.fromJSDate(fecha));
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getTiendaDia", () => {
    it("debe obtener fichajes de una tienda en un día específico", async () => {
      const tienda = 1;
      const dia = new Date("2024-01-01");
      const mockFichajes = [{ id: "1", idTienda: 1 }];

      fichajesValidadosDatabase.getTiendaDia.mockResolvedValue(mockFichajes);

      const result = await service.getTiendaDia(tienda, dia);

      expect(fichajesValidadosDatabase.getTiendaDia).toHaveBeenCalledWith(
        tienda,
        DateTime.fromJSDate(dia),
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getTiendaRango", () => {
    it("debe obtener fichajes de varias tiendas en un rango", async () => {
      const tiendas = [1, 2, 3];
      const fechaInicio = new Date("2024-01-01");
      const fechaFin = new Date("2024-01-07");
      const mockFichajes = [{ id: "1" }, { id: "2" }];

      fichajesValidadosDatabase.getTiendaRango.mockResolvedValue(mockFichajes);

      const result = await service.getTiendaRango(tiendas, fechaInicio, fechaFin);

      expect(fichajesValidadosDatabase.getTiendaRango).toHaveBeenCalledWith(
        tiendas,
        DateTime.fromJSDate(fechaInicio),
        DateTime.fromJSDate(fechaFin),
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("insertFichajesValidadosRectificados", () => {
    it("debe insertar fichajes validados rectificados", async () => {
      const mockData: FichajeValidadoDto[] = [
        { idTrabajador: 1, fichajeEntrada: new Date() } as FichajeValidadoDto,
        { idTrabajador: 2, fichajeEntrada: new Date() } as FichajeValidadoDto,
      ];

      fichajesValidadosDatabase.insertFichajesValidadosRectificados.mockResolvedValue({
        insertedCount: 2,
      } as any);

      const result = await service.insertFichajesValidadosRectificados(mockData);

      expect(
        fichajesValidadosDatabase.insertFichajesValidadosRectificados,
      ).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({ insertedCount: 2 });
    });
  });

  describe("getAllIdResponsable", () => {
    it("debe obtener todos los fichajes por id de responsable", async () => {
      const mockFichajes = [{ id: "1", idResponsable: 1 }];

      fichajesValidadosDatabase.getAllIdResponsableFichajesPagar.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getAllIdResponsable(1);

      expect(
        fichajesValidadosDatabase.getAllIdResponsableFichajesPagar,
      ).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getSemanasFichajesPagar", () => {
    it("debe obtener fichajes a pagar de una semana", async () => {
      const fechaEntreSemana = DateTime.fromISO("2024-01-03");
      const mockFichajes = [{ id: "1", semana: 1 }];

      fichajesValidadosDatabase.getSemanasFichajesPagar.mockResolvedValue(
        mockFichajes,
      );

      const result = await service.getSemanasFichajesPagar(fechaEntreSemana);

      expect(fichajesValidadosDatabase.getSemanasFichajesPagar).toHaveBeenCalledWith(
        fechaEntreSemana.startOf("week"),
        fechaEntreSemana.endOf("week"),
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getParaCuadrante", () => {
    it("debe obtener fichajes para cuadrante", async () => {
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const fechaFinal = DateTime.fromISO("2024-01-07");
      const idTrabajador = 1;
      const mockFichajes = [{ id: "1" }];

      fichajesValidadosDatabase.getParaCuadrante.mockResolvedValue(mockFichajes);

      const result = await service.getParaCuadrante(
        fechaInicio,
        fechaFinal,
        idTrabajador,
      );

      expect(fichajesValidadosDatabase.getParaCuadrante).toHaveBeenCalledWith(
        fechaInicio,
        fechaFinal,
        idTrabajador,
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("getParaCuadranteNew", () => {
    it("debe obtener fichajes para cuadrante nuevo", async () => {
      const lunes = DateTime.fromISO("2024-01-01");
      const domingo = DateTime.fromISO("2024-01-07");
      const idTrabajador = 1;
      const mockFichajes = [{ id: "1" }];

      fichajesValidadosDatabase.getParaCuadranteNew.mockResolvedValue(mockFichajes);

      const result = await service.getParaCuadranteNew(lunes, domingo, idTrabajador);

      expect(fichajesValidadosDatabase.getParaCuadranteNew).toHaveBeenCalledWith(
        lunes,
        domingo,
        idTrabajador,
      );
      expect(result).toEqual(mockFichajes);
    });
  });

  describe("formatoConsultaSQL", () => {
    it("debe formatear la consulta SQL correctamente", () => {
      const mockFichaje: FichajeValidadoDto = {
        idTrabajador: 1,
        cuadrante: {
          inicio: new Date("2024-01-15T08:00:00"),
          final: new Date("2024-01-15T17:00:00"),
        },
      } as any;

      const result = service.formatoConsultaSQL(mockFichaje);

      expect(result).toContain("DELETE FROM");
      expect(result).toContain("INSERT INTO");
      expect(result).toContain("idEmpleado = 1");
    });
  });

  describe("addToSubordinados", () => {
    it("debe añadir fichaje validado al subordinado correcto", () => {
      const subordinados = [
        {
          id: 1,
          idApp: "uid-1",
          nombreApellidos: "Trabajador 1",
          idTienda: 1,
          antiguedad: "2020-01-01",
          inicioContrato: "2020-01-01",
          horasContrato: 40,
          fichajeValidado: [null, null, null, null, null, null, null],
        },
        {
          id: 2,
          idApp: "uid-2",
          nombreApellidos: "Trabajador 2",
          idTienda: 1,
          antiguedad: "2021-01-01",
          inicioContrato: "2021-01-01",
          horasContrato: 40,
          fichajeValidado: [null, null, null, null, null, null, null],
        },
      ];

      const fichajeValidado = {
        _id: "fichaje-1",
        idTrabajador: 1,
        cuadrante: { inicio: new Date() },
      } as any;

      service.addToSubordinados(subordinados as any, fichajeValidado, 0);

      expect(subordinados[0].fichajeValidado[0]).toEqual(fichajeValidado);
      expect(subordinados[1].fichajeValidado[0]).toBeNull();
    });

    it("no debe modificar subordinados si no coincide el id", () => {
      const subordinados = [
        {
          id: 1,
          idApp: "uid-1",
          nombreApellidos: "Trabajador 1",
          idTienda: 1,
          antiguedad: "2020-01-01",
          inicioContrato: "2020-01-01",
          horasContrato: 40,
          fichajeValidado: [null, null, null, null, null, null, null],
        },
      ];

      const fichajeValidado = {
        _id: "fichaje-1",
        idTrabajador: 999, // ID que no existe
        cuadrante: { inicio: new Date() },
      } as any;

      service.addToSubordinados(subordinados as any, fichajeValidado, 0);

      expect(subordinados[0].fichajeValidado[0]).toBeNull();
    });
  });

  describe("getNumeroSemana casos adicionales", () => {
    it("debe retornar 6 para domingo", () => {
      const domingo = new Date("2024-01-07"); // Domingo

      const result = service.getNumeroSemana(domingo);

      expect(result).toBe(6);
    });

    it("debe retornar valores entre 0 y 6 para cualquier día", () => {
      for (let i = 1; i <= 7; i++) {
        const fecha = new Date(`2024-01-0${i}`);
        const result = service.getNumeroSemana(fecha);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(6);
      }
    });
  });
});
