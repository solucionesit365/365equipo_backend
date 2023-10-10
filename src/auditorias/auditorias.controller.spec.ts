import { Test, TestingModule } from "@nestjs/testing";
import { AuditoriasController } from "./auditorias.controller";

describe("AuditoriasController", () => {
  let controller: AuditoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriasController],
    }).compile();

    controller = module.get<AuditoriasController>(AuditoriasController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
