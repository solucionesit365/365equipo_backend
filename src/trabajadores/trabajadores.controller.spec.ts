import { Test, TestingModule } from "@nestjs/testing";
import { TrabajadoresController } from "./trabajadores.controller";
import { TrabajadorService } from "./trabajadores.class";
import { AuthGuard } from "../guards/auth.guard";
import { RoleGuard } from "../guards/role.guard";
import { LoggerService } from "src/logger/logger.service";
import { MbctokenService } from "src/bussinesCentral/services/mbctoken/mbctoken.service";

describe("TrabajadoresController - generarQR", () => {
  let controller: TrabajadoresController;

  beforeEach(async () => {
    const mockTrabajadorService = {
      getTrabajadores: jest.fn(),
      getTrabajadorByAppId: jest.fn(),
      getTrabajadorBySqlId: jest.fn(),
    };

    const mockLoggerService = {
      create: jest.fn(),
    };

    const mockMbcTokenService = {
      getToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajadoresController],
      providers: [
        {
          provide: TrabajadorService,
          useValue: mockTrabajadorService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: MbctokenService,
          useValue: mockMbcTokenService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TrabajadoresController>(TrabajadoresController);
  });

  describe("generarQR", () => {
    it("debe retornar error cuando falta el parámetro id", async () => {
      const mockRequest = { id: null as any, tokenQR: "test-token-123" };

      const result = await controller.generarQR(mockRequest);

      expect(result).toEqual({
        ok: false,
        message: "Faltan parámetros requeridos: id y tokenQR",
      });
    });

    it("debe retornar error cuando falta el parámetro tokenQR", async () => {
      const mockRequest = { id: 123, tokenQR: "" };

      const result = await controller.generarQR(mockRequest);

      expect(result).toEqual({
        ok: false,
        message: "Faltan parámetros requeridos: id y tokenQR",
      });
    });

    it("debe retornar error cuando faltan ambos parámetros", async () => {
      const mockRequest = { id: null as any, tokenQR: "" };

      const result = await controller.generarQR(mockRequest);

      expect(result).toEqual({
        ok: false,
        message: "Faltan parámetros requeridos: id y tokenQR",
      });
    });

    it("debe retornar error cuando id es 0", async () => {
      const mockRequest = { id: 0, tokenQR: "test-token-123" };

      const result = await controller.generarQR(mockRequest);

      expect(result).toEqual({
        ok: false,
        message: "Faltan parámetros requeridos: id y tokenQR",
      });
    });
  });
});
