import { Test, TestingModule } from "@nestjs/testing";
import { UpdateTrabajadorOrganizacionUseCase } from "./UpdateTrabajadorOrganizacion.use-case";
import { ITrabajadorRepository } from "../repository/interfaces/ITrabajador.repository";
import { PrismaService } from "../../prisma/prisma.service";
import { IUpdateTrabajadorOrganizacionDto } from "./interfaces/IUpdateTrabajadorOrganizacion.use-case";

describe("UpdateTrabajadorOrganizacionUseCase", () => {
  let useCase: UpdateTrabajadorOrganizacionUseCase;
  let trabajadorRepository: jest.Mocked<ITrabajadorRepository>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockTrabajador = {
    id: 1,
    nombreApellidos: "Test User",
    displayName: "testuser",
    emails: "test@example.com",
    dni: "12345678A",
    direccion: "Test Address",
    ciudad: "Test City",
    telefonos: "123456789",
    fechaNacimiento: new Date("1990-01-01"),
    nacionalidad: "Español",
    nSeguridadSocial: "123456789",
    codigoPostal: "12345",
    idResponsable: null,
    idTienda: 1,
    llevaEquipo: false,
    empresaId: "1",
    tipoTrabajador: "Dependiente",
    createdAt: new Date(),
    updatedAt: new Date(),
    idApp: null,
    tokenQR: null,
    inicioContrato: new Date(),
    roles: [],
    permisos: [],
    tienda: null,
    empresa: null,
    responsable: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTrabajadorOrganizacionUseCase,
        {
          provide: ITrabajadorRepository,
          useValue: {
            updateOne: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            trabajador: {
              update: jest.fn().mockResolvedValue(mockTrabajador),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateTrabajadorOrganizacionUseCase>(UpdateTrabajadorOrganizacionUseCase);
    trabajadorRepository = module.get(ITrabajadorRepository);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
  });

  it("should update trabajador organization successfully", async () => {
    const updateDto: IUpdateTrabajadorOrganizacionDto = {
      id: 1,
      arrayRoles: ["role1", "role2"],
      arrayPermisos: ["permiso1", "permiso2"],
      idResponsable: 2,
      idTienda: 1,
      llevaEquipo: true,
      empresaId: "1",
      tipoTrabajador: "Supervisor",
    };

    const result = await useCase.execute(updateDto);

    expect(result).toEqual(mockTrabajador);
    expect(prismaService.trabajador.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        idResponsable: 2,
        idTienda: 1,
        llevaEquipo: true,
        empresaId: "1",
        tipoTrabajador: "Supervisor",
        roles: { set: [{ id: "role1" }, { id: "role2" }] },
        permisos: { set: [{ id: "permiso1" }, { id: "permiso2" }] },
      },
      include: {
        roles: true,
        permisos: true,
        tienda: true,
        empresa: true,
        responsable: true,
      },
    });
  });

  it("should handle empty roles and permisos arrays", async () => {
    const updateDto: IUpdateTrabajadorOrganizacionDto = {
      id: 1,
      arrayRoles: [],
      arrayPermisos: [],
      llevaEquipo: false,
    };

    const result = await useCase.execute(updateDto);

    expect(result).toEqual(mockTrabajador);
    expect(prismaService.trabajador.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        llevaEquipo: false,
        roles: { set: [] },
        permisos: { set: [] },
      },
      include: {
        roles: true,
        permisos: true,
        tienda: true,
        empresa: true,
        responsable: true,
      },
    });
  });

  it("should handle undefined roles and permisos", async () => {
    const updateDto: IUpdateTrabajadorOrganizacionDto = {
      id: 1,
      llevaEquipo: true,
      tipoTrabajador: "Gerente",
    };

    const result = await useCase.execute(updateDto);

    expect(result).toEqual(mockTrabajador);
    expect(prismaService.trabajador.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        llevaEquipo: true,
        tipoTrabajador: "Gerente",
      },
      include: {
        roles: true,
        permisos: true,
        tienda: true,
        empresa: true,
        responsable: true,
      },
    });
  });
});