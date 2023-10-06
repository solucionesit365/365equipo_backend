import { Test, TestingModule } from "@nestjs/testing";
import { FichajesValidadosController } from "./fichajes-validados.controller";

describe("FichajesValidadosController", () => {
  let controller: FichajesValidadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FichajesValidadosController],
    }).compile();

    controller = module.get<FichajesValidadosController>(
      FichajesValidadosController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
