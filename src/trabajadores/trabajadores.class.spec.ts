import { Test, TestingModule } from "@nestjs/testing";
import { TrabajadorService } from "./trabajadores.class";
import { FirebaseService } from "../firebase/firebase.service";
import { PermisosService } from "../permisos/permisos.class";
import { EmailService } from "../email/email.class";
import { SolicitudesVacacionesService } from "../solicitud-vacaciones/solicitud-vacaciones.class";
import { DiaPersonalClass } from "../dia-personal/dia-personal.class";
import { TrabajadorDatabaseService } from "./trabajadores.database";

describe("TrabajadorService", () => {
  let service: TrabajadorService;
  let mockDatabaseService: jest.Mocked<TrabajadorDatabaseService>;

  beforeEach(async () => {
    // Crear mocks para todas las dependencias
    const mockFirebaseService = {
      auth: {
        createUser: jest.fn(),
        generateEmailVerificationLink: jest.fn(),
      },
    };

    const mockPermisosService = {};
    const mockEmailService = {
      enviarEmail: jest.fn(),
    };
    const mockSolicitudesVacaciones = {};
    const mockDiaPersonal = {};

    // Mock del servicio de base de datos
    mockDatabaseService = {
      getTrabajadoresOmne: jest.fn(),
      getAllTrabajadores: jest.fn(),
      actualizarTrabajadoresLote: jest.fn(),
      createManyTrabajadores: jest.fn(),
      deleteManyTrabajadores: jest.fn(),
      getTrabajadorByDni: jest.fn(),
      setIdApp: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadorService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: PermisosService,
          useValue: mockPermisosService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: SolicitudesVacacionesService,
          useValue: mockSolicitudesVacaciones,
        },
        {
          provide: DiaPersonalClass,
          useValue: mockDiaPersonal,
        },
        {
          provide: TrabajadorDatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<TrabajadorService>(TrabajadorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCambiosDetectados", () => {
    it("debería detectar cambios en trabajadores existentes", () => {
      // Arrange
      const trabajadoresApp = [
        {
          dni: "12345678A",
          nombreApellidos: "Juan Pérez",
          emails: "juan@old.com",
          contratos: [{ id: "1", horasContrato: 100 }],
        },
      ];

      const trabajadoresOmne = [
        {
          documento: "12345678A",
          apellidosYNombre: "Juan Pérez García", // Cambió
          email: "juan@new.com", // Cambió
          altaContrato: "2024-01-01",
          antiguedadEmpresa: "2024-01-01",
          horassemana: 40,
          bajaEmpresa: "0001-01-01",
          empresaID: "empresa-1",
        },
      ];

      // Act
      const resultado = service.getCambiosDetectados(
        trabajadoresApp as any,
        trabajadoresOmne as any,
      );

      // Assert
      expect(resultado.modificar).toHaveLength(1);
      expect(resultado.modificar[0].cambios).toEqual({
        nombreApellidos: "Juan Pérez García",
        emails: "juan@new.com",
      });
      expect(resultado.crear).toHaveLength(0);
      expect(resultado.eliminar).toHaveLength(0);
    });

    it("debería detectar trabajadores nuevos", () => {
      // Arrange
      const trabajadoresApp = [];
      const trabajadoresOmne = [
        {
          documento: "87654321B",
          apellidosYNombre: "María López",
          email: "maria@email.com",
          altaContrato: "2024-01-01",
          antiguedadEmpresa: "2024-01-01",
          horassemana: 40,
          bajaEmpresa: "0001-01-01",
          empresaID: "empresa-1",
          // ... otros campos necesarios
        },
      ];

      // Act
      const resultado = service.getCambiosDetectados(
        trabajadoresApp as any,
        trabajadoresOmne as any,
      );

      // Assert
      expect(resultado.crear).toHaveLength(1);
      expect(resultado.crear[0].dni).toBe("87654321B");
      expect(resultado.modificar).toHaveLength(0);
      expect(resultado.eliminar).toHaveLength(0);
    });
  });

  describe("registrarUsuario", () => {
    it("debería registrar un usuario correctamente", async () => {
      // Arrange
      const dni = "12345678A";
      const password = "password123";
      const mockTrabajador = {
        id: 1,
        emails: "test@email.com",
        telefonos: "600000000",
        displayName: "Test User",
        contratos: [{ inicioContrato: new Date() }],
      };

      mockDatabaseService.getTrabajadorByDni.mockResolvedValue(
        mockTrabajador as any,
      );

      // Act
      const result = await service.registrarUsuario(dni, password);

      // Assert
      expect(mockDatabaseService.getTrabajadorByDni).toHaveBeenCalledWith(
        "12345678A",
      );
      expect(result).toBe("test@email.com");
    });

    it("debería lanzar error si no hay teléfono", async () => {
      // Arrange
      const mockTrabajador = {
        emails: "test@email.com",
        telefonos: null,
        contratos: [{ inicioContrato: new Date() }],
      };

      mockDatabaseService.getTrabajadorByDni.mockResolvedValue(
        mockTrabajador as any,
      );

      // Act & Assert
      await expect(
        service.registrarUsuario("12345678A", "password"),
      ).rejects.toThrow("Teléfono no registrado en la ficha");
    });
  });
});
