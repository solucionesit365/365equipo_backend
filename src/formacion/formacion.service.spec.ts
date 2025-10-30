import { Test, TestingModule } from "@nestjs/testing";
import { FormacionService } from "./formacion.service";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.class";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

describe("FormacionService", () => {
  let service: FormacionService;
  let prismaService: any;
  let emailService: any;

  beforeEach(async () => {
    const mockPrismaService = {
      formacion: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockEmailService = {
      generarEmailTemplate: jest.fn(),
      enviarEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormacionService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<FormacionService>(FormacionService);
    prismaService = module.get(PrismaService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getFormaciones", () => {
    it("debe obtener formaciones por departamento", async () => {
      const mockFormaciones = [
        { id: "1", name: "Formación 1", department: "PRL" },
        { id: "2", name: "Formación 2", department: "PRL" },
      ];

      prismaService.formacion.findMany.mockResolvedValue(mockFormaciones);

      const result = await service.getFormaciones({ status: "PRL" });

      expect(prismaService.formacion.findMany).toHaveBeenCalledWith({
        where: { department: "PRL" },
      });
      expect(result).toEqual(mockFormaciones);
    });

    it("debe lanzar InternalServerErrorException en caso de error", async () => {
      prismaService.formacion.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(
        service.getFormaciones({ status: "PRL" }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe("getFormacionById", () => {
    it("debe obtener una formación por ID con sus pasos", async () => {
      const mockFormacion = {
        id: "1",
        name: "Formación Test",
        pasos: [
          { id: "p1", name: "Paso 1" },
          { id: "p2", name: "Paso 2" },
        ],
      };

      prismaService.formacion.findUnique.mockResolvedValue(mockFormacion);

      const result = await service.getFormacionById({ id: "1" });

      expect(prismaService.formacion.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: { pasos: true },
      });
      expect(result).toEqual(mockFormacion);
    });

    it("debe lanzar InternalServerErrorException en caso de error", async () => {
      prismaService.formacion.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.getFormacionById({ id: "1" })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("createFormacion", () => {
    it("debe crear una nueva formación con pasos", async () => {
      const createDto: any = {
        name: "Nueva Formación",
        department: "PRL",
        description: "Descripción",
        nPasos: 2,
        pasos: [
          {
            resourceId: "r1",
            name: "Paso 1",
            description: "Desc 1",
            type: "VIDEO_FORMATIVO",
          },
          {
            resourceId: "r2",
            name: "Paso 2",
            description: "Desc 2",
            type: "DOCUMENTO_PARA_FIRMAR",
          },
        ],
      };

      const mockCreatedFormacion = { id: "1", ...createDto };
      prismaService.formacion.create.mockResolvedValue(mockCreatedFormacion);

      const result = await service.createFormacion(createDto);

      expect(prismaService.formacion.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedFormacion);
    });

    it("debe lanzar InternalServerErrorException en caso de error", async () => {
      const createDto: any = {
        name: "Nueva Formación",
        department: "PRL",
        description: "Descripción",
        nPasos: 0,
        pasos: [],
      };

      prismaService.formacion.create.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.createFormacion(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("deleteFormacion", () => {
    it("debe eliminar una formación existente", async () => {
      const mockFormacion = { id: "1", name: "Formación a eliminar" };
      prismaService.formacion.findUnique.mockResolvedValue(mockFormacion);
      prismaService.formacion.delete.mockResolvedValue(mockFormacion);

      await service.deleteFormacion("1");

      expect(prismaService.formacion.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(prismaService.formacion.delete).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("debe manejar error cuando la formación no existe", async () => {
      prismaService.formacion.findUnique.mockResolvedValue(null);

      await expect(service.deleteFormacion("999")).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("debe lanzar InternalServerErrorException en caso de error", async () => {
      prismaService.formacion.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(service.deleteFormacion("1")).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("updateFormacion", () => {
    it("debe actualizar una formación existente", async () => {
      const updateDto = {
        id: "1",
        name: "Formación Actualizada",
        department: "PRL" as any,
        description: "Nueva descripción",
        nPasos: 1,
      };

      const existingFormacion = { id: "1", name: "Formación Original" };
      const updatedFormacion = { ...existingFormacion, ...updateDto };

      prismaService.formacion.findUnique.mockResolvedValue(existingFormacion);
      prismaService.formacion.update.mockResolvedValue(updatedFormacion);

      const result = await service.updateFormacion(updateDto);

      expect(prismaService.formacion.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(prismaService.formacion.update).toHaveBeenCalled();
      expect(result).toEqual(updatedFormacion);
    });

    it("debe manejar error cuando la formación no existe", async () => {
      const updateDto = {
        id: "999",
        name: "Formación",
        department: "PRL" as any,
        description: "Desc",
        nPasos: 1,
      };

      prismaService.formacion.findUnique.mockResolvedValue(null);

      await expect(service.updateFormacion(updateDto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("compartirFormacionManual", () => {
    it("debe compartir formación a un trabajador manual", async () => {
      const data: any = {
        formacionId: "1",
        trabajador: {
          id: 1,
          nombreApellidos: "Juan Pérez",
          email: "juan@example.com",
          telefono: "123456789",
        },
      };

      const mockFormacion = {
        id: "1",
        name: "Formación Test",
        pasos: [],
      };

      prismaService.formacion.findUnique.mockResolvedValue(mockFormacion);
      emailService.generarEmailTemplate.mockReturnValue("<html>Email</html>");
      emailService.enviarEmail.mockResolvedValue(undefined);

      const result = await service.compartirFormacionManual(data);

      expect(prismaService.formacion.findUnique).toHaveBeenCalled();
      expect(emailService.generarEmailTemplate).toHaveBeenCalled();
      expect(emailService.enviarEmail).toHaveBeenCalledWith(
        "juan@example.com",
        expect.any(String),
        expect.stringContaining("Formación Test"),
      );
      expect(result.mensaje).toBe("Formación compartida correctamente");
    });

    it("debe manejar error cuando la formación no existe", async () => {
      const data: any = {
        formacionId: "999",
        trabajador: {
          id: 1,
          nombreApellidos: "Juan Pérez",
          email: "juan@example.com",
          telefono: "123456789",
        },
      };

      prismaService.formacion.findUnique.mockResolvedValue(null);

      await expect(service.compartirFormacionManual(data)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("compartirFormacionGrupo", () => {
    it("debe compartir formación a múltiples trabajadores", async () => {
      const data: any = {
        formacionId: "1",
        trabajadores: [
          { id: 1, nombreApellidos: "Juan Pérez", email: "juan@example.com", telefono: "123" },
          { id: 2, nombreApellidos: "María García", email: "maria@example.com", telefono: "456" },
        ],
      };

      const mockFormacion = {
        id: "1",
        name: "Formación Grupal",
        pasos: [],
      };

      prismaService.formacion.findUnique.mockResolvedValue(mockFormacion);
      emailService.generarEmailTemplate.mockReturnValue("<html>Email</html>");
      emailService.enviarEmail.mockResolvedValue(undefined);

      const result = await service.compartirFormacionGrupo(data);

      expect(prismaService.formacion.findUnique).toHaveBeenCalled();
      expect(emailService.enviarEmail).toHaveBeenCalledTimes(2);
      expect(result.mensaje).toContain("2 emails enviados correctamente");
      expect(result.detalles).toHaveLength(2);
    });

    it("debe manejar errores al enviar emails", async () => {
      const data: any = {
        formacionId: "1",
        trabajadores: [
          { id: 1, nombreApellidos: "Juan Pérez", email: "juan@example.com", telefono: "123" },
          { id: 2, nombreApellidos: "Email Inválido", email: "invalido", telefono: "456" },
        ],
      };

      const mockFormacion = {
        id: "1",
        name: "Formación Test",
        pasos: [],
      };

      prismaService.formacion.findUnique.mockResolvedValue(mockFormacion);
      emailService.generarEmailTemplate.mockReturnValue("<html>Email</html>");
      emailService.enviarEmail
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error("Email inválido"));

      const result = await service.compartirFormacionGrupo(data);

      expect(result.mensaje).toContain("1 emails enviados correctamente");
      expect(result.mensaje).toContain("1 fallos");
    });
  });
});
