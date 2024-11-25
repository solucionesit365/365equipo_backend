import { Test, TestingModule } from "@nestjs/testing";
import { PactadoVsRealController } from "./pactado-vs-real.controller";

describe("PactadoVsRealController", () => {
  let controller: PactadoVsRealController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PactadoVsRealController],
    }).compile();

    controller = module.get<PactadoVsRealController>(PactadoVsRealController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
