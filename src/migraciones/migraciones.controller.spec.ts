import { Test, TestingModule } from "@nestjs/testing";
import { MigracionesController } from "./migraciones.controller";

describe("MigracionesController", () => {
  let controller: MigracionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MigracionesController],
    }).compile();

    controller = module.get<MigracionesController>(MigracionesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
