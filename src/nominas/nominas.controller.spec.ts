import { Test, TestingModule } from "@nestjs/testing";
import { NominasController } from "./nominas.controller";

describe("NominasController", () => {
  let controller: NominasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NominasController],
    }).compile();

    controller = module.get<NominasController>(NominasController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
