import { Test, TestingModule } from "@nestjs/testing";
import { TrabajadorService } from "./trabajador.service";
import { TOmneTrabajador } from "./trabajador.interface";
import { ITrabajadorDatabaseService } from "./trabajador.interface";
import { FirebaseService } from "../firebase/firebase.service";
import { EmailService } from "../email/email.class";
import { TSolicitudVacacionesService } from "../solicitud-vacaciones/solicitud-vacaciones.interface";
import { TDiaPersonalService } from "../dia-personal/dia-personal.interface";
import { InternalServerErrorException } from "@nestjs/common";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";

describe("TrabajadorService", () => {
  let service: TrabajadorService;
  let mockTrabajadorDatabase: Partial<ITrabajadorDatabaseService>;
  let mockFirebaseService: Partial<FirebaseService>;
  let mockEmailService: Partial<EmailService>;
  let mockSolicitudesVacaciones: Partial<TSolicitudVacacionesService>;
  let mockDiaPersonal: Partial<TDiaPersonalService>;

  beforeEach(async () => {
    // Crear mocks parciales - solo los métodos que necesitamos
    mockTrabajadorDatabase = {
      crearTrabajador: jest.fn(),
      getTrabajadoresOmne: jest.fn(),
      getAllTrabajadores: jest.fn(),
      actualizarTrabajadoresLote: jest.fn(),
      createManyTrabajadores: jest.fn(),
      deleteManyTrabajadores: jest.fn(),
      getTrabajadorByAppId: jest.fn(),
      getTrabajadorBySqlId: jest.fn(),
      getTrabajadorByDni: jest.fn(),
      getTrabajadores: jest.fn(),
      setIdApp: jest.fn(),
      guardarCambiosForm: jest.fn(),
      borrarTrabajador: jest.fn(),
      uploadFoto: jest.fn(),
      findTrabajadorByEmailLike: jest.fn(),
      borrarConFechaBaja: jest.fn(),
      deleteTrabajador: jest.fn(),
    };

    mockFirebaseService = {
      auth: {
        createUser: jest.fn(),
        generateEmailVerificationLink: jest.fn(),
        deleteUser: jest.fn(),
      } as any,
    };

    mockEmailService = {
      enviarEmail: jest.fn(),
      generarEmailTemplate: jest.fn(),
    };

    mockSolicitudesVacaciones = {
      haySolicitudesParaBeneficiario: jest.fn(),
      actualizarIdAppResponsable: jest.fn(),
    };

    mockDiaPersonal = {
      haySolicitudesParaBeneficiarioDiaPersonal: jest.fn(),
      actualizarIdAppResponsableDiaPersonal: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrabajadorService,
        {
          provide: ITrabajadorDatabaseService,
          useValue: mockTrabajadorDatabase,
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: TSolicitudVacacionesService,
          useValue: mockSolicitudesVacaciones,
        },
        {
          provide: TDiaPersonalService,
          useValue: mockDiaPersonal,
        },
      ],
    }).compile();

    service = module.get<TrabajadorService>(TrabajadorService);
  });

  describe("crearTrabajador", () => {
    it("debe crear un trabajador correctamente", async () => {
      const mockRequest = {
        dni: "12345678A",
        nombreApellidos: "Juan Pérez",
        emails: "juan@example.com",
      } as any;

      (mockTrabajadorDatabase.crearTrabajador as jest.Mock).mockResolvedValue(
        true,
      );

      const result = await service.crearTrabajador(mockRequest);

      expect(result).toBe(true);
      expect(mockTrabajadorDatabase.crearTrabajador).toHaveBeenCalledWith(
        mockRequest,
      );
    });
  });

  describe("getTrabajadoresModificadosOmne", () => {
    it("debe procesar y normalizar trabajadores de Omne", async () => {
      const mockTrabajadoresRaw = [
        {
          empresaID: "EMP001",
          trabajadores: [
            {
              documento: " 12345678a ",
              nombre: "Juan",
              apellidosYNombre: "Juan Pérez",
            },
          ],
        },
      ];

      (
        mockTrabajadorDatabase.getTrabajadoresOmne as jest.Mock
      ).mockResolvedValue(mockTrabajadoresRaw);

      const result = await service.getTrabajadoresModificadosOmne();

      expect(result).toHaveLength(1);
      expect(result[0].documento).toBe("12345678A"); // Normalizado
      expect(result[0].empresaID).toBe("EMP001");
    });
  });

  describe("getCambiosDetectados", () => {
    const trabajadoresApp: Prisma.TrabajadorGetPayload<{
      include: { contratos: true };
    }>[] = [
      {
        id: 1,
        nPerceptor: 123,
        dni: "DNIJUANPEREZ",
        nombreApellidos: "Juan Pérez Garcíaa",
        emails: "juanperezOLD@gmail.com",
        idApp: "firebase-uid-123",
        ciudad: "Barcelona",
        codigoPostal: "08001",
        contratos: [],
        cuentaCorriente: "ES12345678901234567890",
        direccion: "Calle Falsa 123",
        displayFoto: "https://example.com/foto.jpg",
        displayName: "Juan Pérez",
        dispositivo: "Android",
        empresaId: "EMP001",
        esTienda: false,
        excedencia: false,
        fechaNacimiento: new Date("1990-01-01"),
        idResponsable: 123,
        idTienda: 123,
        llevaEquipo: false,
        nacionalidad: "ES",
        nSeguridadSocial: "123456789012",
        telefonos: "600000000",
        tipoTrabajador: "empleado",
        tokenQR: "token-qr",
      },
      {
        id: 2,
        nPerceptor: 2,
        dni: "DNIRAKITIC",
        nombreApellidos: "Ivan Rakitic",
        emails: "ivanrakitic@gmail.com",
        idApp: "firebase-uid-123",
        ciudad: "Barcelona",
        codigoPostal: "08001",
        contratos: [],
        cuentaCorriente: "ES12345678901234567890",
        direccion: "Calle Falsa 123",
        displayFoto: "https://example.com/foto.jpg",
        displayName: "Ivan Rakitic",
        dispositivo: "Android",
        empresaId: "EMP001",
        esTienda: false,
        excedencia: false,
        fechaNacimiento: new Date("1990-01-01"),
        idResponsable: 123,
        idTienda: 123,
        llevaEquipo: false,
        nacionalidad: "ES",
        nSeguridadSocial: "123456789012",
        telefonos: "600000000",
        tipoTrabajador: "empleado",
        tokenQR: "token-qr",
      },
    ];

    const trabajadoresOmne: TOmneTrabajador[] = [
      {
        noPerceptor: "1",
        documento: "DNIJUANPEREZ",
        email: "juan@new.com",
        apellidosYNombre: "Juan Pérez García",
        nombre: "Juan",
        noTelfMovilPersonal: "600000000",
        viaPublica: "Calle Vieja",
        numero: "1",
        piso: "",
        poblacion: "Madrid",
        codPaisNacionalidad: "ES",
        cp: "28001",
        noAfiliacion: "123456789012",
        fechaNacimiento: DateTime.fromISO("1990-01-01"),
        altaContrato: "2023-01-01",
        antiguedadEmpresa: "2023-01-01",
        bajaEmpresa: "0001-01-01",
        horassemana: 40,
        empresaID: "EMP001",
        auxiliaryIndex1: "aux1",
        auxiliaryIndex2: 2,
        auxiliaryIndex3: "aux3",
        auxiliaryIndex4: "aux4",
        cambioAntiguedad: "2023-01-01",
        categoria: "Categoria A",
        tipoContrato: "Indefinido",
        centroTrabajo: "Centro A",
        descripcionCentro: "Descripción Centro A",
        fechaCalculoAntiguedad: "2023-01-01",
        nacionalidad: 1,
        systemCreatedAt: "2023-01-01",
        systemModifiedAt: "2023-01-01",
      },
      {
        documento: "DNIMESSI",
        noPerceptor: "3",
        apellidosYNombre: "Lionel Messi Cuccittini",
        nombre: "Lionel",
        email: "leomessi@gmail.com",
        noTelfMovilPersonal: "600000000",
        viaPublica: "Calle Vieja",
        numero: "1",
        piso: "",
        poblacion: "Madrid",
        codPaisNacionalidad: "ES",
        cp: "28001",
        noAfiliacion: "7565464",
        fechaNacimiento: DateTime.fromISO("1990-01-01"),
        altaContrato: "2023-01-01",
        antiguedadEmpresa: "2023-01-01",
        bajaEmpresa: "0001-01-01",
        horassemana: 40,
        empresaID: "EMP001",
        auxiliaryIndex1: "aux1",
        auxiliaryIndex2: 2,
        auxiliaryIndex3: "aux3",
        auxiliaryIndex4: "aux4",
        cambioAntiguedad: "2023-01-01",
        categoria: "Categoria A",
        tipoContrato: "Indefinido",
        centroTrabajo: "Centro A",
        descripcionCentro: "Descripción Centro A",
        fechaCalculoAntiguedad: "2023-01-01",
        nacionalidad: 1,
        systemCreatedAt: "2023-01-01",
        systemModifiedAt: "2023-01-01",
      },
    ];

    it("debe detectar cambios entre trabajadores App y Omne", async () => {
      const result = service.getCambiosDetectados(
        trabajadoresApp,
        trabajadoresOmne,
      );

      expect(result.modificar).toHaveLength(1);
      expect(result.modificar[0].cambios.nombreApellidos).toBe(
        "Juan Pérez García",
      );
      expect(result.modificar[0].cambios.emails).toBe("juan@new.com");
      expect(result.crear).toHaveLength(1);
      expect(result.eliminar).toHaveLength(1);
    });

    it("debe detectar trabajadores a crear", async () => {
      const trabajadoresApp: Prisma.TrabajadorGetPayload<{
        include: { contratos: true };
      }>[] = [];

      const trabajadoresOmne: TOmneTrabajador[] = [
        {
          documento: "DNIMESSI",
          noPerceptor: "3",
          apellidosYNombre: "Lionel Messi Cuccittini",
          nombre: "Lionel",
          email: "leomessi@gmail.com",
          noTelfMovilPersonal: "600000000",
          viaPublica: "Calle Vieja",
          numero: "1",
          piso: "",
          poblacion: "Madrid",
          codPaisNacionalidad: "ES",
          cp: "28001",
          noAfiliacion: "7565464",
          fechaNacimiento: DateTime.fromISO("1990-01-01"),
          altaContrato: "2023-01-01",
          antiguedadEmpresa: "2023-01-01",
          bajaEmpresa: "0001-01-01",
          horassemana: 40,
          empresaID: "EMP001",
          auxiliaryIndex1: "aux1",
          auxiliaryIndex2: 2,
          auxiliaryIndex3: "aux3",
          auxiliaryIndex4: "aux4",
          cambioAntiguedad: "2023-01-01",
          categoria: "Categoria A",
          tipoContrato: "Indefinido",
          centroTrabajo: "Centro A",
          descripcionCentro: "Descripción Centro A",
          fechaCalculoAntiguedad: "2023-01-01",
          nacionalidad: 1,
          systemCreatedAt: "2023-01-01",
          systemModifiedAt: "2023-01-01",
        },
      ];
      const result = service.getCambiosDetectados(
        trabajadoresApp,
        trabajadoresOmne,
      );

      expect(result.crear).toHaveLength(1);
      expect(result.crear[0].dni).toBe("DNIMESSI");
      expect(result.modificar).toHaveLength(0);
      expect(result.eliminar).toHaveLength(0);
    });

    it("debe detectar trabajadores a eliminar", async () => {
      const trabajadoresOmne = [];
      const trabajadoresApp: Prisma.TrabajadorGetPayload<{
        include: { contratos: true };
      }>[] = [
        {
          id: 2,
          nPerceptor: 2,
          dni: "DNIRAKITIC",
          nombreApellidos: "Ivan Rakitic",
          emails: "ivanrakitic@gmail.com",
          idApp: "firebase-uid-123",
          ciudad: "Barcelona",
          codigoPostal: "08001",
          contratos: [],
          cuentaCorriente: "ES12345678901234567890",
          direccion: "Calle Falsa 123",
          displayFoto: "https://example.com/foto.jpg",
          displayName: "Ivan Rakitic",
          dispositivo: "Android",
          empresaId: "EMP001",
          esTienda: false,
          excedencia: false,
          fechaNacimiento: new Date("1990-01-01"),
          idResponsable: 123,
          idTienda: 123,
          llevaEquipo: false,
          nacionalidad: "ES",
          nSeguridadSocial: "123456789012",
          telefonos: "600000000",
          tipoTrabajador: "empleado",
          tokenQR: "token-qr",
        },
      ];

      const result = service.getCambiosDetectados(
        trabajadoresApp,
        trabajadoresOmne,
      );

      expect(result.eliminar).toHaveLength(1);
      expect(result.eliminar[0].dni).toBe("DNIRAKITIC");
      expect(result.crear).toHaveLength(0);
      expect(result.modificar).toHaveLength(0);
    });
  });

  describe("registrarUsuario", () => {
    it("debe registrar un usuario correctamente", async () => {
      const mockTrabajador = {
        id: 1,
        dni: "12345678A",
        displayName: "Juan Pérez",
        emails: "juan@example.com;juan2@example.com",
        telefonos: "600000000",
        contratos: [
          {
            inicioContrato: new Date("2023-01-01"),
          },
        ],
      };

      const mockUsuarioCreado = {
        uid: "firebase-uid-123",
        email: "juan@example.com",
      };

      (
        mockTrabajadorDatabase.getTrabajadorByDni as jest.Mock
      ).mockResolvedValue(mockTrabajador);
      (mockFirebaseService.auth.createUser as jest.Mock).mockResolvedValue(
        mockUsuarioCreado,
      );
      (
        mockFirebaseService.auth.generateEmailVerificationLink as jest.Mock
      ).mockResolvedValue("https://verify-link.com");
      (mockEmailService.enviarEmail as jest.Mock).mockResolvedValue({
        accepted: ["juan@example.com"],
      });

      const result = await service.registrarUsuario("12345678A", "password123");

      expect(result).toBe("juan@example.com");
      expect(mockTrabajadorDatabase.setIdApp).toHaveBeenCalledWith(
        1,
        "firebase-uid-123",
      );
      expect(mockEmailService.enviarEmail).toHaveBeenCalled();
    });

    it("debe lanzar error si no hay teléfono", async () => {
      const mockTrabajador = {
        id: 1,
        dni: "12345678A",
        emails: "juan@example.com",
        telefonos: null,
        contratos: [{ inicioContrato: new Date() }],
      };

      (
        mockTrabajadorDatabase.getTrabajadorByDni as jest.Mock
      ).mockResolvedValue(mockTrabajador);

      await expect(
        service.registrarUsuario("12345678A", "password123"),
      ).rejects.toThrow("Teléfono no registrado en la ficha");
    });
  });

  describe("getTrabajadorByAppId", () => {
    it("debe retornar trabajador si existe", async () => {
      const mockTrabajador = { id: 1, dni: "12345678A" };
      (
        mockTrabajadorDatabase.getTrabajadorByAppId as jest.Mock
      ).mockResolvedValue(mockTrabajador);

      const result = await service.getTrabajadorByAppId("uid-123");

      expect(result).toEqual(mockTrabajador);
    });

    it("debe lanzar InternalServerErrorException si no existe", async () => {
      (
        mockTrabajadorDatabase.getTrabajadorByAppId as jest.Mock
      ).mockResolvedValue(null);

      await expect(service.getTrabajadorByAppId("uid-123")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("borrarTrabajador", () => {
    it("debe borrar trabajador de Firebase y SQL", async () => {
      const mockTrabajador = {
        id: 1,
        idApp: "firebase-uid-123",
        dni: "12345678A",
      };

      (
        mockTrabajadorDatabase.getTrabajadorBySqlId as jest.Mock
      ).mockResolvedValue(mockTrabajador);
      (mockFirebaseService.auth.deleteUser as jest.Mock).mockResolvedValue(
        undefined,
      );
      (mockTrabajadorDatabase.borrarTrabajador as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.borrarTrabajador(1);

      expect(mockFirebaseService.auth.deleteUser).toHaveBeenCalledWith(
        "firebase-uid-123",
      );
      expect(mockTrabajadorDatabase.borrarTrabajador).toHaveBeenCalledWith(1);
    });

    it("debe borrar solo de SQL si no tiene idApp", async () => {
      const mockTrabajador = {
        id: 1,
        idApp: null,
        dni: "12345678A",
      };

      (
        mockTrabajadorDatabase.getTrabajadorBySqlId as jest.Mock
      ).mockResolvedValue(mockTrabajador);

      await service.borrarTrabajador(1);

      expect(mockFirebaseService.auth.deleteUser).not.toHaveBeenCalled();
      expect(mockTrabajadorDatabase.borrarTrabajador).toHaveBeenCalledWith(1);
    });
  });

  describe("permitirRegistro", () => {
    it("debe retornar true si encuentra trabajador con email", async () => {
      (
        mockTrabajadorDatabase.findTrabajadorByEmailLike as jest.Mock
      ).mockResolvedValue([{ id: 1, emails: "juan@example.com" }]);

      const result = await service.permitirRegistro("JUAN@EXAMPLE.COM ");

      expect(result).toBe(true);
      expect(
        mockTrabajadorDatabase.findTrabajadorByEmailLike,
      ).toHaveBeenCalledWith("juan@example.com");
    });

    it("debe retornar false si no encuentra trabajador", async () => {
      (
        mockTrabajadorDatabase.findTrabajadorByEmailLike as jest.Mock
      ).mockResolvedValue([]);

      const result = await service.permitirRegistro("noexiste@example.com");

      expect(result).toBe(false);
    });
  });
});
