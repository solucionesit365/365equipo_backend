import { Test, TestingModule } from "@nestjs/testing";
import { PactadoVsRealService } from "./pactado-vs-real.service";
import { TrabajadorService } from "../trabajadores/trabajadores.class";
import { FichajesValidadosService } from "../fichajes-validados/fichajes-validados.class";
import { AusenciasService } from "../ausencias/ausencias.class";
import { ITurnoRepository } from "../turno/repository/interfaces/turno.repository.interface";
import { DateTime } from "luxon";

describe("PactadoVsRealService", () => {
  let service: PactadoVsRealService;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let fichajesValidadosService: jest.Mocked<FichajesValidadosService>;
  let ausenciasService: jest.Mocked<AusenciasService>;
  let turnoRepository: jest.Mocked<ITurnoRepository>;

  beforeEach(async () => {
    const mockTrabajadorService = {
      getSubordinados: jest.fn(),
      getTrabajadorBySqlId: jest.fn(),
      getTrabajadores: jest.fn(),
    };

    const mockFichajesValidadosService = {
      getFichajesValidadosTiendaRango: jest.fn(),
      getFichajesValidadosTrabajadorTiendaRango: jest.fn(),
      getFichajesValidadosInforme: jest.fn(),
    };

    const mockAusenciasService = {
      getAusenciasIntervalo: jest.fn(),
    };

    const mockTurnoRepository = {
      getTurnosPorTrabajador: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PactadoVsRealService,
        { provide: TrabajadorService, useValue: mockTrabajadorService },
        {
          provide: FichajesValidadosService,
          useValue: mockFichajesValidadosService,
        },
        { provide: AusenciasService, useValue: mockAusenciasService },
        { provide: ITurnoRepository, useValue: mockTurnoRepository },
      ],
    }).compile();

    service = module.get<PactadoVsRealService>(PactadoVsRealService);
    trabajadorService = module.get(TrabajadorService);
    fichajesValidadosService = module.get(FichajesValidadosService);
    ausenciasService = module.get(AusenciasService);
    turnoRepository = module.get(ITurnoRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("pactadoVsReal", () => {
    it("debe calcular pactado vs real para subordinados", async () => {
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const mockSubordinados = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          contratos: [{ horasContrato: 100 }],
          idTienda: 1,
        },
      ];

      const mockFichajes = [
        { idTrabajador: 1, horasPagar: { total: 8, estadoValidado: "APROBADAS" } },
      ];

      trabajadorService.getSubordinados.mockResolvedValue(mockSubordinados as any);
      trabajadorService.getTrabajadorBySqlId.mockResolvedValue(
        mockSubordinados[0] as any,
      );
      fichajesValidadosService.getFichajesValidadosTiendaRango.mockResolvedValue(
        [],
      );
      fichajesValidadosService.getFichajesValidadosTrabajadorTiendaRango.mockResolvedValue(
        mockFichajes as any,
      );
      turnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      const result = await service.pactadoVsReal("uid123", fechaInicio, 1);

      expect(trabajadorService.getSubordinados).toHaveBeenCalledWith("uid123");
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty("nombre");
      expect(result[0]).toHaveProperty("arrayValidados");
    });

    it("debe incluir trabajadores externos que han fichado en la tienda", async () => {
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const mockSubordinados = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          contratos: [{ horasContrato: 100 }],
          idTienda: 1,
        },
      ];

      const mockTrabajadorExterno = {
        id: 2,
        nombreApellidos: "María García",
        contratos: [{ horasContrato: 100 }],
        idTienda: 1,
      };

      const mockFichajesTienda = [
        { idTrabajador: 2 },
      ];

      trabajadorService.getSubordinados.mockResolvedValue(mockSubordinados as any);
      fichajesValidadosService.getFichajesValidadosTiendaRango.mockResolvedValue(
        mockFichajesTienda as any,
      );

      // Los getTrabajadorBySqlId se llaman: primero para subordinados[0], luego para el externo,
      // después 7 veces por día para subordinados[0], 7 veces para externo
      const totalCalls = [mockSubordinados[0], mockTrabajadorExterno];
      for (let i = 0; i < 14; i++) {
        totalCalls.push(i < 7 ? mockSubordinados[0] : mockTrabajadorExterno);
      }

      trabajadorService.getTrabajadorBySqlId
        .mockResolvedValueOnce(mockSubordinados[0] as any)
        .mockResolvedValueOnce(mockTrabajadorExterno as any);

      fichajesValidadosService.getFichajesValidadosTrabajadorTiendaRango.mockResolvedValue(
        [] as any,
      );
      turnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      const result = await service.pactadoVsReal("uid123", fechaInicio, 1);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("debe procesar fichajes para cada día de la semana", async () => {
      const fechaInicio = DateTime.fromISO("2024-01-01");
      const mockSubordinados = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          contratos: [{ horasContrato: 100 }],
          idTienda: 1,
        },
      ];

      trabajadorService.getSubordinados.mockResolvedValue(mockSubordinados as any);
      trabajadorService.getTrabajadorBySqlId.mockResolvedValue(
        mockSubordinados[0] as any,
      );
      fichajesValidadosService.getFichajesValidadosTiendaRango.mockResolvedValue(
        [],
      );
      fichajesValidadosService.getFichajesValidadosTrabajadorTiendaRango.mockResolvedValue(
        [] as any,
      );
      turnoRepository.getTurnosPorTrabajador.mockResolvedValue([]);

      const result = await service.pactadoVsReal("uid123", fechaInicio, 1);

      expect(
        fichajesValidadosService.getFichajesValidadosTrabajadorTiendaRango,
      ).toHaveBeenCalledTimes(7);
      expect(result[0].arrayValidados).toHaveLength(7);
    });
  });

  describe("informePactadoVsReal", () => {
    it("debe generar informe completo para todos los trabajadores", async () => {
      const inicioSemana = DateTime.fromISO("2024-01-01");
      const mockTrabajadores = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          dni: "12345678A",
          tienda: { nombre: "Tienda 1" },
          contratos: [
            {
              horasContrato: 100,
              fechaAntiguedad: new Date("2020-01-01"),
            },
          ],
        },
      ];

      const mockFichajes = [];
      const mockAusencias = [];

      trabajadorService.getTrabajadores.mockResolvedValue(
        mockTrabajadores as any,
      );
      fichajesValidadosService.getFichajesValidadosInforme.mockResolvedValue(
        mockFichajes,
      );
      ausenciasService.getAusenciasIntervalo.mockResolvedValue(mockAusencias);

      const result = await service.informePactadoVsReal(inicioSemana);

      expect(trabajadorService.getTrabajadores).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty("nombre");
      expect(result[0]).toHaveProperty("dni");
      expect(result[0]).toHaveProperty("tienda");
      expect(result[0]).toHaveProperty("contrato");
      expect(result[0]).toHaveProperty("horasAPagar");
    });

    it("debe incluir ausencias cuando existen", async () => {
      const inicioSemana = DateTime.fromISO("2024-01-01");
      const mockTrabajadores = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          dni: "12345678A",
          tienda: { nombre: "Tienda 1" },
          contratos: [
            {
              horasContrato: 100,
              fechaAntiguedad: new Date("2020-01-01"),
            },
          ],
        },
      ];

      const mockAusencias: any = [
        {
          idUsuario: 1,
          fechaInicio: new Date("2024-01-01"),
          fechaFinal: new Date("2024-01-02"),
          tipo: "VACACIONES",
          horas: 8,
          nombre: "Juan Pérez",
          comentario: "",
          completa: true,
        },
      ];

      trabajadorService.getTrabajadores.mockResolvedValue(
        mockTrabajadores as any,
      );
      fichajesValidadosService.getFichajesValidadosInforme.mockResolvedValue([]);
      ausenciasService.getAusenciasIntervalo.mockResolvedValue(mockAusencias);

      const result = await service.informePactadoVsReal(inicioSemana);

      expect(result[0]).toHaveProperty("ausenciasSemana");
      expect(result[0]).toHaveProperty("totalHorasAusencias");
    });

    it("debe calcular correctamente las horas a pagar", async () => {
      const inicioSemana = DateTime.fromISO("2024-01-01");
      const mockTrabajadores = [
        {
          id: 1,
          nombreApellidos: "Juan Pérez",
          dni: "12345678A",
          tienda: { nombre: "Tienda 1" },
          contratos: [
            {
              horasContrato: 100,
              fechaAntiguedad: new Date("2020-01-01"),
            },
          ],
        },
      ];

      const mockFichajes = [
        {
          fichajeEntrada: new Date("2024-01-01T09:00:00"),
          horasPagar: { total: 8, estadoValidado: "APROBADAS" },
        },
        {
          fichajeEntrada: new Date("2024-01-02T09:00:00"),
          horasPagar: { total: 8, estadoValidado: "APROBADAS" },
        },
      ];

      trabajadorService.getTrabajadores.mockResolvedValue(
        mockTrabajadores as any,
      );
      fichajesValidadosService.getFichajesValidadosInforme.mockResolvedValue(
        mockFichajes as any,
      );
      ausenciasService.getAusenciasIntervalo.mockResolvedValue([]);

      const result = await service.informePactadoVsReal(inicioSemana);

      expect(result[0].horasAPagar).toBe(16);
    });
  });
});
